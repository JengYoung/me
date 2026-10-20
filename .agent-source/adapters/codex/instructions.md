# Codex 지침 관리 규칙

루트 `AGENTS.md`가 AI 지침 작업에서 이 문서를 읽도록 지정한다.

{{MAINTENANCE}}

프로젝트 공통 규칙은 `.agent-source/project/source.md`의 목차에서 주제를 찾고 같은 디렉터리의 해당 Markdown 파일에서 수정한다. 코드 품질·테스트 작성·React 상세 정책은 `.agent-source/conventions/*/source.md`, 스킬 계약은 `.agent-source/skills/*/source.md`, Codex 실행 방식은 `.agent-source/adapters/codex/`에서 관리한다.

스킬은 `.agents/skills/<name>/SKILL.md`에 한 번만 설치한다. 일부 Codex 버전은 `.codex/skills/`도 발견하므로 같은 이름의 복사본을 두지 않는다. Codex UI 메타데이터와 호출 정책은 각 스킬의 `agents/openai.yaml`에서 읽는다.

지침 변경은 `$sync-instructions`로 생성·검사한다. 모델, 승인 정책, 샌드박스, 전역 설정은 현재 세션의 값을 유지한다. 설정 파일이 필요해지는 작업에서는 해당 설치 버전의 지원 항목과 프로젝트 신뢰 설정을 먼저 확인한다.
