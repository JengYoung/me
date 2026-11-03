# 작업 전 안내 hook

## 전달 구조

1. `AGENTS.md`·`CLAUDE.md`의 짧은 공통 계약으로 첫 도구 호출 전에 안내한다.
2. `work-plan` 스킬은 세 제목, 실제 담당과 투입 시점, 단계별 대상·방법·이유·검증을 구체적으로 설명하는 규칙이다. 예시는 필요한 경우에만 읽는다.
3. 두 도구의 `UserPromptSubmit` hook은 공통 알림을 `hookSpecificOutput.additionalContext`로 전달한다. 사용자에게 보이는 계획은 에이전트가 현재 요청에 맞춰 작성한다.

hook은 안내 규칙을 상기시키는 수단이다. 설명을 했는지 강제로 판정하는 도구 차단기나 모델 준수 보장은 아니다. hook을 지원하지 않거나 신뢰하지 않은 환경에서도 루트 지침의 계약은 남는다. 직접적인 설명 질문·상태 확인에는 계획을 반복하지 않고 답하며, 진행 방법이 달라지면 달라진 부분만 설명한다.

## 비용을 줄인 부분

- 스킬 전체를 요청마다 주입하지 않고 짧은 알림만 전달한다. 예시는 자동 주입하지 않는다.
- 도구 호출마다 실행하는 `PreToolUse`, 추가 `SessionStart` hook, 별도 모델 호출이나 프롬프트 분류기를 추가하지 않았다.
- 동기화할 때 알림을 JSON과 셸 문자열로 인코딩한다. 실행할 때는 셸 내장 `printf`만 쓰므로 Node·Python·Git·패키지 설치·네트워크·파일 조회가 필요 없다.
- 프롬프트·세션 기록을 읽거나 저장하지 않는다. 중복 방지를 위한 상태 파일·잠금도 없다. 등록된 알림은 사용자 요청마다 한 번 전달한다.
- 알림은 최대 768 UTF-8 bytes, timeout은 최대 2초로 제한한다. 과도하게 커지는 설정은 생성 단계에서 실패한다. 사용자에게 보여줄 설명에는 획일적인 토큰 상한을 두지 않아 필요한 방법과 이유를 유지한다.

새 기능이므로 기존의 비용 0 대비 입력과 안내 출력이 추가된다. 토큰 절감률은 “스킬 전체를 매 요청에 넣는 가정”과의 비교이며 기존 프로젝트의 실제 과금 절감률이 아니다. 루트 계약·스킬 메타데이터·필요할 때 읽는 상세 스킬·사용자에게 출력하는 계획의 비용도 별도로 존재한다. 누적 대화, 캐시, 재시도 비용이 사라지는 것은 아니다.

## 실행 및 활성화 조건

- Codex: 프로젝트 `.codex/hooks.json`에서 발견된다. 프로젝트 신뢰와 hook의 신뢰가 필요하다. `/hooks`에서 생성된 명령을 검토하고 신뢰해야 실행된다. 내용 변경 후에는 다시 검토가 필요할 수 있다. 생성기와 검증기는 신뢰 설정을 변경하지 않는다.
- Claude: 프로젝트 `.claude/settings.json`에 연결한다. 현재 `targets.json`의 실행 보류를 유지하므로 CLI 실행 및 실제 메시지 전달은 검증하지 않는다. 보류가 해제된 후 프로젝트 설정과 `/hooks`에서 확인한다.
- 문서는 [Codex hooks](https://developers.openai.com/codex/hooks), [Claude hooks](https://code.claude.com/docs/en/hooks)를 기준으로 했다. Codex의 설치 버전별 발견 결과는 별도로 기록한다.

## 검증과 재현

```sh
node --test scripts/sync-instructions.test.mjs scripts/instruction-hooks.test.mjs
node scripts/sync-instructions.mjs --check
node scripts/check-instruction-runtime.mjs
node scripts/benchmark-instruction-hooks.mjs
```

테스트는 두 어댑터가 생성한 명령을 빈 `PATH`와 공백이 있는 빈 임시 디렉터리에서 실행하고, JSON 출력·인용부호·프롬프트 비노출을 확인한다. 동기화 검사는 기존 설정 보존·수동 수정 충돌·비활성화·심볼릭 링크 차단을 포함한다.

벤치마크는 5회 준비 실행 후 100회 측정한다. `/bin/sh` 생성부터 출력 수신까지의 시간이며 실제 Codex·Claude 이벤트 처리, 셸 사용자 설정, 모델 응답 시간은 포함하지 않는다. 시간 수치를 테스트의 고정 통과 조건으로 사용하지 않는다. 저장소 실행은 Node.js 24가 필요하지만 생성된 hook의 실행에는 Node가 필요 없다.

토큰 측정은 실제 모델의 과금 기록과 구분한다. 예를 들어 별도 측정 환경의 `tiktoken`에서 아래처럼 `o200k_base`로 비교할 수 있다. 토크나이저를 프로젝트 의존성으로 추가하거나 hook 실행 중 로딩하지 않는다.

```python
from pathlib import Path
import tiktoken

encoding = tiktoken.get_encoding("o200k_base")
reminder = Path(".agent-source/hooks/work-plan/source.md").read_text().strip()
skill = Path(".agents/skills/work-plan/SKILL.md").read_text().strip()
print({"reminder": len(encoding.encode(reminder)), "full_skill": len(encoding.encode(skill))})
```

Claude와 현재 선택된 모델의 실제 토크나이저·과금 수치는 이 비교로 확정할 수 없다. 측정 결과는 아래에 검증 범위와 함께 기록한다.

## 2026-10-20 측정 및 검증 결과

측정 환경은 macOS arm64, Node.js 24.22.0, 별도 측정용 `tiktoken` 0.14.0의 `o200k_base`다. 토큰 비교에서는 문서의 앞뒤 공백을 제거했다.

| 항목 | Codex용 | Claude용 |
| --- | ---: | ---: |
| 반복 전달 알림 | 82 tokens / 382 bytes | 82 tokens / 382 bytes |
| 전체 스킬 본문 비교값 | 1,240 tokens | 1,278 tokens |
| 전체 스킬 반복 전달 가정 대비 토큰 감소 | 93.4% | 93.6% |
| 로컬 명령 실행 중앙값, 100회 | 4.760ms | 4.781ms |
| 로컬 명령 실행 p95 | 5.430ms | 5.252ms |
| 측정 중 최대 실행 시간 | 9.661ms | 5.497ms |

루트의 새 핵심 계약과 work-plan 목록 부분은 Codex 문서 기준 추가 266 tokens다. 이는 그 부분만 따로 측정한 값이며 스킬 검색 메타데이터·대화 형식·모델의 계획 출력·누적 대화 비용까지 합산한 총비용이 아니다. 알림의 작은 비용은 요청마다 남지만 상세 규칙과 예시를 반복 전달하지 않으며, 현재 맥락에 남아 있는 지침은 재사용한다.

- 생성기·hook 테스트 52개 통과. 셸 명령의 실제 JSON 출력, 특수문자 보존, 기존 설정 보존, 충돌 시 쓰기 중단, hook 제거를 검사했다.
- 수정한 Node 스크립트 7개에 Oxlint·Oxfmt 검사 통과. 지침 동기화 검사와 Codex 스킬 메타데이터 형식 검사 통과.
- 설치된 Codex CLI 0.163.0의 `skills/list`에서 `work-plan`을 한 번 발견하고 메타데이터를 읽었다. `hooks/list`에서도 프로젝트의 `userPromptSubmit` command를 한 번 발견했다.
- 초기 검사에서는 Codex hook이 `untrusted`였으며, 사용자의 `/hooks` 승인 후 `node scripts/check-instruction-runtime.mjs --codex`로 `trusted` 상태와 경고 없음을 확인했다. 이후 실제 사용자 요청에서 안내 지침이 전달됐고, 새 작업을 시작할 때 세 제목의 안내를 출력하는 것도 확인했다. 조회 스크립트 자체는 모델을 실행하지 않으므로 그 결과의 `execution: not tested`와 실제 대화에서 관찰한 결과를 구분한다.
- Claude CLI는 실행 보류로 시작하지 않았다. Claude 어댑터의 설정 생성·명령 출력만 검사했으며 Claude의 설정 로딩·실제 hook 실행·모델 행동은 미검증이다.
- 예시 문안은 단순 수정, 여러 단계의 수정, 상태 질문, 계획 변경, 중단 요청을 구분하도록 작성했다. 실제 모델 준수율·응답 시간·과금 감소는 측정하지 않았다.
