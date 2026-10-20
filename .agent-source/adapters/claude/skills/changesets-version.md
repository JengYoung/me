# Changesets 버전 동기화

{{PURPOSE}}

## 요청 해석

호출 인자: `$ARGUMENTS`

인자를 현재 대화와 함께 읽는다. `check`는 조회, `add`는 changeset 작성, `version`은 버전 적용의 예시다. 인자를 그대로 `Bash`에 전달하지 않는다.

{{TRIGGERS}}

입력: {{INPUTS}}

## 작업

`Glob`·`Grep`·`Read`로 패키지·설정·changeset·changelog를 확인한다. 프로젝트 루트의 `.changeset/README.md`에서 상세 사용법과 설정 근거를 확인한다. `Bash`는 현재 환경의 명령 실행 규칙을 따르고 changeset을 직접 작성해야 할 때는 `Write`·`Edit`를 사용한다.

{{STEPS}}

changeset 파일의 형식은 다음과 같으며 실제 대상·bump·요약으로 바꾼다.

```md
---
'web': patch
---

실제 변경에 근거한 사용자 관점의 수정 내용을 작성한다.
```

## 범위와 실패 처리

{{CONSTRAINTS}}

{{STOP}}

## 확인과 보고

{{VERIFICATION}}

{{OUTPUTS}}

{{NON_GOALS}}

## 실행 보류 확인

{{RUNTIME_STATUS}}
