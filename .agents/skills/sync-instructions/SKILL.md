---
name: "sync-instructions"
description: "프로젝트 AI 지침과 스킬을 공통 원천에서 동기화하거나 검사한다. AI 지침 변경·재생성·불일치 점검에 사용하며, 일반 제품 코드나 문서 수정에는 사용하지 않는다."
---

<!-- AUTO-GENERATED from .agent-source/skills/sync-instructions/source.md by scripts/sync-instructions.mjs. Do not edit; run node scripts/sync-instructions.mjs --write. -->

# 프로젝트 AI 지침 동기화

공통 원천의 행동 계약을 보존하면서 각 도구가 사용하는 지침과 스킬을 생성하고 검증한다.

## 적용과 입력

AI 지침·스킬의 동기화나 검사를 요청받았거나, 해당 원천 또는 어댑터를 수정한 경우에 사용한다. 일반 코드·문서 변경에는 적용하지 않는다.

입력: 요청한 작업 모드, 프로젝트·스킬 원천, 도구별 어댑터, 대상 경로, 기존 생성물과 관리 기록.

`$sync-instructions check`는 검사, `$sync-instructions write`는 재생성 요청으로 해석한다. 모드는 현재 사용자 요청에서 읽는다. Codex용 본문에는 다른 도구의 인자 치환 문법을 사용하지 않는다.

검사 요청은 읽기만 한다. 동기화 요청이나 승인된 지침 수정은 원천과 차이를 확인한 뒤 관리 대상만 갱신한다. 의도가 불명확하면 먼저 검사하여 필요한 변경을 설명한다.

## 실행

- Claude Code: **로그인 만료 = 잠정 보류**. 지침·스킬 생성과 정적 검사는 계속한다. 사용자가 재개를 요청할 때까지 해당 도구의 CLI 실행·모델 호출·인증 복구·결제 변경을 시도하지 않는다. `.agent-source/targets.json`의 `runtime.status`를 임의로 해제하지 않는다.

1. 현재 프로젝트 루트의 `.agent-source/targets.json`과 변경된 원천을 확인한다. 실행에는 Node.js 24 이상이 필요하다. 셸 명령은 현재 환경의 실행 규칙을 따른다.
2. `node scripts/sync-instructions.mjs --check`를 실행한다. 검사 요청이면 차이와 종료 코드를 보고하고 끝낸다.
3. 동기화 요청이면 필요한 공통 원천 또는 `.agent-source/adapters/`의 대상 도구 어댑터를 수정한다. 생성 파일은 직접 편집하지 않는다.
4. `node scripts/sync-instructions.mjs --write` 후 `node scripts/sync-instructions.mjs --check`를 실행한다. 생성기를 바꿨다면 `node --test scripts/sync-instructions.test.mjs scripts/instruction-hooks.test.mjs`도 실행한다.
5. `.agents/skills/`가 Codex의 스킬 설치 경로다. 같은 스킬을 `.codex/skills/`에 중복 설치하지 않는다. 도구별 구조나 메타데이터·hook을 바꿨다면 `node scripts/check-instruction-runtime.mjs`로 스킬과 Codex hook의 발견 여부도 확인한다. hook의 신뢰 상태와 실제 실행을 구분하며 신뢰 설정을 자동 변경하지 않는다. 이 검사는 보류된 도구를 실행하지 않으며, `deferred` 결과를 통과로 보고하지 않는다.

## 충돌과 승인

관리되지 않은 파일과 수동 변경을 보존한다. 삭제는 이전 생성 내용 그대로인 관리 파일에만 허용한다. hook 설정에서는 생성 표시가 있는 work-plan 그룹만 관리하고 다른 설정·hook은 보존한다. 검사 중에는 원천·생성물·관리 기록을 수정하지 않는다.

`.codex`와 `.agents`는 작업 공간 안에서도 쓰기가 보호될 수 있다. 필수 쓰기가 권한 오류로 실패하고 실행 도구가 권한 상승을 지원하면, 정확히 그 생성 명령에 `sandbox_permissions: "require_escalated"`와 이유를 붙여 승인 요청한다. 승인 거절이나 승인 요청 불가 상태에서는 차단된 경로와 재실행 명령을 보고한다. 다른 도구·임시 경로로 우회해 덮어쓰지 않는다.

원천 누락·모호한 계약·수동 변경 충돌·권한 거절이 해소되지 않으면 해당 변경을 중단하고 파일과 이유를 보고한다. 같은 실패를 조건 변화 없이 반복하지 않는다. 일부만 반영된 경우 완료로 보고하지 않는다.

충돌 파일의 보존과 부분 반영 복구가 필요할 때만 [복구 안내](references/recovery.md)를 읽는다.

## 완료 기준

생성 정합성, 도구 규격 적합성, 실제 클라이언트의 발견·실행을 구분한다. 같은 입력은 같은 산출물을 만들고, 모든 도구의 행동 계약과 독립적인 참조가 유지되어야 한다.

변경한 파일, 실행한 검사와 결과, 실패 또는 미검증 항목을 보고한다. 생성 완료와 실제 도구 실행 검증 완료를 구분한다.

제품 정책 추가, 사용자 전역 설정 변경, 권한 우회, 외부 전송·설치·커밋·배포는 동기화에 포함하지 않는다. 제품 테스트를 지침 검사로 대체하지 않는다.
