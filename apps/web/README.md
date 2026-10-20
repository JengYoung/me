This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Storybook

`apps/web`의 컴포넌트를 [Storybook for Next.js (Vite)](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite)로 확인합니다. 저장소 루트에서 실행합니다.

```bash
pnpm storybook
```

브라우저에서 <http://localhost:6006>을 엽니다. Next.js 개발 서버는 별도로 실행하지 않아도 됩니다. 앱 디렉터리에서는 `pnpm storybook`, 루트에서 앱만 직접 실행하려면 `pnpm --filter web storybook`을 사용합니다.

```bash
pnpm build-storybook
```

정적 결과는 `apps/web/storybook-static/`에 생성되며 Git에서 제외됩니다. Turbo는 의존 패키지 변경을 빌드 입력에 포함하고 정적 결과를 캐시합니다. 기본 `pnpm dev`와 `pnpm build`에는 Storybook이 포함되지 않습니다.

### 미리보기

- Header: 기본, 긴 제목, 모바일, 스크롤 플러그인 스토리.
- Sidebar: 기본, 처음부터 열림, 모바일, 열기·닫기 상호작용 스토리.
- Close: 기본, 16·20·24·32px 크기, 부모 색상 상속, 아이콘 버튼, 접근성 이름 스토리. `Shared / Icons / Close`에서 확인합니다.
- Docs에서 컴포넌트 사용법을 확인하고 Controls에서 Header의 제목을 변경할 수 있습니다. 고정 헤더와 Sidebar portal은 Docs에서도 개별 iframe 안에 표시됩니다.
- 도구 모음에서 Light/Dark와 390·1199·1200·1440px 화면 크기를 선택합니다. `Mobile` 스토리는 390px로 고정되므로 크기를 자유롭게 바꾸려면 `Default` 스토리를 사용합니다.
- `Sidebar / Open And Close`의 `play`는 열기, Escape로 닫기, 닫기 버튼, 트리거로의 포커스 복귀를 검증합니다. 이 스토리를 열면 실행되며 결과는 Interactions 패널에서 확인합니다. `build-storybook`은 `play`를 실행하지 않습니다.

앱의 `app/globals.css`, `app/design-token.css`, 로컬 Pretendard 폰트를 공유합니다. Storybook에서는 `@tailwindcss/vite`로 CSS와 폰트 경로를 처리하고, `public/`을 정적 파일로 제공합니다. 테마는 `html[data-theme]`에 적용되므로 `document.body`에 렌더링하는 portal에도 전달됩니다.

### 스토리 추가

`app`, `shared`, `entities`, `features`, `widgets`, `screens` 아래에 `*.stories.ts` 또는 `*.stories.tsx`를 컴포넌트와 함께 추가합니다. `Meta`, `StoryObj`는 `@storybook/nextjs-vite`에서 가져오고, 예제는 `shared/ui/layout/header.stories.tsx`를 참고합니다. 스토리를 제품 코드의 `index.ts`에서 export하지 않습니다.

스타일에는 Figma Brand에 등록된 Semantic·Typography·숫자 여백·반경 토큰을 사용합니다. 화면 분기는 앱의 `mobile:`(<1200px), `desktop:`(≥1200px) 계약을 따릅니다. 설정은 `.storybook/main.ts`, 전역 스타일·테마·viewport는 `.storybook/preview.ts`에서 관리합니다.

```bash
pnpm --filter web lint
pnpm --filter web check-types
pnpm build-storybook
```

Storybook 10.6.2의 하위 의존성 `tsconfck@3.1.6`은 TypeScript 5만 peer 범위에 명시해 현재 TypeScript 7에서 설치 경고가 발생합니다. 저장소의 TypeScript 버전은 유지하며 타입 검사와 실제 빌드로 호환성을 확인합니다.

Vite 8의 정적 빌드에는 기존 컴포넌트의 `use client` 지시문에 대한 `MODULE_LEVEL_DIRECTIVE` 경고가 출력됩니다. Storybook은 클라이언트에서 렌더링하며 빌드는 완료됩니다. 이 경고를 없애기 위해 제품 컴포넌트의 지시문을 제거하지 않습니다.

## 컴포넌트 테스트

Header·Sidebar는 Vitest Browser Mode와 Playwright의 실제 Chromium으로 검사합니다. 저장소 루트에서 최초 한 번 브라우저를 설치한 뒤 실행합니다. Next.js나 Storybook 서버는 필요하지 않습니다.

```bash
pnpm --filter web exec playwright install chromium --only-shell
pnpm --filter web test
pnpm --filter web test:watch
```

`vitest.config.ts`에 정의한 실행 환경은 다음과 같습니다.

- `node`: `shared/**/*.ssr.test.tsx`를 DOM 전역 없이 실행합니다.
- `chromium-mobile-light`: 390×844px, 밝은 테마에서 `shared/**/*.browser.test.tsx`를 실행합니다.
- `chromium-desktop-dark`: 1440×900px, 어두운 테마에서 같은 브라우저 테스트를 실행합니다.

Header의 슬롯·제목, 스크롤 방향·포커스에 따른 노출, 플러그인 해제를 확인합니다. Sidebar는 열기·닫기, 제어 상태, ARIA 연결, Tab 순환·포커스 복귀, 배경 클릭 차단, unmount 시 inert·스크롤 잠금 해제를 확인합니다. hydration에서는 서버 DOM의 재사용과 인스턴스별 ID·ARIA 연결, 오류 부재를 검사합니다.

브라우저 테스트는 앱 CSS·로컬 폰트를 사용하고 StrictMode를 적용합니다. `vitest-browser-react/pure`의 `render`를 사용하며 설정 파일 옆 `vitest.setup.ts`의 `afterEach`가 각 테스트 종료 시 DOM·portal·effect를 정리합니다. 테스트가 직접 만든 DOM·구독·spy·전역 상태는 획득 직후 `onTestFinished`에 정리를 등록합니다. 수동 hydration root도 테스트가 직접 해제합니다.

파일을 지정하거나 실행 순서를 바꿔 격리를 확인할 수 있습니다.

```bash
pnpm --filter web test shared/ui/layout/sidebar.browser.test.tsx
pnpm --filter web test --sequence.shuffle --sequence.seed=20261020
```

이 명령의 검증 범위는 Chromium 컴포넌트 동작과 Node SSR입니다. 실제 앱을 실행하는 E2E는 아래 명령으로 분리합니다. 다른 브라우저와 Figma 픽셀 비교는 현재 구성에 포함하지 않습니다. 루트의 lint·타입 검사와 `build-storybook`은 컴포넌트 테스트를 대신 실행하지 않습니다.

## 앱 통합 테스트: Playwright E2E

`playwright.config.ts`의 `webServer`가 `next build` 후 `next start`로 실제 앱을 실행합니다. 테스트는 `http://127.0.0.1:3100`에 접속하며 종료 시 서버도 정리합니다. 실행 중인 개발 서버를 재사용하지 않으므로 3100 포트는 비어 있어야 합니다.

저장소 루트에서 실행합니다.

```bash
pnpm --filter web exec playwright install chromium
pnpm --filter web test:e2e
```

- `chromium-desktop-dark`: 1440×900px, 데스크톱 Chrome·Dark.
- `chromium-mobile-light`: 390×844px, Chromium의 모바일·터치 에뮬레이션·Light.
- 각 테스트는 Playwright의 독립된 `page`·브라우저 컨텍스트를 사용합니다. 기본 재시도는 없으며 최대 2개 worker로 병렬 실행합니다.
- 실패 시 스크린샷과 trace는 `test-results/e2e/`, HTML 보고서는 `playwright-report/`에 남습니다. 생성물은 Git에서 제외합니다.

```bash
pnpm --filter web test:e2e --project=chromium-mobile-light
pnpm --filter web test:e2e:ui
pnpm --filter web test:e2e:report
```

Linux CI에서는 의존성 설치 후 브라우저와 시스템 라이브러리를 함께 준비합니다. 아래 명령을 CI 작업에 추가할 수 있으며 GitHub Actions 워크플로는 아직 구성하지 않았습니다.

```bash
pnpm --filter web exec playwright install --with-deps chromium
pnpm --filter web test:e2e
```

현재 홈은 `null`을 반환하고 Header·Sidebar가 앱 경로에 연결되어 있지 않습니다. `app/page.tsx` 옆의 `app/page.e2e.spec.ts`는 홈 문서·스크립트·스타일 로딩과 브라우저 오류, 없는 경로의 404 응답·안내 화면을 검사합니다. 이 실행을 Header·Sidebar의 앱 사용자 흐름 검증이나 전체 앱 기능 검증으로 간주하지 않습니다.

테스트 소스는 대상 파일과 같은 디렉터리에 둡니다. `e2e/`, `tests/`, `__tests__/` 같은 별도 테스트 디렉터리를 만들지 않습니다. E2E 파일명은 `<대상 파일명>.e2e.spec.ts`이며, 여러 페이지를 거치는 흐름은 주된 대상 페이지·기능 파일 옆에 둡니다. 공용 setup은 설정 파일 옆에, 테스트 전용 helper·fixture는 사용하는 테스트 옆에 둡니다.

`playwright.config.ts`는 앱 루트의 `**/*.e2e.spec.ts`만 수집하고 `.gitignore`의 제외 경로를 따릅니다. Vitest의 `.browser.test.tsx`·`.ssr.test.tsx`와 구분되며, 생성 보고서·빌드 산출물은 수집하지 않습니다. 특정 페이지의 테스트만 실행할 수도 있습니다.

```bash
pnpm --filter web test:e2e app/page.e2e.spec.ts
```

새 앱 흐름은 대상 파일 옆 E2E에서 `@playwright/test`를 가져와 작성합니다. `page.goto()`로 실제 앱 경로에 접속하고 사용자에게 보이는 결과를 검사합니다. 컴포넌트·Hook·함수의 세부 조건은 Vitest에 두며, 별도로 mount한 컴포넌트나 Storybook을 앱 E2E의 대상으로 삼지 않습니다. 앱 화면이 연결되면 메뉴 이동·키보드 포커스·스크롤 잠금 등 실제 사용자 흐름을 추가합니다.

## SVG 아이콘

공통 아이콘 원본은 `shared/ui/icons/*.svg`에 두고 `?react`를 붙여 가져옵니다. SVGO 최적화와 SVGR의 React 컴포넌트 변환은 빌드 중 실행됩니다. 브라우저에는 변환된 SVG 컴포넌트가 포함되며 SVG 파일을 받기 위한 별도 요청은 발생하지 않습니다.

`CloseIcon`처럼 크기·색상·ARIA props를 전달하는 공통 UI 아이콘은 `shared/ui/icons`에서 원본, 공개 API, 스토리를 함께 관리합니다. `public`은 `/images/example.svg`처럼 URL로 직접 표시하거나 다운로드할 정적 자산에 사용합니다. URL로 읽는 파일은 현재 `?react` import 변환을 거치지 않습니다. 폴더명 자체가 성능을 결정하지 않으며, SVG를 React 컴포넌트로 포함할지 별도 이미지로 로드할지에 따라 선택합니다.

```tsx
// shared/ui/layout에서는 icons의 공개 API를 사용합니다.
import { CloseIcon } from '../icons';

<button type="button" aria-label="닫기">
  <CloseIcon aria-hidden="true" focusable="false" className="size-24px" />
</button>;
```

`shared/ui/icons/index.ts`에서 `export { default as CloseIcon } from './close.svg?react'`로 공개합니다. 다른 FSD 영역에서 사용하는 아이콘은 `shared/ui/index.ts`에도 export하고 해당 공개 API로 가져옵니다. `className`, ARIA 속성 등 표준 SVG props를 전달할 수 있습니다. 장식용 아이콘은 숨기고 버튼에 이름을 제공하며, 아이콘 자체가 의미를 전달하면 `role="img"`와 `aria-label`을 지정합니다.

`svgr.config.js`를 Next.js Turbopack, Storybook Vite, Vitest가 공유합니다. `viewBox`를 유지하고 고정 `width`·`height`는 제거하므로 크기는 기존 디자인 토큰으로 명시합니다. 단색 아이콘은 `currentColor`로 색상을 상속합니다. SVGO는 ID 접두어도 적용하며 SVGR의 Prettier 실행은 비활성화합니다.

`?react`가 없는 SVG import는 프레임워크의 기존 이미지 처리를 따릅니다. 큰 삽화까지 React 아이콘으로 변환하지 말고 용도에 맞게 정적 이미지로 사용합니다. `next build --webpack`용 로더는 구성하지 않았으며 현재 앱의 기본 Turbopack 빌드를 사용합니다.

`pnpm --filter web test`에서 실제 SVG 변환을 거친 SSR·사이드바 동작을 검사합니다. Lighthouse 점수는 전체 페이지의 영향을 받으므로 변환 도입만으로 고정된 점수를 보장하지 않습니다. 성능을 비교할 때는 같은 화면의 프로덕션 빌드에서 SVG 요청·번들 크기·레이아웃 이동과 반복 측정 결과를 함께 확인합니다.
