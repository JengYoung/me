# 디자인 토큰

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
