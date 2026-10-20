<!-- AUTO-GENERATED from .agent-source/project/source.md by scripts/sync-instructions.mjs. Do not edit; run node scripts/sync-instructions.mjs --write. -->

# Codex 지침 관리 규칙

루트 `AGENTS.md`가 AI 지침 작업에서 이 문서를 읽도록 지정한다.

- 공통 정책과 스킬의 행동 계약은 원천에서 수정한다. 도구별 실행 방법과 메타데이터는 해당 도구의 어댑터에서 수정한다.
- 생성물을 직접 고치지 않는다. 원천 변경 후 지원 도구의 산출물을 함께 갱신하고 검사한다.
- 각 도구는 같은 목적·입력·완료 조건·제약을 보존하되, 지침 로딩과 실행 방식은 자신의 기능에 맞게 구성한다.

공통 원천은 `.agent-source/project/source.md`, `.agent-source/conventions/code-quality/source.md`, `.agent-source/conventions/test-writing/source.md`, `.agent-source/conventions/react-best-practices/source.md`, `.agent-source/skills/*/source.md`이며, Codex 실행 방식은 `.agent-source/adapters/codex/`에서 관리한다.

스킬은 `.agents/skills/<name>/SKILL.md`에 한 번만 설치한다. 일부 Codex 버전은 `.codex/skills/`도 발견하므로 같은 이름의 복사본을 두지 않는다. Codex UI 메타데이터와 호출 정책은 각 스킬의 `agents/openai.yaml`에서 읽는다.

지침 변경은 `$sync-instructions`로 생성·검사한다. 모델, 승인 정책, 샌드박스, 전역 설정은 현재 세션의 값을 유지한다. 설정 파일이 필요해지는 작업에서는 해당 설치 버전의 지원 항목과 프로젝트 신뢰 설정을 먼저 확인한다.
