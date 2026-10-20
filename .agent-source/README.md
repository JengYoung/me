# AI 지침과 스킬 관리

공통 행동 계약을 원천에 두고, Codex와 Claude Code의 지침을 각각 작성한 어댑터로 생성한다. 두 도구의 목적·입력·제약은 유지하면서 로딩 구조, 호출 방법, 권한 처리, 메타데이터는 구분한다.

## 사용

Node.js 24 이상이 필요하다. 패키지 설치 없이 프로젝트 루트에서 실행한다. 환경에 별도 셸 실행 규칙이 있으면 함께 따른다.

```sh
node scripts/sync-instructions.mjs --check
node scripts/sync-instructions.mjs --write
node --test scripts/sync-instructions.test.mjs scripts/instruction-hooks.test.mjs
node scripts/check-instruction-runtime.mjs
node scripts/benchmark-instruction-hooks.mjs
```

첫 명령은 읽기 전용 검사다. 재생성이 필요하면 두 번째 명령 후 다시 검사한다. 생성기 변경에는 테스트를, 경로·스킬 메타데이터·hook 변경에는 런타임 검사를 추가한다. 런타임 검사는 `--codex` 또는 `--claude`로 한 도구만 선택할 수도 있다. 마지막 명령은 생성된 hook 명령만 로컬에서 실행하여 텍스트 크기와 실행 시간을 측정한다.

현재 Claude Code는 **로그인 만료 = 잠정 보류**다. 지침·스킬 생성과 정적 검사는 유지한다. `targets.json`의 Claude `runtime.status`가 `deferred`이므로 런타임 검사에서도 버전 조회를 포함한 Claude CLI 실행을 건너뛴다. `--claude`를 지정해도 보류가 해제되지 않는다. 사용자가 재개를 요청하기 전에는 인증 복구나 결제 변경을 시도하지 않는다. 재개 요청이 있을 때만 해당 상태를 `enabled`로 바꾸고 `reason`을 제거한 뒤 재생성한다.

## 도구별 구조

| 구분          | Codex                                                                                                        | Claude Code                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 기본 지침     | 루트 `AGENTS.md`                                                                                             | 루트 `CLAUDE.md`                                                                                                            |
| 지침 관리     | `AGENTS.md`가 지침 작업에서 읽도록 지정한 `.codex/instructions.md`                                           | 해당 경로 작업 시 로딩되는 `.claude/rules/instruction-maintenance.md`                                                       |
| 코드 품질     | `AGENTS.md`가 코드·품질 설정 작업에서 읽도록 지정한 `.codex/code-quality.md`                                 | 코드·설정 경로에 적용되는 `.claude/rules/code-quality.md`                                                                   |
| 테스트 작성   | `AGENTS.md`가 테스트·fixture·환경 작업 전에 읽도록 지정한 `.codex/test-writing.md`                           | 테스트·fixture·설정 경로에 적용되는 `.claude/rules/test-writing.md`; `CLAUDE.md`에서도 작업 전에 확인하도록 연결            |
| React·Next.js | `AGENTS.md`가 컴포넌트·Hook·페이지·데이터 조회·성능 작업 전에 읽도록 지정한 `.codex/react-best-practices.md` | 앱·패키지의 JS/TS·설정 경로에 적용되는 `.claude/rules/react-best-practices.md`; `CLAUDE.md`에서도 작업 전에 확인하도록 연결 |
| 스킬          | `.agents/skills/<name>/SKILL.md`                                                                             | `.claude/skills/<name>/SKILL.md`                                                                                            |
| 추가 설정     | 스킬의 `agents/openai.yaml`에 표시명·기본 프롬프트·자동 선택 정책                                            | SKILL.md frontmatter에 인자 힌트·호출 정책                                                                                  |
| 명시적 호출   | `$sync-instructions check` 또는 `write`라는 사용자 요청                                                      | `/sync-instructions check` 또는 `write`; 본문의 `$ARGUMENTS` 치환                                                           |
| 실행 권한     | 현재 샌드박스·승인 정책과 실행 도구의 권한 상승 절차                                                         | 현재 세션의 도구 권한과 Bash 승인 절차                                                                                      |

`.codex/instructions.md`, `.codex/code-quality.md`, `.codex/test-writing.md`, `.codex/react-best-practices.md`는 이름만으로 자동 로딩되는 파일이 아니다. 루트 지침에서 작업 범위를 구분하여 명시적으로 연결한다. `.codex/skills`와 `.agents/skills`에 같은 스킬을 복제하면 설치 버전에 따라 중복 발견되므로 한 곳에만 설치한다.

기본 지침은 일상 작업에 필요한 짧은 공통 원칙을 담는다. 동기화 절차는 스킬, 충돌 복구는 호출 시 읽는 참조로 분리한다. Claude 경로별 규칙은 일반 제품 작업에 유지보수 절차를 상시 주입하지 않는다.

## 의도적으로 유지하는 기본값

- 두 도구 모두 관련 요청에서 스킬을 자동 선택할 수 있다. 검사 요청은 읽기만 하고 명확한 동기화 요청이나 승인된 지침 변경에서만 쓴다.
- Claude는 `user-invocable: true`, `disable-model-invocation: false`를 사용한다. `allowed-tools`로 쓰기를 사전 허용하지 않으며 `context: fork`나 모델 강제 지정 없이 현재 대화에서 실행한다.
- Codex의 `allow_implicit_invocation: true`를 유지한다. UI 기본 프롬프트는 검사 요청이다.
- 프로젝트 `.codex/hooks.json`과 `.claude/settings.json`의 work-plan hook 그룹만 생성·병합한다. `config.toml`, `settings.local.json`, 모델·인증·권한·hook 신뢰 설정은 관리하지 않는다. 기존 설정과 다른 hook은 보존한다.
- Claude의 새 버전에 있는 AGENTS.md 지원에 의존하지 않고 CLAUDE.md를 직접 생성한다.

## 수정할 파일

| 원천 경로                                    | 역할                                                                                   |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `project/source.md`                          | 도구 공통 목적·작업 원칙·품질·관리 계약                                                |
| `conventions/code-quality/source.md`         | Oxlint·Oxfmt·타입 검사의 책임, Iris 코어 예외, 실제 설정·명령·검증 범위                |
| `conventions/test-writing/source.md`         | Vitest 컴포넌트·Playwright 앱 E2E의 역할, 독립성·정리·React 검증 계약과 현재 실행 범위 |
| `conventions/react-best-practices/source.md` | Vercel의 React·Next.js 70개 규칙, 기준 커밋·출처와 프로젝트 적용 조건                  |
| `skills/<name>/source.md`                    | 스킬 이름·설명과 도구 공통 행동 계약                                                   |
| `skills/<name>/references/*.md`              | 필요한 작업에서만 읽는 공통 참고자료                                                   |
| `hooks/work-plan/source.md`                 | 요청마다 전달하는 짧은 작업 전 안내 알림                                               |
| `adapters/<tool>/work-plan-hook.json`       | 도구별 UserPromptSubmit 설정; 명령 본문은 공통 알림에서 생성                             |
| `adapters/codex/`                            | Codex 기본·상세 지침과 스킬 절차                                                       |
| `adapters/claude/`                           | Claude 기본 지침·경로별 규칙·스킬 절차                                                 |
| `adapters/<tool>/skills/<name>.json`         | 각 도구의 선택적인 스킬 메타데이터                                                     |
| `targets.json`                               | 공식 진입점·발견 경로·상세 문서·조건부 규칙·도구 실행 보류 상태                        |
| `registry.md`, `.manifest.json`              | 생성기가 관리하는 산출물 목록·계약 포함 위치·해시                                      |

표의 경로는 이 디렉터리 기준이다. 생성 코드는 `scripts/instruction-model.mjs`, `scripts/instruction-hooks.mjs`, `scripts/sync-instructions.mjs`에 있다. 원천과 어댑터를 바꾼 뒤 재생성하며, 생성물만 편집하지 않는다.

## 작업 전 안내와 hook

`work-plan`은 작업 착수 전에 목표·담당·순서와 구체적인 방법을 설명한다. 상세 규칙은 스킬, 필요한 예시는 스킬의 참조 문서에 두며 기본 지침에는 첫 도구 호출 전에 안내할 수 있는 짧은 계약을 둔다.

`targets.json`에서 도구별 `workPlanHook: true`로 `UserPromptSubmit` hook을 생성한다. 알림은 `hooks/work-plan/source.md`에서 읽어 동기화 시 JSON 출력 명령으로 만든다. 실행 시에는 셸 내장 `printf`만 사용하며 지침 파일·사용자 프롬프트·대화 기록을 읽거나 별도 모델을 호출하지 않는다. 다른 hook 이벤트를 추가하거나 timeout을 2초보다 길게 하는 어댑터는 거절한다.

hook 설정 파일에서는 생성 표시가 있는 그룹만 비교·갱신한다. 매니페스트의 해당 JSON 해시는 파일 전체가 아니라 관리 그룹의 JSON에 대한 해시다. 다른 설정 변경은 충돌로 취급하지 않지만 관리 그룹의 수동 수정·삭제·중복은 보존을 위해 동기화를 중단한다. `workPlanHook: false`로 바꾸고 재생성하면 수정되지 않은 관리 그룹만 제거하며 남은 설정은 보존한다.

설정 발견, hook 신뢰, 실제 hook 실행, 모델의 안내 준수는 다른 검증이다. Codex는 프로젝트와 hook의 신뢰가 필요하며 검사 스크립트가 이를 대신 승인하지 않는다. Claude 실행 보류도 유지한다. 활성화 조건, 비용 측정 방법과 한계는 [work-plan hook 안내](hooks/work-plan/README.md)에 정리했다.

## 스킬 추가

1. `skills/<name>/source.md`에 이름·설명을 정의한다. 폴더명과 이름은 같은 64자 미만 kebab-case다. YAML frontmatter는 한 줄 문자열 `name`, `description`만 받는다.
2. 본문에 `목적`, `트리거`, `입력`, `절차`, `검증`, `출력`, `제약`, `중단 조건`, `Non-goals`를 작성한다. 실행 도구나 호출 문법은 어댑터에 둔다.
3. 지원하는 도구 각각에 `adapters/<tool>/skills/<name>.md`를 작성한다. 공통 계약은 `{{PURPOSE}}`, `{{TRIGGERS}}`, `{{INPUTS}}`, `{{STEPS}}`, `{{VERIFICATION}}`, `{{OUTPUTS}}`, `{{CONSTRAINTS}}`, `{{STOP}}`, `{{NON_GOALS}}`로 한 번씩 포함한다. 별도의 실행 절차와 문서 구조를 선택한다.
4. 필요할 때만 JSON 메타데이터와 참조를 추가한다. 참조는 스킬 내 `references/`로 독립 복사되고 상대 링크를 검사한다.
5. 생성·정적 검사·관련 런타임 검사 후 실제 요청으로 행동을 확인한다.

외부에서 가져온 스킬을 이 구조로 전환할 때는 기존 내용을 보존하고, 공통 계약과 도구별 절차로 나눈 뒤 관리 대상으로 등록한다. 원격 설치 도구의 `skills-lock.json`에서는 전환한 스킬 항목만 제거하여 두 도구가 같은 산출물을 덮어쓰지 않게 한다. 이후 변경은 원천과 어댑터에서 진행한다.

`turborepo`는 [업스트림 스킬](https://github.com/vercel/turborepo/blob/main/skills/turborepo/SKILL.md)의 동봉 문서 우선 원칙을 유지한다. 구체적인 Turborepo 설정법은 이 저장소에 복제하지 않고 실제 설치 버전의 문서에서 확인한다.

프로젝트 공통 계약 변수는 `PURPOSE`, `WORKFLOW`, `QUALITY`, `MAINTENANCE`, `NON_GOALS`다. `CODE_QUALITY`는 `conventions/code-quality/source.md`, `TEST_WRITING`은 `conventions/test-writing/source.md`, `REACT_BEST_PRACTICES`는 `conventions/react-best-practices/source.md`의 전체 계약이다. 각 계약은 각 도구의 기본·상세 문서와 경로별 규칙 전체에서 한 번씩 포함한다. 하나의 컨벤션 계약만 사용하는 상세 지침·규칙은 해당 정책 파일을 생성 원천으로 기록한다. `SKILLS`는 해당 도구의 스킬 목록이다. `RUNTIME_STATUS`는 `targets.json`에서 생성한 실행 보류 지침이며 프로젝트 지침 묶음과 각 스킬 어댑터에 한 번씩 포함한다.

테스트 작성 계약은 사용자 지정 `blog` 저장소의 `.agent-source/conventions/test-writing/source.md`와 `reference.md`를 참고했다. 독립성·정리·React 검증 원칙을 보존하고 제품의 함수·Hook·컴포넌트 검증은 Vitest, 실제 앱을 실행하는 앱 단위 통합 테스트는 Playwright E2E로 구분한다. 테스트는 별도 디렉터리를 만들지 않고 대상 파일 옆에 두며 E2E는 `<대상 파일명>.e2e.spec.ts`로 수집한다. 현재 구현된 실행 환경과 검증 범위·미검증 앱 흐름을 구분해 기록하며, 블로그의 `client/` 경로나 테스트 설정을 그대로 가져오지 않는다. 기존 개발 도구의 Node 테스트는 유지한다. 공통 계약과 짧은 예시는 각 도구의 상세 문서에 함께 생성하므로 다른 작업 공간이나 다른 도구의 파일에 의존하지 않는다.

React 작성 계약은 [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)의 8개 분야·70개 규칙을 프로젝트 지침으로 적용한다. 기준 커밋·라이선스 표기·규칙 식별자는 원천에 기록하고 양쪽 상세 지침에 함께 생성한다. 원문 예시보다 FSD 공개 API, 디자인 토큰, Iris 예외 및 공식 React API 계약을 우선한다. 별도 외부 스킬 설치나 제품 코드·의존성 변경은 포함하지 않는다.

현재 메타데이터 지원 범위는 Codex의 `interface.display_name`, `short_description`, `default_prompt`, `policy.allow_implicit_invocation`과 Claude의 `argument-hint`, `disable-model-invocation`, `user-invocable`다. 이는 생성기의 지원 범위이며 도구 전체 규격을 뜻하지 않는다. 다른 필드나 도구가 필요하면 설치 버전의 공식 규격을 확인하고 생성기 검증을 함께 확장한다. 알 수 없는 필드를 조용히 버리지 않는다.

## 검증 범위와 복구

- 정적 검사: 원천 계약 포함, 지원 메타데이터의 타입, 상대 참조, 산출물·해시·관리 범위. 문장 의미나 모델 판단을 자동 증명하지 않는다.
- 생성기 테스트: 임시 작업 공간에서 생성·변경·삭제·충돌 보존·이전 구조 마이그레이션을 실행한다.
- 런타임 검사: Codex app-server의 `skills/list`·`hooks/list`, Claude Code 초기화 응답의 명령 목록을 조회해 중복 발견·설명·인자·UI 메타데이터·Codex hook 설정을 확인한다. 모델 요청이나 hook 신뢰 승인은 보내지 않는다. Claude 조회에서는 프로젝트·로컬 설정만 선택하고 훅·MCP를 끈다. CLI 자체 상태 DB나 캐시 접근 때문에 환경 승인이 필요할 수 있다.
- 보류된 도구는 CLI를 시작하지 않고 `deferred`와 이유를 반환한다. 검사 종료 코드 0은 실행한 검사에 실패가 없다는 뜻이며, 보류된 도구의 통과를 뜻하지 않는다. 결과를 도구별로 확인한다.
- 실제 행동: 각 도구에서 검사와 재생성 요청, 수동 수정 충돌, 권한 거절을 별도로 관찰한다. 런타임 발견 성공만으로 이 단계까지 통과했다고 보고하지 않는다.

`--check`와 옵션 없는 실행은 쓰지 않는다. 실패 시 종료 코드는 1이다. `--write`는 관리되지 않은 파일과 수동 변경을 보존하고, 더 이상 필요한 산출물이 아니어도 이전 생성 내용과 같은 파일만 삭제한다. 매니페스트를 지우거나 강제 덮어써서 충돌을 우회하지 않는다.

쓰기는 파일별로 수행한다. 권한 오류 시 성공한 파일이 남을 수 있지만 매니페스트는 갱신하지 않는다. 권한 문제를 해결한 뒤 같은 명령을 재실행하면 나머지를 처리한다. 생성물과 원천이 다른 수동 변경은 먼저 보존하고 원천에 반영한다.

## 규격 근거

- [Codex 프로젝트 지침](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [스킬과 openai.yaml](https://learn.chatgpt.com/docs/build-skills), [app-server 조회](https://learn.chatgpt.com/docs/app-server), [hooks](https://developers.openai.com/codex/hooks)
- [Claude 프로젝트 지침과 경로별 규칙](https://code.claude.com/docs/en/memory), [스킬 frontmatter와 인자](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks)
- [Claude SDK의 초기화 프로토콜](https://github.com/anthropics/claude-agent-sdk-python/blob/main/src/claude_agent_sdk/_internal/query.py)

공식 문서와 설치 버전이 다를 수 있다. 실제 확인 버전과 실행 결과는 [검증 기록](validation.md)에 구분해 기록한다.
