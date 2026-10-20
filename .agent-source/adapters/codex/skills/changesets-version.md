# Changesets 독립 버전 관리

{{PURPOSE}}

## 요청과 근거

{{TRIGGERS}}

입력: {{INPUTS}}

`$changesets-version` 뒤의 자연어 요청을 읽는다. `check`는 조회, `add`는 changeset 작성, `version`은 버전 적용의 예시이며 현재 대화의 요청 범위를 우선한다.

## 실행

셸 도구로 파일과 Git diff를 확인하고 현재 환경의 명령 실행 규칙을 따른다. 상세 사용법과 설정 근거는 프로젝트 루트의 `.changeset/README.md`에서 확인한다.

{{STEPS}}

changeset 파일을 직접 작성할 때:

```md
---
'web': patch
---

실제 변경에 근거한 사용자 관점의 수정 내용을 작성한다.
```

예시를 그대로 생성하지 않고 실제 대상·bump·요약으로 바꾼다. `pnpm changeset:status`에서 최종 계획을 확인한다.

{{CONSTRAINTS}}

{{STOP}}

## 검증과 결과

{{VERIFICATION}}

{{OUTPUTS}}

{{NON_GOALS}}

## 도구 실행 상태

{{RUNTIME_STATUS}}
