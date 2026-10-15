# AI 지침 유지보수

{{MAINTENANCE}}

공통 원천은 `.agent-source/project/source.md`와 `.agent-source/skills/*/source.md`, Claude 실행 방식은 `.agent-source/adapters/claude/`에 둔다. 구조를 바꿀 때만 `.agent-source/README.md`를 읽는다.

검사 요청에는 `/sync-instructions check`, 생성 요청에는 `/sync-instructions write`를 사용한다. 생성기 수정 시 관련 테스트도 실행한다. 자동 발견과 실제 실행을 확인하지 않았다면 파일 검사 성공만 보고한다.
