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
