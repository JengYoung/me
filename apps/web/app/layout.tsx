import type { Metadata } from 'next';
import Script from 'next/script';
import { SITE_NAME, SITE_DEFAULT_TITLE } from '../shared/config';
import { BlogFrame } from '../widgets/blog-frame';
import './globals.css';

export const metadata: Metadata = {
  title: { default: SITE_DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-theme="light">
      <head>
        <link rel="preload" href="/fonts/pretendard/pretendard-variable.css" as="style" />
        <noscript>
          {/* JavaScript가 없어도 같은 서브셋 폰트를 사용합니다. */}
          {/* oxlint-disable-next-line nextjs/no-css-tags */}
          <link rel="stylesheet" href="/fonts/pretendard/pretendard-variable.css" />
        </noscript>
      </head>
      <body className="min-h-svh bg-bg-surface font-sans text-ink">
        <BlogFrame>{children}</BlogFrame>
        {/* 화면 CSS와 분리해 첫 렌더링을 막지 않고 폰트를 적용합니다. */}
        <Script id="pretendard-styles" strategy="afterInteractive">
          {`{
            const stylesheet = document.createElement('link');
            stylesheet.rel = 'stylesheet';
            stylesheet.href = '/fonts/pretendard/pretendard-variable.css';
            document.head.appendChild(stylesheet);
          }`}
        </Script>
      </body>
    </html>
  );
}
