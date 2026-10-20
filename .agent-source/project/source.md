# 프로젝트 공통 계약

## 목적

현재 작업 공간의 파일과 사용자가 확정한 요구사항을 근거로 작업한다. 아직 정해지지 않은 제품 목적이나 기술 스택을 가정하지 않는다.

## 작업 방식

- 설명과 결과는 한국어로 작성하고 코드 식별자와 명령은 원문을 유지한다.
- 요청한 범위의 구현과 필요한 검증까지 진행한다. 결과에 영향을 주는 정보가 부족할 때만 질문한다.
- 기존 기록과 사용자 변경을 보존한다. 외부 게시·전송·배포 등은 사용자가 맡긴 범위에서 실행한다.

## 품질 기준

- JavaScript·TypeScript lint는 Oxlint, 코드 포맷팅은 Oxfmt, 타입 검사는 TypeScript compiler가 담당한다. 상세 정책은 `.agent-source/conventions/code-quality/source.md`에서 관리하고 각 도구의 코드 품질 지침으로 생성한다.
- Iris 코어 `packages/ui/src/base/**`는 스타일·구조 컨벤션과 포맷 적용에서 제외한다. correctness·타입·실제 동작 검증은 유지한다.
- 제품의 함수·Hook·컴포넌트 단위 검증은 Vitest, 실제 앱을 실행하는 앱 단위 통합 테스트는 Playwright E2E로 작성한다. 테스트 작성·수정·리뷰와 fixture·테스트 환경 변경에는 `.agent-source/conventions/test-writing/source.md`의 독립성·실패 시 정리·공개 동작 검증 계약을 적용하고 현재 실행 범위와 절차를 확인한다.
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

### 버전 관리

- `apps/*`와 `packages/*`는 Changesets로 각각 독립 버전을 관리한다. 루트 `package.json`에는 제품 버전을 두지 않으며, `.changeset/config.json`의 `fixed`·`linked`는 빈 배열로 유지한다.
- 버전 변경은 `.changeset/*.md`의 패키지명·SemVer bump·변경 요약을 근거로 한다. 패키지 버전을 수동으로 올리거나 모든 패키지를 같은 버전으로 맞추지 않는다.
- 사용자에게 영향을 주는 변경을 릴리즈에 포함할 때 해당 패키지의 changeset을 작성한다. 문서·테스트·개발 도구 변경만으로 제품 버전을 올리지 않으며, changeset 작성과 버전 적용을 구분한다.
- 버전 조회·changeset 작성·릴리즈 버전 적용에는 프로젝트의 `changesets-version` 스킬을 사용한다. 일반 구현·커밋·배포 요청에 `release:version` 실행을 자동으로 포함하지 않는다.
- 버전 적용은 `pnpm changeset:status`로 전체 대기 changeset과 의존성 전파를 확인한 뒤, 요청 범위가 맞으면 `pnpm release:version`으로 실행한다. `package.json`·패키지별 `CHANGELOG.md`·소비된 changeset·`pnpm-lock.yaml`을 함께 검증한다.
- 내부 의존성은 `workspace:` 프로토콜을 유지한다. 독립 버전이어도 Changesets의 의존성 전파로 소비 패키지가 함께 bump될 수 있으므로 전체 계획을 확인한다. 제품 변경으로 특정 앱 릴리즈가 필요하면 해당 앱을 changeset에 명시한다.
- `private: true`를 유지하며 private 패키지도 버전 관리한다. 자동 커밋·태그·npm 게시·외부 배포는 버전 적용에 포함하지 않는다. prerelease·snapshot은 명시적으로 요청한 경우에만 별도 범위를 확인한다.

## 지침 관리

- 공통 정책과 스킬의 행동 계약은 원천에서 수정한다. 도구별 실행 방법과 메타데이터는 해당 도구의 어댑터에서 수정한다.
- 생성물을 직접 고치지 않는다. 원천 변경 후 지원 도구의 산출물을 함께 갱신하고 검사한다.
- 각 도구는 같은 목적·입력·완료 조건·제약을 보존하되, 지침 로딩과 실행 방식은 자신의 기능에 맞게 구성한다.

## Non-goals

- 사용자 전역 설정이나 다른 작업 공간을 이 프로젝트의 동기화 대상으로 삼지 않는다.
- 비밀값, 개인 절대 경로, 세션 기록을 공통 지침에 포함하지 않는다.
- 모든 작업에 계획서, 별도 승인, 에이전트 분업을 의무화하지 않는다.
