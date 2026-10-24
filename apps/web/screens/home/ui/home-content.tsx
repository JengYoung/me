import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { HomeContentItem } from '../model/get-home-content';
import { ContentCube } from './content-cube';
import styles from './home-content.module.css';

function ContentSection({
  kind,
  title,
  items,
}: {
  kind: 'Post' | 'Series';
  title: string;
  items: readonly HomeContentItem[];
}) {
  const slug = kind.toLowerCase();
  return (
    <section aria-labelledby={`home-${slug}-title`} className={styles.section}>
      <header className="flex flex-wrap items-end justify-between gap-24px">
        <div className="space-y-12px">
          <p className="text-title-3 text-action-primary-bg">{kind}</p>
          <h2 id={`home-${slug}-title`} className="break-keep text-heading-5 text-balance desktop:text-heading-2">
            {title}
          </h2>
        </div>
        <Link
          href={kind === 'Post' ? '/posts' : '/series?showType=carousel'}
          className="inline-flex min-h-48px shrink-0 items-center gap-12px rounded-full border border-border bg-bg-surface px-20px py-12px text-title-4 hover:bg-bg-subtle active:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {kind === 'Post' ? '글 목록 보러가기' : '시리즈 목록 보러가기'}
          <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </header>
      {items.some((item) => item.isDraft) && <p className="mt-12px text-body-3 text-ink-muted">로컬 초안 미리보기</p>}
      {items.length > 0 ? (
        <ul className={styles.list} data-count={items.length}>
          {items.map((item) => (
            <li key={item.id}>
              <ContentCube item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-64px text-body-2 text-ink-secondary">
          {kind === 'Post' ? '첫 번째 글을 준비하고 있어요.' : '새로운 시리즈를 준비하고 있어요.'}
        </p>
      )}
    </section>
  );
}

export function HomeContent({
  posts,
  series,
}: {
  posts: readonly HomeContentItem[];
  series: readonly HomeContentItem[];
}) {
  return (
    <div className={styles.content}>
      <ContentSection kind="Post" title="최근에 이런 글들을 썼어요" items={posts} />
      <ContentSection kind="Series" title="이런 것들에 관심 가지며 개발하고 있어요" items={series} />
    </div>
  );
}
