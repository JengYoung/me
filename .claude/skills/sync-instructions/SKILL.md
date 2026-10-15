---
name: "sync-instructions"
description: "프로젝트 AI 지침과 스킬을 공통 원천에서 동기화하거나 검사한다. AI 지침 변경·재생성·불일치 점검에 사용하며, 일반 제품 코드나 문서 수정에는 사용하지 않는다."
argument-hint: "[check|write]"
disable-model-invocation: false
user-invocable: true
---

<!-- AUTO-GENERATED from .agent-source/skills/sync-instructions/source.md by scripts/sync-instructions.mjs. Do not edit; run node scripts/sync-instructions.mjs --write. -->

# AI 지침 검사와 재생성

공통 원천의 행동 계약을 보존하면서 각 도구가 사용하는 지침과 스킬을 생성하고 검증한다.

## 요청 해석

호출 인자: `$ARGUMENTS`

- `check`: 읽기 전용 검사 후 결과를 보고한다.
- `write`: 원천을 확인하고 관리 대상 산출물을 재생성한다.
- 인자가 없으면 현재 요청에서 검사·동기화 의도를 판단한다. 명확한 수정 요청이 없으면 `check`로 시작한다.
- 다른 인자는 명령으로 실행하지 않는다. 지원하는 모드를 안내한다. 인자 문자열을 그대로 `Bash`에 전달하지 않는다.

AI 지침·스킬의 동기화나 검사를 요청받았거나, 해당 원천 또는 어댑터를 수정한 경우에 사용한다. 일반 코드·문서 변경에는 적용하지 않는다.

검사 요청은 읽기만 한다. 동기화 요청이나 승인된 지침 수정은 원천과 차이를 확인한 뒤 관리 대상만 갱신한다. 의도가 불명확하면 먼저 검사하여 필요한 변경을 설명한다.

입력: 요청한 작업 모드, 프로젝트·스킬 원천, 도구별 어댑터, 대상 경로, 기존 생성물과 관리 기록.

## 작업 절차

- Claude Code: **로그인 만료 = 잠정 보류**. 지침·스킬 생성과 정적 검사는 계속한다. 사용자가 재개를 요청할 때까지 해당 도구의 CLI 실행·모델 호출·인증 복구·결제 변경을 시도하지 않는다. `.agent-source/targets.json`의 `runtime.status`를 임의로 해제하지 않는다.

프로젝트 루트에서 `Read`로 필요한 원천을 확인하고, 원천 수정은 `Edit`를 사용한다. 실행 명령은 `Bash`에서 사용하되 현재 셸 실행 규칙을 따른다. Node.js 22 이상이 필요하다.

| 모드 | 실행 |
| --- | --- |
| 검사 | `node scripts/sync-instructions.mjs --check` |
| 재생성 | 먼저 `--check`로 차이를 확인하고 `node scripts/sync-instructions.mjs --write`, 이어서 `--check` |
| 생성기 수정 | `node --test scripts/sync-instructions.test.mjs`도 실행 |

공통 계약은 `.agent-source/`의 `source.md`, Claude 전용 절차와 frontmatter는 `.agent-source/adapters/claude/`에서 바꾼다. `CLAUDE.md`는 상시 지침, `.claude/rules/`는 경로별 지침, `.claude/skills/`는 호출 시 읽는 작업 절차로 유지한다.

## 변경 보호

관리되지 않은 파일과 수동 변경을 보존한다. 삭제는 이전 생성 내용 그대로인 관리 파일에만 허용한다. 검사 중에는 원천·생성물·관리 기록을 수정하지 않는다.

이 스킬은 현재 대화에서 실행하며 권한을 미리 허용하는 `allowed-tools`를 지정하지 않는다. `Bash` 승인 요청은 Claude Code의 정상 권한 흐름을 따른다. 거절되면 명령을 바꿔 재시도하거나 `settings.json`·`settings.local.json`을 고치지 말고 차단 원인을 보고한다.

원천 누락·모호한 계약·수동 변경 충돌·권한 거절이 해소되지 않으면 해당 변경을 중단하고 파일과 이유를 보고한다. 같은 실패를 조건 변화 없이 반복하지 않는다. 일부만 반영된 경우 완료로 보고하지 않는다.

수동 변경 충돌이나 부분 반영이 있으면 [복구 안내](references/recovery.md)를 읽는다.

## 확인과 보고

생성 정합성, 도구 규격 적합성, 실제 클라이언트의 발견·실행을 구분한다. 같은 입력은 같은 산출물을 만들고, 모든 도구의 행동 계약과 독립적인 참조가 유지되어야 한다.

스킬 구조나 frontmatter 변경 시 `node scripts/check-instruction-runtime.mjs`로 발견 여부를 검사한다. 이 검사는 보류된 도구를 실행하지 않으며, `deferred` 결과를 통과로 보고하지 않는다. Claude 실행이 허용된 경우에만 대화형 Claude Code의 `/context`로 지침 로딩을, `/sync-instructions check`로 명시적 호출을 확인한다. 경로별 규칙은 해당 파일을 읽을 때 로드되므로 세션 시작 시 목록에 없다는 이유로 실패로 판단하지 않는다.

변경한 파일, 실행한 검사와 결과, 실패 또는 미검증 항목을 보고한다. 생성 완료와 실제 도구 실행 검증 완료를 구분한다.

제품 정책 추가, 사용자 전역 설정 변경, 권한 우회, 외부 전송·설치·커밋·배포는 동기화에 포함하지 않는다. 제품 테스트를 지침 검사로 대체하지 않는다.
