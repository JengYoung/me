---
paths:
  - ".agent-source/**"
  - "AGENTS.md"
  - "CLAUDE.md"
  - ".agents/skills/**"
  - ".codex/**"
  - ".claude/**"
  - "scripts/*instruction*"
---

<!-- AUTO-GENERATED from .agent-source/project/source.md by scripts/sync-instructions.mjs. Do not edit; run node scripts/sync-instructions.mjs --write. -->

# AI 지침 유지보수

- 프로젝트 지침·계약의 정본은 `.agent-source/`에 둔다. 주제별 원천을 관리하고 상세 지침은 해당 작업에서만 읽도록 연결한다. 별도 문서에 같은 지침을 중복 관리하지 않는다.
- 공통 정책과 스킬의 행동 계약은 원천에서 수정한다. 도구별 실행 방법과 메타데이터는 해당 도구의 어댑터에서 수정한다.
- 생성물을 직접 고치지 않는다. 원천 변경 후 지원 도구의 산출물을 함께 갱신하고 검사한다.
- 각 도구는 같은 목적·입력·완료 조건·제약을 보존하되, 지침 로딩과 실행 방식은 자신의 기능에 맞게 구성한다.

프로젝트 공통 규칙은 `.agent-source/project/source.md`의 목차에서 주제를 찾고 연결된 Markdown 원천에서 수정한다. 콘텐츠 상세 계약은 `.agent-source/project/content/`, 코드 품질·테스트 작성·React 상세 정책은 `.agent-source/conventions/*/source.md`, 스킬 계약은 `.agent-source/skills/*/source.md`, Claude 실행 방식은 `.agent-source/adapters/claude/`에 둔다. 구조를 바꿀 때만 `.agent-source/README.md`를 읽는다.

검사 요청에는 `/sync-instructions check`, 생성 요청에는 `/sync-instructions write`를 사용한다. 생성기 수정 시 관련 테스트도 실행한다. 자동 발견과 실제 실행을 확인하지 않았다면 파일 검사 성공만 보고한다.
