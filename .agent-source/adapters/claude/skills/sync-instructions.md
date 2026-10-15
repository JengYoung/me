# AI 지침 검사와 재생성

{{PURPOSE}}

## 요청 해석

호출 인자: `$ARGUMENTS`

- `check`: 읽기 전용 검사 후 결과를 보고한다.
- `write`: 원천을 확인하고 관리 대상 산출물을 재생성한다.
- 인자가 없으면 현재 요청에서 검사·동기화 의도를 판단한다. 명확한 수정 요청이 없으면 `check`로 시작한다.
- 다른 인자는 명령으로 실행하지 않는다. 지원하는 모드를 안내한다. 인자 문자열을 그대로 `Bash`에 전달하지 않는다.

{{TRIGGERS}}

{{STEPS}}

입력: {{INPUTS}}

## 작업 절차

{{RUNTIME_STATUS}}

프로젝트 루트에서 `Read`로 필요한 원천을 확인하고, 원천 수정은 `Edit`를 사용한다. 실행 명령은 `Bash`에서 사용하되 현재 셸 실행 규칙을 따른다. Node.js 22 이상이 필요하다.

| 모드 | 실행 |
| --- | --- |
| 검사 | `node scripts/sync-instructions.mjs --check` |
| 재생성 | 먼저 `--check`로 차이를 확인하고 `node scripts/sync-instructions.mjs --write`, 이어서 `--check` |
| 생성기 수정 | `node --test scripts/sync-instructions.test.mjs`도 실행 |

공통 계약은 `.agent-source/`의 `source.md`, Claude 전용 절차와 frontmatter는 `.agent-source/adapters/claude/`에서 바꾼다. `CLAUDE.md`는 상시 지침, `.claude/rules/`는 경로별 지침, `.claude/skills/`는 호출 시 읽는 작업 절차로 유지한다.

## 변경 보호

{{CONSTRAINTS}}

이 스킬은 현재 대화에서 실행하며 권한을 미리 허용하는 `allowed-tools`를 지정하지 않는다. `Bash` 승인 요청은 Claude Code의 정상 권한 흐름을 따른다. 거절되면 명령을 바꿔 재시도하거나 `settings.json`·`settings.local.json`을 고치지 말고 차단 원인을 보고한다.

{{STOP}}

수동 변경 충돌이나 부분 반영이 있으면 [복구 안내](references/recovery.md)를 읽는다.

## 확인과 보고

{{VERIFICATION}}

스킬 구조나 frontmatter 변경 시 `node scripts/check-instruction-runtime.mjs`로 발견 여부를 검사한다. 이 검사는 보류된 도구를 실행하지 않으며, `deferred` 결과를 통과로 보고하지 않는다. Claude 실행이 허용된 경우에만 대화형 Claude Code의 `/context`로 지침 로딩을, `/sync-instructions check`로 명시적 호출을 확인한다. 경로별 규칙은 해당 파일을 읽을 때 로드되므로 세션 시작 시 목록에 없다는 이유로 실패로 판단하지 않는다.

{{OUTPUTS}}

{{NON_GOALS}}
