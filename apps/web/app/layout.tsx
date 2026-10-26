import type { Metadata } from 'next';
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
      <body className="min-h-svh bg-bg-surface font-sans text-ink">
        <BlogFrame>{children}</BlogFrame>
      </body>
    </html>
  );
}
