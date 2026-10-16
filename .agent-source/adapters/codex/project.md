# 프로젝트 작업 지침

{{PURPOSE}}

## 작업과 검증

{{WORKFLOW}}

{{QUALITY}}

코드 작성·수정·리뷰와 lint·포맷·타입 설정 작업 전에는 [코드 품질 정책](.codex/code-quality.md)을 읽고 적용한다.

## Codex에서 적용하기

- 이 파일은 프로젝트의 `AGENTS.md`다. 하위 작업 범위에 지침이 있으면 함께 확인하고 적용 범위를 따른다. `AGENTS.override.md`가 있으면 같은 디렉터리의 `AGENTS.md`보다 먼저 선택된다.
- 프로젝트 스킬은 `.agents/skills/`에서 발견한다. 이름과 설명으로 필요한 스킬을 선택하고, 해당 `SKILL.md` 및 필요한 참조만 읽는다.
- 파일 쓰기가 샌드박스에 막히면 실행 도구의 승인 절차를 사용한다. 승인 정책이나 사용자 전역 설정을 변경해 해결하지 않는다.

## 프로젝트 스킬

아래 설명이 현재 요청에 맞을 때 해당 스킬을 사용한다.

{{SKILLS}}

## AI 지침을 변경할 때

지침 작업에서는 먼저 [Codex 지침 관리 규칙](.codex/instructions.md)을 읽고 `$sync-instructions`를 사용한다. 이 참조는 해당 작업에 필요한 상세 지침이며 별도의 자동 로딩 파일로 가정하지 않는다. 일반 작업에서는 동기화 절차를 실행할 필요가 없다. 생성 구조와 검사 범위는 `.agent-source/README.md`를 참고한다.

## 범위

{{RUNTIME_STATUS}}

{{NON_GOALS}}
