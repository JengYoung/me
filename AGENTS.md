<!-- AUTO-GENERATED from .agent-source/project/source.md by scripts/sync-instructions.mjs. Do not edit; run node scripts/sync-instructions.mjs --write. -->

# 프로젝트 작업 지침

현재 작업 공간의 파일과 사용자가 확정한 요구사항을 근거로 작업한다. 아직 정해지지 않은 제품 목적이나 기술 스택을 가정하지 않는다.

## 작업과 검증

- 설명과 결과는 한국어로 작성하고 코드 식별자와 명령은 원문을 유지한다.
- 요청한 범위의 구현과 필요한 검증까지 진행한다. 결과에 영향을 주는 정보가 부족할 때만 질문한다.
- 기존 기록과 사용자 변경을 보존한다. 외부 게시·전송·배포 등은 사용자가 맡긴 범위에서 실행한다.

- JavaScript·TypeScript lint는 Oxlint, 코드 포맷팅은 Oxfmt, 타입 검사는 TypeScript compiler가 담당한다. 상세 정책은 `.agent-source/conventions/code-quality/source.md`에서 관리하고 각 도구의 코드 품질 지침으로 생성한다.
- Iris 코어 `packages/ui/src/base/**`는 스타일·구조 컨벤션과 포맷 적용에서 제외한다. correctness·타입·실제 동작 검증은 유지한다.
- React·Next.js 작성·수정·리뷰에는 `.agent-source/conventions/react-best-practices/source.md`의 Vercel 기반 지침을 적용한다. 불필요한 비동기 직렬 대기·초기 번들을 우선 확인하며, 성능 최적화에서도 FSD 공개 API·Hook 호출 규칙·요청 격리·기존 디자인 토큰 계약을 보존한다.
- 실행 명령과 의존성은 현재 파일에서 확인한다. 코드 변경은 영향받는 동작을, 문서 변경은 내용과 참조를 검증한다.
- 결과에는 바뀐 내용, 실제 실행한 검사, 미검증 항목을 구분해 적는다. 파일 일치 검사만으로 도구의 실행까지 검증됐다고 보고하지 않는다.

디자인 토큰은 다음 계약을 반드시 따른다.

- **유일한 정본은 [Figma Brand](https://www.figma.com/design/GfYyF8klIKTizVSaE9g34S/%EB%B8%94%EB%A1%9C%EA%B7%B8?node-id=8-8)다. 이 정본에 없는 디자인 토큰을 새로 만들거나 사용하는 것은 허용하지 않는다.**
- 모든 UI 생성·수정·리뷰 전에 정본의 관련 가이드와 `apps/web/app/design-token.css`, `apps/web/app/globals.css`를 읽는다. 기준 가이드는 [Color Palette](https://www.figma.com/design/GfYyF8klIKTizVSaE9g34S?node-id=13-616), [Padding & Radius](https://www.figma.com/design/GfYyF8klIKTizVSaE9g34S?node-id=34-490), [Typography](https://www.figma.com/design/GfYyF8klIKTizVSaE9g34S?node-id=39-514)다. Figma URL이 없는 구현 요청에도 이 계약을 적용한다.
- `design-token.css`는 정본의 코드 구현이며 독립적인 승인 근거가 아니다. 기존 코드나 다른 프로젝트에 값이 있다는 이유로 허용된 토큰으로 간주하지 않는다. 이름·값·단위·Light/Dark 연결이 다르면 Figma 정본을 기준으로 불일치를 확인한다.
- 색상·타이포그래피·여백·반경·그림자 등 시각 속성은 정본에 등록된 토큰을 재사용한다. 등록되지 않은 값을 Tailwind 기본 시각 토큰, arbitrary value(`bg-[#...]`, `p-[18px]` 등), CSS 변수·하드코딩·inline style·새 별칭으로 우회하지 않는다. 이 규칙은 Tailwind, CSS Modules, 일반 CSS에 동일하게 적용한다.
- 화면의 배경·글자·테두리·포커스·상태에는 Light/Dark가 연결된 Semantic 토큰을 사용한다. 예: `bg-bg-surface`, `text-ink`, `border-border`, `outline-ring`. 원시 팔레트는 정본에서 정의한 브랜드 자산·팔레트 견본에 사용하며, 컴포넌트마다 테마 값을 재정의하지 않는다.
- 타이포그래피는 Pretendard Variable과 `text-title-2`, `text-body-2` 같은 합성 토큰을 사용한다. 여백·반경은 `p-16px`, `gap-24px`, `rounded-16`처럼 등록된 수치 토큰을 사용한다. `p-card`, `rounded-chip` 같은 용도별 별칭을 만들지 않는다. 기본 Tailwind 스케일(`p-4 = 16px`, `w-16 = 64px`)을 바꾸지 않는다.
- 반응형 구간은 `globals.css`의 `mobile:`(1200px 미만), `desktop:`(1200px 이상)을 재사용한다. 같은 이름의 경계를 컴포넌트별로 다르게 정의하지 않는다.
- 필요한 토큰을 정본에서 확인할 수 없으면 해당 스타일 적용을 보류하고 누락·불일치를 보고한다. 값을 추정하거나 비슷한 새 토큰을 만들어 채우지 않는다. 구현에 맞추기 위해 Figma 변수·가이드를 임의로 추가·수정하지 않는다.
- 변경 후 사용한 토큰과 정본의 대응, Light/Dark, mobile/desktop, 관련 상호작용 상태를 검증한다. 미등록 값이나 토큰 우회가 남아 있으면 완료로 보고하지 않는다. Figma 조회·시각 검증을 하지 못한 항목은 미검증으로 구분한다. Iris 코어의 스타일·구조 컨벤션 예외는 소비 UI의 디자인 토큰 계약을 면제하지 않는다.

코드 작성·수정·리뷰와 lint·포맷·타입 설정 작업 전에는 [코드 품질 정책](.codex/code-quality.md)을 읽고 적용한다.
React·Next.js 컴포넌트·Hook·페이지·데이터 조회·성능 관련 코드를 작성·수정·리뷰하기 전에는 [React Best Practices](.codex/react-best-practices.md)를 읽고 적용한다.

## Codex에서 적용하기

- 이 파일은 프로젝트의 `AGENTS.md`다. 하위 작업 범위에 지침이 있으면 함께 확인하고 적용 범위를 따른다. `AGENTS.override.md`가 있으면 같은 디렉터리의 `AGENTS.md`보다 먼저 선택된다.
- 프로젝트 스킬은 `.agents/skills/`에서 발견한다. 이름과 설명으로 필요한 스킬을 선택하고, 해당 `SKILL.md` 및 필요한 참조만 읽는다.
- 파일 쓰기가 샌드박스에 막히면 실행 도구의 승인 절차를 사용한다. 승인 정책이나 사용자 전역 설정을 변경해 해결하지 않는다.

## 프로젝트 스킬

아래 설명이 현재 요청에 맞을 때 해당 스킬을 사용한다.

- `$sync-instructions` — 프로젝트 AI 지침과 스킬을 공통 원천에서 동기화하거나 검사한다. AI 지침 변경·재생성·불일치 점검에 사용하며, 일반 제품 코드나 문서 수정에는 사용하지 않는다.
  파일: `.agents/skills/sync-instructions/SKILL.md`
- `$turborepo` — Turborepo의 작업 실행·캐시·환경변수·패키지 경계·CI 구성을 설치 버전의 문서에 맞춰 설정하거나 진단한다. turbo 설정과 모노레포 작업 흐름에 사용하며, 일반 Next.js·NestJS 기능 구현에는 적용하지 않는다.
  파일: `.agents/skills/turborepo/SKILL.md`

## AI 지침을 변경할 때

지침 작업에서는 먼저 [Codex 지침 관리 규칙](.codex/instructions.md)을 읽고 `$sync-instructions`를 사용한다. 이 참조는 해당 작업에 필요한 상세 지침이며 별도의 자동 로딩 파일로 가정하지 않는다. 일반 작업에서는 동기화 절차를 실행할 필요가 없다. 생성 구조와 검사 범위는 `.agent-source/README.md`를 참고한다.

## 범위

- Claude Code: **로그인 만료 = 잠정 보류**. 지침·스킬 생성과 정적 검사는 계속한다. 사용자가 재개를 요청할 때까지 해당 도구의 CLI 실행·모델 호출·인증 복구·결제 변경을 시도하지 않는다. `.agent-source/targets.json`의 `runtime.status`를 임의로 해제하지 않는다.

- 사용자 전역 설정이나 다른 작업 공간을 이 프로젝트의 동기화 대상으로 삼지 않는다.
- 비밀값, 개인 절대 경로, 세션 기록을 공통 지침에 포함하지 않는다.
- 모든 작업에 계획서, 별도 승인, 에이전트 분업을 의무화하지 않는다.
