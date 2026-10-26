import Link from 'next/link';
import { ArticleLayout } from './article-layout';
import type { ArticleTypography } from './article-layout';
import styles from './article.module.css';

export interface ArticleListItem {
  id: string;
  href: string;
  title: string;
  summary: string;
  dateTime?: string;
  dateLabel?: string;
  isDraft?: true;
}

export function ArticleList({
  title,
  emptyMessage,
  items,
  typography = 'default',
}: {
  title: string;
  emptyMessage: string;
  items: readonly ArticleListItem[];
  typography?: ArticleTypography;
}) {
  return (
    <ArticleLayout typography={typography}>
      <h1 className="text-heading-4 desktop:text-heading-2">{title}</h1>
      {items.length === 0 ? (
        <p className="text-body-2 text-ink-secondary">{emptyMessage}</p>
      ) : (
        <ul className="space-y-24px">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block space-y-12px rounded-12 border border-border p-24px hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
              >
                <h2 className="text-title-1">{item.title}</h2>
                <p className={`${styles.summary} text-body-2 text-ink-secondary`}>{item.summary}</p>
                {item.dateTime && (
                  <time dateTime={item.dateTime} className="text-body-3 text-ink-muted">
                    {item.dateLabel}
                  </time>
                )}
                {item.isDraft && <span className="block text-body-3 text-ink-muted">로컬 초안 미리보기</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ArticleLayout>
  );
}
