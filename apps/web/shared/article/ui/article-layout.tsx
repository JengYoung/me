import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './article.module.css';

export type ArticleTypography = 'default' | 'serif';

export function ArticleLayout({
  children,
  typography = 'default',
}: {
  children: ReactNode;
  typography?: ArticleTypography;
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`${typography === 'serif' ? styles.serif : ''} mx-auto max-w-3xl space-y-32px px-24px py-40px desktop:px-0 desktop:py-64px`}
    >
      {children}
    </main>
  );
}

export function ArticleBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-48px items-center rounded-4 text-title-4 text-ink-secondary underline focus-visible:outline-2 focus-visible:outline-ring"
    >
      {children}
    </Link>
  );
}
