import type { HomeContentItem, HomeSeriesItem } from '../model/get-home-content';
import { ContentCube } from './content-cube';
import { HomeSeries } from './home-series';
import { HomeSectionLabel } from './home-section-label';
import styles from './home-content.module.css';

function RecentPosts({ items }: { items: readonly HomeContentItem[] }) {
  return (
    <section aria-labelledby="home-post-title" className={styles.section}>
      <header className="space-y-12px">
        <HomeSectionLabel label="Post" href="/posts" linkLabel="글 목록 보러가기" />
        <h2 id="home-post-title" className="break-keep text-heading-5 text-balance desktop:text-heading-2">
          최근에 이런 글들을 썼어요
        </h2>
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
        <p className="py-64px text-body-2 text-ink-secondary">첫 번째 글을 준비하고 있어요.</p>
      )}
    </section>
  );
}

export function HomeContent({
  posts,
  series,
}: {
  posts: readonly HomeContentItem[];
  series: readonly HomeSeriesItem[];
}) {
  return (
    <div className={styles.content}>
      <RecentPosts items={posts} />
      <HomeSeries items={series} />
    </div>
  );
}
