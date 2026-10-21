# 프로젝트 지침 원천 목차

프로젝트 공통 규칙은 아래 주제별 파일에서 수정한다. 이 파일은 수정할 위치를 안내하는 목차이며, 규칙 본문을 중복해서 넣지 않는다.

| 주제                                   | 원천 파일                            | 생성 계약       |
| -------------------------------------- | ------------------------------------ | --------------- |
| 프로젝트 목적과 판단 근거              | [purpose.md](purpose.md)             | `PURPOSE`       |
| 작업 진행·소통·사용자 변경 보존        | [workflow.md](workflow.md)           | `WORKFLOW`      |
| 품질 도구·검증·결과 보고               | [quality.md](quality.md)             | `QUALITY`       |
| Figma 정본·디자인 토큰·반응형          | [design-tokens.md](design-tokens.md) | `DESIGN_TOKENS` |
| 콘텐츠 경로·발행·수정 이력·콘텐츠 버전 | [content.md](content.md)             | `CONTENT`       |
| 앱·패키지의 Changesets 버전 관리       | [versioning.md](versioning.md)       | `VERSIONING`    |
| 공통 원천·도구별 어댑터·재생성 원칙    | [maintenance.md](maintenance.md)     | `MAINTENANCE`   |
| 작업 범위와 제외 사항                  | [scope.md](scope.md)                 | `NON_GOALS`     |

콘텐츠 지침은 [content.md](content.md)의 작업별 안내에서 필요한 상세 원천을 선택해 읽는다. 상세 본문을 기본 지침에 합치지 않는다.

| 콘텐츠 작업 범위                  | 상세 원천                                      |
| --------------------------------- | ---------------------------------------------- |
| 저장·발행본·버전·자산·조회·이력   | [content/storage.md](content/storage.md)       |
| 아티클 Markdown·MDX·본문 컴포넌트 | [content/mdx.md](content/mdx.md)               |
| 로컬 발행 명령·검증·Git·배포 경계 | [content/publishing.md](content/publishing.md) |

코드 품질·테스트 작성·React의 상세 정책은 `../conventions/`에 있으며, 위 파일에서는 해당 정책의 적용 범위를 안내한다.

## 생성 방식

- `scripts/instruction-model.mjs`의 `PROJECT_SOURCES`가 주제별 파일과 생성 계약을 연결한다. 각 파일의 첫 번째 `#` 제목은 원천 탐색용이며, 그 아래 본문을 도구별 어댑터에 넣는다.
- 이 목차와 각 주제 파일의 해시를 관리한다. 합성된 프로젝트 지침의 생성 원천 표시는 이 목차를 가리킨다.
- `PROJECT_REFERENCES`의 상세 원천은 존재·제목·본문과 기본 안내의 참조를 검사하고 해시를 관리한다. 상세 본문을 생성물에 복제하지 않으며, Codex·Claude 모두 필요한 작업에서 해당 원천을 직접 읽는다.
- 새 주제는 원천 파일·이 목차·`PROJECT_SOURCES`·Codex/Claude 어댑터에 함께 연결한다. 각 계약은 도구별 지침 묶음에 정확히 한 번 포함되어야 하며, 누락·빈 본문·중복은 생성 오류다.
- 원천 수정 후 `node scripts/sync-instructions.mjs --write`와 `node scripts/sync-instructions.mjs --check`를 실행한다. `AGENTS.md`, `CLAUDE.md` 등 생성물을 직접 수정하지 않는다.

전체 구조와 검사 방법은 [AI 지침 관리 안내](../README.md)를 따른다.
