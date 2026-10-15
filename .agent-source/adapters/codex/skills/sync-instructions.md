# 프로젝트 AI 지침 동기화

{{PURPOSE}}

## 적용과 입력

{{TRIGGERS}}

입력: {{INPUTS}}

`$sync-instructions check`는 검사, `$sync-instructions write`는 재생성 요청으로 해석한다. 모드는 현재 사용자 요청에서 읽는다. Codex용 본문에는 다른 도구의 인자 치환 문법을 사용하지 않는다.

{{STEPS}}

## 실행

{{RUNTIME_STATUS}}

1. 현재 프로젝트 루트의 `.agent-source/targets.json`과 변경된 원천을 확인한다. 실행에는 Node.js 22 이상이 필요하다. 셸 명령은 현재 환경의 실행 규칙을 따른다.
2. `node scripts/sync-instructions.mjs --check`를 실행한다. 검사 요청이면 차이와 종료 코드를 보고하고 끝낸다.
3. 동기화 요청이면 필요한 공통 원천 또는 `.agent-source/adapters/`의 대상 도구 어댑터를 수정한다. 생성 파일은 직접 편집하지 않는다.
4. `node scripts/sync-instructions.mjs --write` 후 `node scripts/sync-instructions.mjs --check`를 실행한다. 생성기를 바꿨다면 `node --test scripts/sync-instructions.test.mjs`도 실행한다.
5. `.agents/skills/`가 Codex의 스킬 설치 경로다. 같은 스킬을 `.codex/skills/`에 중복 설치하지 않는다. 도구별 구조나 메타데이터를 바꿨다면 `node scripts/check-instruction-runtime.mjs`로 설치된 CLI의 스킬 발견과 중복 등록 여부도 확인한다. 이 검사는 보류된 도구를 실행하지 않으며, `deferred` 결과를 통과로 보고하지 않는다.

## 충돌과 승인

{{CONSTRAINTS}}

`.codex`와 `.agents`는 작업 공간 안에서도 쓰기가 보호될 수 있다. 필수 쓰기가 권한 오류로 실패하고 실행 도구가 권한 상승을 지원하면, 정확히 그 생성 명령에 `sandbox_permissions: "require_escalated"`와 이유를 붙여 승인 요청한다. 승인 거절이나 승인 요청 불가 상태에서는 차단된 경로와 재실행 명령을 보고한다. 다른 도구·임시 경로로 우회해 덮어쓰지 않는다.

{{STOP}}

충돌 파일의 보존과 부분 반영 복구가 필요할 때만 [복구 안내](references/recovery.md)를 읽는다.

## 완료 기준

{{VERIFICATION}}

{{OUTPUTS}}

{{NON_GOALS}}
