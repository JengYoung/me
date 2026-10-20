# AI 지침·스킬 검증 기록

검증일: 2026-10-15. 이 기록은 아래 버전과 실행 범위에 대한 관찰이며 모든 클라이언트 버전이나 모델 동작을 보증하지 않는다.

## 동기화 스킬 구축 검증

| 검증                           | 결과                      | 확인 범위                                                                                                                                     |
| ------------------------------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 원천·생성물 정합성             | 통과                      | `node scripts/sync-instructions.mjs --check`, 계약 변수·참조·관리 파일·해시                                                                   |
| 생성기 자동 테스트             | 26개 통과                 | 읽기 전용 검사, 반복 생성 안정성, 도구별 어댑터, 수동 수정 보존, 삭제·마이그레이션, 권한 오류 후 복구, 보류 정책                              |
| Codex 스킬 기본 검사           | 통과                      | skill-creator의 `quick_validate.py`로 프로젝트 Codex 스킬 형식 검사                                                                           |
| Codex CLI 0.162.1 로더         | 통과                      | app-server `skills/list`에서 `sync-instructions` 한 개, `.agents/skills/` 경로, 활성 상태, 설명, `openai.yaml` 표시명·설명·기본 프롬프트 확인 |
| Codex CLI 실제 모델 실행       | 검사 요청 통과            | 임시 프로젝트에서 명시적으로 스킬을 호출하여 변경 금지 요청과 불일치 보고 동작 확인                                                           |
| 별도 에이전트의 스킬 실행 평가 | 검사·재생성 시나리오 통과 | 아래 평가 조건 참고. Claude 모델 실행 결과가 아님                                                                                             |
| Claude Code 2.1.236 로더       | 보류 전 확인 통과         | 초기화 응답에서 프로젝트 명령 한 개, 설명, `[check\|write]` 인자 힌트 확인                                                                    |
| Claude 모델 실행               | 잠정 보류                 | 로그인 만료로 모델 실행에 도달하지 못함. 사용자 요청으로 이후 실행·인증 복구·결제 변경 중지                                                   |
| 최종 런타임 검사               | Codex 통과 / Claude 보류  | Claude CLI를 시작하지 않고 `deferred`와 `로그인 만료 = 잠정 보류` 반환                                                                        |

## 행동 평가 조건

공통 원천과 생성기를 임시 프로젝트에 복사하고, 원천에 새 규칙을 추가해 생성물과 불일치를 만들었다. 검사 시나리오에는 Claude 스킬의 수동 변경도 넣었다. 실제 프로젝트와 전역 지침·설정은 평가 수정 대상으로 사용하지 않았다.

- 검사 요청: 별도 평가 에이전트는 `--check` 실패와 차이를 보고했고, 파일 내용·수정 시각·크기·모드를 유지했다.
- 재생성 요청: 별도 평가 에이전트는 최초 검사 실패 후 재생성하고 최종 검사를 통과했다. 새 공통 규칙이 `AGENTS.md`와 `CLAUDE.md`에 반영됐고, 매니페스트 외의 관련 없는 파일을 변경하지 않았다.
- 실제 Codex CLI: 읽기 전용 샌드박스에서 `$sync-instructions check`를 호출했다. 기본 지침·상세 지침·스킬을 읽고 생성기 검사를 실행했으며, 원천 불일치와 수동 변경 충돌을 보고했다. 실제 CLI의 쓰기 승인·거절 대화까지 검증한 것은 아니다.
- 보류 정책: 자동 테스트에서 두 CLI의 프로세스 실행 함수를 실패하도록 대체했다. 전체 검사와 `--claude`, `--codex` 개별 선택 모두 해당 도구가 보류되면 프로세스 실행 없이 `deferred`를 반환했다. 보류 지침이 양쪽 기본 지침·스킬에 반영되는 것도 확인했다.

## 검증의 한계와 현재 운영 상태

Claude는 **로그인 만료 = 잠정 보류**다. 지침·스킬 생성과 정적 검사는 계속하지만, 실제 Claude 모델의 지침 적용·경로별 규칙 로딩·스킬 실행·권한 거절 대응은 미검증이다. 보류 전 로더 성공을 이 항목들의 통과로 해석하지 않는다. 현재 생성물에 추가된 보류 문구도 Claude 모델로 다시 실행하지 않았다.

Codex의 `agents/openai.yaml`은 실제 로더로 해석을 확인했다. 자동 스킬 선택의 빈도나 모든 요청에서의 모델 준수까지 자동 증명하지는 않는다. `AGENTS.md`에서 `.codex/instructions.md`를 명시적으로 연결하며, 해당 상세 파일의 이름 자체에 자동 로딩 기능이 있다고 가정하지 않는다.

동일한 스킬을 `.codex/skills/`와 `.agents/skills/` 양쪽에 두면 확인한 Codex 버전에서 중복 발견된다. 현재는 `.agents/skills/`에 한 번만 생성한다. `.codex/`는 루트 지침이 참조하는 상세 지침을 유지한다.

권한 오류 후 부분 생성 복구와 수동 변경 보존은 임시 파일 시스템에서 자동 검증했다. 실제 CLI의 모든 승인 UI와 설정 조합을 검증한 것은 아니다. 프로젝트 동기화는 전역 지침·인증·모델·권한 설정을 관리하지 않는다. 네이티브 CLI 자체는 실행 중 상태 DB나 캐시를 사용할 수 있다.

재검증 명령과 규격 근거는 [관리 문서](README.md)에 있다. Claude 실행 재개는 사용자가 요청한 뒤 `targets.json`의 보류 상태를 변경하고 재생성하는 순서로 진행한다.

## Turborepo 스킬 원천 편입 검증

같은 날짜에 `turborepo`를 공통 원천과 Codex·Claude 어댑터로 전환했다. 설치 버전의 동봉 문서를 우선하는 기존 원칙을 유지하고, 프로젝트 스킬 목록·관리 기록에 등록했다. 원격 설치 잠금 파일에서는 해당 스킬 항목만 제거했다.

- 생성 정합성 검사, 기존 자동 테스트 26개, Codex용 `quick_validate.py`, Git 공백 검사 통과.
- Codex CLI 0.162.1의 실제 로더가 `sync-instructions`와 `turborepo`를 각각 한 번 발견하고 활성 상태·설명·UI 메타데이터를 확인했다.
- Claude 스킬은 생성·정적 검사만 수행했다. 런타임 검사는 CLI 실행 없이 `deferred`를 반환했다.
- Turborepo 구성 작업을 실제 모델에 맡기는 행동 검증은 수행하지 않았다. 현재 프로젝트에 Turborepo 앱·설치 패키지가 없으므로 해당 앱의 빌드·캐시·CI도 검증 대상에 포함하지 않았다.

## 코드 품질 정책 검증

검증일: 2026-10-16. 코드 품질 원천을 Codex 상세 지침과 Claude 경로별 규칙에 연결하고, 현재 Oxlint·Oxfmt·TypeScript 구성에 맞게 검증했다.

- `node scripts/sync-instructions.mjs --check` 통과. `CODE_QUALITY` 계약을 각 도구에 한 번씩 포함하고 별도 정책 원천의 해시·생성 기록을 관리한다.
- `node --test scripts/sync-instructions.test.mjs scripts/code-quality.test.mjs` 32개 통과: 생성기 30개와 실제 품질 도구 CLI 검사 2개다. 원천 누락·중복·연결 누락, 동기화 반복 안정성, 수동 변경 보존도 검사했다.
- 임시 프로젝트의 실제 Oxfmt 실행에서 Iris·의존성·생성물·lockfile은 보존되고 외부 소스는 포맷되는 것을 확인했다. import와 Tailwind 클래스 순서도 보존됐다. 실제 Oxlint는 코어 안팎의 correctness 위반을 모두 검출했다.
- 설치된 Oxlint CLI로 `packages/lint-config` 12개, `packages/ui` 444개, `apps/web`·`apps/docs` 각 4개 파일을 검사해 진단 0개를 확인했다. 네 패키지의 `tsc --noEmit`도 통과했다. 루트 pnpm/Turborepo 작업을 재실행한 결과로 해석하지 않는다.
- UI의 실제 Oxfmt 설정으로 `--check .`를 실행해 포맷 대상 5개 파일이 통과했다. 새 CLI 테스트와 공유 포맷 설정 파일의 포맷 검사도 통과했다. Iris 코어 442개 파일의 내용은 변경하지 않았다.
- Codex CLI 0.162.1 로더는 두 프로젝트 스킬을 각각 한 번 발견하고 메타데이터를 해석했다. 이는 새 코드 품질 정책의 실제 모델 준수 검증이 아니다.
- Claude는 CLI 실행 없이 `deferred`를 반환했다. **로그인 만료 = 잠정 보류**를 유지하며, 새 경로별 규칙의 실제 Claude 로딩·모델 실행은 미검증이다.

## 테스트 작성 계약 검증

검증일: 2026-10-20. 사용자 지정 `blog` 저장소의 테스트 작성 계약과 예시를 참고해 독립성·실패 시 정리·시간·React 검증 원칙을 공통 원천에 추가했다. 실행 범위와 fixture 예시는 현재 저장소의 Node 테스트에 맞췄다.

- `node scripts/sync-instructions.mjs --write` 후 `--check` 통과. `TEST_WRITING` 계약은 Codex의 `.codex/test-writing.md`와 Claude의 `.claude/rules/test-writing.md`에 각각 한 번 포함되며, 각 파일의 원천·해시를 관리한다. Codex는 `AGENTS.md`의 명시 참조로, Claude는 테스트·fixture·설정 경로 규칙과 `CLAUDE.md`의 참조로 연결했다.
- `node --test scripts/sync-instructions.test.mjs` 35개 통과. 새 계약의 양쪽 반영, 원천 누락·공백·어댑터 중복·진입점 연결 누락, 수동 수정 보존, 반복 생성의 무변경을 검증했다. 기존 경로 검증의 제어문자 정규식을 같은 범위의 문자 검사로 바꾸고, U+0000~U+0020·역슬래시·콜론·절대 경로·상위 경로 거부와 쓰기 없음도 확인했다.
- 수정한 `scripts/instruction-model.mjs`, `scripts/sync-instructions.test.mjs`에 공유 React 설정으로 Oxfmt를 적용한 뒤 포맷 검사와 Oxlint 검사 통과. 루트 품질 명령이나 앱 전체 검사 결과가 아니다.
- 테스트 파일·fixture·설정 등 대표 경로 13개를 Node의 glob matcher로 정적 확인했다. 이는 실제 Claude의 규칙 로딩 검증이 아니다. `git diff --check`도 통과했다.
- `node scripts/check-instruction-runtime.mjs`에서 Codex CLI 0.163.0이 프로젝트 스킬 두 개를 각각 한 번 발견하고 활성 상태·설명·UI 메타데이터를 확인했다. 초기 샌드박스 실행은 권한 오류였고, 실행 도구의 승인을 받아 같은 명령으로 재검증했다. 생성 과정의 보호된 `.codex` 쓰기도 승인 후 같은 생성 명령으로 완료했다.
- Claude는 CLI 실행 없이 `deferred`를 반환했다. **로그인 만료 = 잠정 보류**를 유지하며, 새 테스트 규칙의 실제 Claude 로딩·모델 실행은 미검증이다. Codex의 새 테스트 지침에 대한 모델 행동도 별도로 실행하지 않았다.
- 제품 동작은 바꾸지 않았으며 앱·UI 테스트, 브라우저 상호작용, SSR·hydration 실행 검증은 수행하지 않았다. 현재 `.mjs` 스크립트는 패키지의 TypeScript 검사 범위에 들어 있지 않으므로 타입 검사 통과로 보고하지 않는다.

연결 구조는 [Codex의 AGENTS.md 발견 규격](https://learn.chatgpt.com/docs/agent-configuration/agents-md)과 [Claude의 경로별 규칙 규격](https://code.claude.com/docs/en/memory)에 맞춰 확인했다. 공식 규격 확인, 생성 정합성, CLI 스킬 발견, 실제 모델 행동은 서로 다른 검증이다.

## React Best Practices 지침 검증

검증일: 2026-10-20. [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices)를 기준으로 8개 분야·70개 규칙을 공통 원천에 추가했다. 기준 커밋·출처·라이선스 표기와 FSD·디자인 토큰·Iris 예외·설치 버전의 적용 조건을 함께 기록했다.

- GitHub API로 기준 커밋의 개별 규칙 파일 목록을 읽고 원천의 규칙 식별자와 대조했다. 70개 모두 대응하며 누락·추가·중복이 없었다. 원문의 Effect Event 함수 동일성 설명은 공식 React API 계약에 맞춰 보정했다.
- 변경 전 `node scripts/sync-instructions.mjs --check` 통과를 확인했다. 원천·어댑터 수정 후 `--write`와 `--check`도 통과했다. 보호된 `.codex` 쓰기는 최초 실행에서 `EPERM`이 발생해, 실행 도구의 승인을 받아 같은 생성 명령으로 완료했다.
- `REACT_BEST_PRACTICES` 계약은 `.codex/react-best-practices.md`와 `.claude/rules/react-best-practices.md`에 각각 한 번 포함된다. 양쪽 기본 지침의 참조와 Claude의 앱·패키지 JS/TS·설정 경로를 연결하고 원천·해시·생성 목록을 관리한다. 외부 스킬을 별도로 설치하지 않았다.
- `node --test scripts/sync-instructions.test.mjs` 40개 통과. 새 계약의 양쪽 반영과 출처, 원천 누락·공백·어댑터 누락·중복·Codex 연결 누락, 수동 변경 보존과 반복 생성의 무변경을 검증했다. Claude 적용 경로 10개와 비대상 경로 2개는 Node glob matcher로 확인했으며 실제 Claude 로딩 결과가 아니다.
- 수정한 생성기·테스트 스크립트 2개는 공유 React 설정의 Oxlint를 통과했다. 수정한 원천·어댑터·설정·관리 문서·스크립트 13개는 Oxfmt 검사에 통과했다. 이 검증 기록도 포함하며 Git 공백 검사도 통과했다. 기존 테스트 작성 원천·어댑터·생성 문서 5개의 내용은 작업 시작 전과 같았다.
- `node scripts/check-instruction-runtime.mjs`는 최초 실행에서 Codex의 샌드박스 권한 오류가 발생했다. 승인 후 같은 명령을 실행해 Codex CLI `0.163.0`이 기존 프로젝트 스킬 두 개를 각각 한 번 발견하고 활성 상태·메타데이터를 해석하는 것을 확인했다. 이는 새 React 상세 지침의 실제 모델 준수 검증이 아니다.
- Claude는 CLI를 실행하지 않고 `deferred`를 반환했다. **로그인 만료 = 잠정 보류**를 유지하며 새 경로별 규칙의 실제 로딩·모델 실행은 미검증이다. Codex 모델의 새 지침 적용도 별도로 실행하지 않았다.
- 이번 지침 작업에서 제품 코드·패키지 의존성·품질 프리셋은 변경하지 않았다. 앱의 성능 측정·브라우저·SSR·hydration 검증은 이번 작업 범위에 포함하지 않았다. `.mjs` 생성기 검증을 TypeScript 검사로 보고하지 않는다.

위 실행은 환경 규칙에 따라 `rtk`를 거쳤다. 원문 지침의 편입, 생성 정합성, CLI 스킬 발견, 실제 제품 성능은 별개의 결과다.

## 컴포넌트·앱 통합 테스트 역할 구분

검증일: 2026-10-20. 제품의 함수·Hook·컴포넌트와 내부 조합은 Vitest, 실제 앱을 실행하는 앱 단위 통합 테스트는 Playwright E2E로 담당하도록 공통 원천과 도구별 실행 지침을 갱신했다.

- 변경 전 `node scripts/sync-instructions.mjs --check` 통과. 원천 수정 후 `--write`와 `--check`도 통과했다. 보호된 `.codex` 쓰기는 `EPERM` 후 실행 도구의 승인으로 같은 생성 명령을 완료했다.
- 양쪽 기본 지침과 테스트 상세 지침에 도구 역할이 반영됐음을 확인했다. 기존 Vitest Browser Mode는 컴포넌트 검증이며 앱 E2E가 아니라는 점과 현재 앱 E2E 설정·스크립트가 없다는 점을 실제 앱 설정·파일 목록과 대조했다.
- 수정한 원천·어댑터·관리 문서의 Oxfmt 검사와 Git 공백 검사를 수행했다. 생성기 코드·도구별 경로·메타데이터는 변경하지 않았다.
- 이번 작업은 지침 변경이다. 기존 테스트 코드·실행 설정을 이전하거나 앱 E2E를 구축·실행하지 않았다. CLI 로더·모델 행동은 다시 검사하지 않았으며 Claude의 로그인 만료 보류를 유지했다.

## 앱 E2E 실행 환경 검증

검증일: 2026-10-20. 사용자 요청으로 `apps/web`에 Playwright E2E를 구성했다. 공통 테스트 원천의 실행 범위를 실제 설정에 맞게 갱신하고 Codex·Claude 지침을 재생성했다.

- `pnpm --filter web test:e2e`는 Next.js 프로덕션 빌드·서버를 실행하고 Chromium 데스크톱 Dark·모바일 Light에서 4개 검사를 통과했다. 홈 문서·앱 리소스 로딩·초기 브라우저 오류와 없는 경로의 404 응답·안내 화면을 검사했다.
- `pnpm --filter web test:e2e --project=chromium-mobile-light --grep '홈 문서'`로 같은 홈 검사를 단독 실행해 1개 통과를 확인했다. 전체·단독 실행 후 3100 포트에 서버가 남아 있지 않았다.
- 기존 `pnpm --filter web test`는 40개 통과했다. 앱의 `lint`·`check-types`, 수정한 설정·테스트·문서의 Oxfmt 검사, Git 공백 검사도 통과했다.
- `node scripts/sync-instructions.mjs --write` 후 `--check`를 통과했다. 보호된 `.codex` 쓰기는 `EPERM` 후 실행 도구의 승인을 받아 같은 생성 명령으로 완료했다. 생성기 코드·도구별 로딩 경로·메타데이터는 이번 E2E 작업에서 변경하지 않았다.
- 현재 홈은 빈 페이지이며 Header·Sidebar가 앱 경로에 연결되어 있지 않다. 이번 E2E 결과는 앱 기동·리소스·404에 한정하며 해당 컴포넌트의 앱 사용자 흐름 검증으로 해석하지 않는다. Linux CI·다른 브라우저·Playwright UI 모드는 실행하지 않았다.
- CLI 로더·모델 행동은 다시 검사하지 않았다. Claude의 **로그인 만료 = 잠정 보류**를 유지하며 지침 생성·정적 검사만 수행했다.

## 테스트 소스 인접 배치 검증

검증일: 2026-10-20. 테스트는 별도 디렉터리를 만들지 않고 대상 파일 옆에 두도록 사용자 선호를 공통 계약에 반영했다. E2E는 `<대상 파일명>.e2e.spec.ts`, 공용 runner setup은 설정 파일 옆에 배치한다.

- 앱 E2E를 `app/page.tsx` 옆 `app/page.e2e.spec.ts`로 옮겼다. Playwright는 앱 루트의 `**/*.e2e.spec.ts`만 수집하고 `.gitignore` 제외 경로를 따른다. `--list`에서 새 위치의 4개 검사만 수집되는 것을 확인했다.
- 공용 Browser Mode setup을 `vitest.config.ts` 옆 `vitest.setup.ts`로 옮기고 설정·CSS import·문서 참조를 갱신했다. 비어 있는 기존 테스트 소스 디렉터리 두 곳을 제거했다. 테스트 본문과 정리 동작은 유지했다.
- `pnpm --filter web test:e2e`는 프로덕션 빌드와 E2E 4개를 통과했다. 빌드의 앱 경로는 기존 `/`·`/_not-found`였으며 테스트 파일이 앱 경로로 추가되지 않았다. 실행 종료 후 3100 포트에 서버가 남아 있지 않았다.
- `pnpm --filter web test`는 현재 구성의 41개 검사를 통과했다. Sidebar를 모바일 Light 프로젝트에서 단독 실행해 10개 검사도 통과했다. 앱의 `lint`·`check-types`와 수정한 코드·문서의 Oxfmt·Git 공백 검사도 통과했다.
- 지침 `--write`·`--check`를 통과했다. 보호된 `.codex` 쓰기는 최초 `EPERM` 후 실행 도구의 승인을 받아 같은 생성 명령으로 완료했다. 생성기 코드·도구별 지침 경로·메타데이터는 이번 배치 변경에서 수정하지 않았다.
- Claude CLI·모델 호출은 보류 상태로 유지했다. CLI 로더·모델 행동·Linux CI·다른 브라우저는 이번 작업에서 검사하지 않았으며, Header·Sidebar의 앱 사용자 흐름에 대한 기존 미검증 범위도 유지한다.
