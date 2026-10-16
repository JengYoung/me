<!-- AUTO-GENERATED from .agent-source/project/source.md by scripts/sync-instructions.mjs. Do not edit; run node scripts/sync-instructions.mjs --write. -->

# 프로젝트 안내

현재 작업 공간의 파일과 사용자가 확정한 요구사항을 근거로 작업한다. 아직 정해지지 않은 제품 목적이나 기술 스택을 가정하지 않는다.

## 기본 작업 원칙

- 설명과 결과는 한국어로 작성하고 코드 식별자와 명령은 원문을 유지한다.
- 요청한 범위의 구현과 필요한 검증까지 진행한다. 결과에 영향을 주는 정보가 부족할 때만 질문한다.
- 기존 기록과 사용자 변경을 보존한다. 외부 게시·전송·배포 등은 사용자가 맡긴 범위에서 실행한다.

- JavaScript·TypeScript lint는 Oxlint, 코드 포맷팅은 Oxfmt, 타입 검사는 TypeScript compiler가 담당한다. 상세 정책은 `.agent-source/conventions/code-quality/source.md`에서 관리하고 각 도구의 코드 품질 지침으로 생성한다.
- Iris 코어 `packages/ui/src/base/**`는 스타일·구조 컨벤션과 포맷 적용에서 제외한다. correctness·타입·실제 동작 검증은 유지한다.
- 실행 명령과 의존성은 현재 파일에서 확인한다. 코드 변경은 영향받는 동작을, 문서 변경은 내용과 참조를 검증한다.
- 결과에는 바뀐 내용, 실제 실행한 검사, 미검증 항목을 구분해 적는다. 파일 일치 검사만으로 도구의 실행까지 검증됐다고 보고하지 않는다.

코드 작성·수정·리뷰와 lint·포맷·타입 설정 작업에서는 [코드 품질 규칙](.claude/rules/code-quality.md)을 확인하고 적용한다.

## Claude Code에서 사용하기

- 프로젝트 기본 지침은 이 `CLAUDE.md`에서 읽는다. 작업 대상 하위 디렉터리의 `CLAUDE.md`와 적용되는 `.claude/rules/`도 따른다.
- 작업별 절차는 `.claude/skills/`의 스킬로 둔다. 각 스킬의 설명이 현재 요청에 맞을 때 사용한다.
- AI 지침 파일에 대한 유지보수 원칙은 `.claude/rules/instruction-maintenance.md`에 경로별 규칙으로 둔다.
- `Read`·`Edit`·`Bash` 등의 권한은 현재 세션 설정을 따른다. 이 문서와 스킬은 권한을 부여하지 않는다.

## 프로젝트 스킬

- `/sync-instructions` — 프로젝트 AI 지침과 스킬을 공통 원천에서 동기화하거나 검사한다. AI 지침 변경·재생성·불일치 점검에 사용하며, 일반 제품 코드나 문서 수정에는 사용하지 않는다.
  파일: `.claude/skills/sync-instructions/SKILL.md`
- `/turborepo` — Turborepo의 작업 실행·캐시·환경변수·패키지 경계·CI 구성을 설치 버전의 문서에 맞춰 설정하거나 진단한다. turbo 설정과 모노레포 작업 흐름에 사용하며, 일반 Next.js·NestJS 기능 구현에는 적용하지 않는다.
  파일: `.claude/skills/turborepo/SKILL.md`

## 범위

- Claude Code: **로그인 만료 = 잠정 보류**. 지침·스킬 생성과 정적 검사는 계속한다. 사용자가 재개를 요청할 때까지 해당 도구의 CLI 실행·모델 호출·인증 복구·결제 변경을 시도하지 않는다. `.agent-source/targets.json`의 `runtime.status`를 임의로 해제하지 않는다.

- 사용자 전역 설정이나 다른 작업 공간을 이 프로젝트의 동기화 대상으로 삼지 않는다.
- 비밀값, 개인 절대 경로, 세션 기록을 공통 지침에 포함하지 않는다.
- 모든 작업에 계획서, 별도 승인, 에이전트 분업을 의무화하지 않는다.
