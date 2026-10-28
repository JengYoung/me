import type { ReactNode } from 'react';
import styles from './article.module.css';

export function ArticleTableOfContents({ children }: { children: ReactNode }) {
  return (
    <aside data-article-toc className={styles.toc}>
      <nav aria-label="본문 목차" className="hidden rounded-16 bg-bg-surface p-16px desktop:block">
        <p className="mb-12px text-body-3 font-bold">이 글의 목차</p>
        {children}
      </nav>
      <details className="rounded-12 border border-border bg-bg-surface desktop:hidden">
        <summary className="min-h-48px cursor-pointer rounded-12 px-16px py-12px text-body-3 hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-ring">
          이 글의 목차
        </summary>
        <nav aria-label="본문 목차" className="px-16px pb-16px">
          {children}
        </nav>
      </details>
    </aside>
  );
}
