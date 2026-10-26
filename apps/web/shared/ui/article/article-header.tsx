import type { ReactNode } from 'react';
import styles from './article.module.css';

export function ArticleHeader({
  title,
  summary,
  tags,
  before,
  after,
}: {
  title: string;
  summary: string;
  tags: readonly string[];
  before?: ReactNode;
  after?: ReactNode;
}) {
  return (
    <header className="space-y-16px border-b border-border pb-32px">
      {before}
      <h1 className="break-words break-keep text-heading-4 desktop:text-heading-2">{title}</h1>
      {summary && <p className={`${styles.summary} text-body-2 text-ink-secondary desktop:text-body-1`}>{summary}</p>}
      {tags.length > 0 && (
        <ul aria-label="태그" className="flex flex-wrap gap-8px text-body-3 text-ink-secondary">
          {tags.map((tag) => (
            <li key={tag} className="rounded-full bg-bg-subtle px-12px py-4px">
              {tag}
            </li>
          ))}
        </ul>
      )}
      {after}
    </header>
  );
}
