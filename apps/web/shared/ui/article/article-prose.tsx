import type { ReactNode } from 'react';
import styles from './article.module.css';

export type ArticleProseProps = { children?: ReactNode; id?: string };

/** Markdown 매핑과 함께 사용하는 아티클 본문의 스타일 경계다. */
export function ArticleProse({ children, id }: ArticleProseProps) {
  return (
    <div
      id={id}
      data-article-prose
      tabIndex={id ? -1 : undefined}
      className={`${styles.prose} font-sans text-body-2 text-ink`}
    >
      {children}
    </div>
  );
}
