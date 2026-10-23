import Link from 'next/link';
import { GalleryHorizontalEnd, List } from 'lucide-react';
import { series } from '../../../entities/series';
import { getSeriesOverview } from '../model/get-series-overview';
import { SeriesCarousel } from './series-carousel';
import { SeriesList } from './series-list';
import styles from './series-carousel.module.css';

export function SeriesPage({ showType = 'list' }: { showType?: 'list' | 'carousel' }) {
  const items = getSeriesOverview(series);
  return (
    <main id="main-content" tabIndex={-1} className={styles.page} data-view={showType}>
      <header className={styles.pageHeader}>
        <div className="flex flex-wrap items-center justify-between gap-12px">
          <h1 className="text-heading-5 desktop:text-heading-4">시리즈</h1>
          <nav aria-label="시리즈 보기 방식" className="flex gap-4px rounded-full bg-bg-surface p-4px">
            {(
              [
                { value: 'list', label: '리스트', href: '/series', Icon: List },
                { value: 'carousel', label: '캐러셀', href: '/series?showType=carousel', Icon: GalleryHorizontalEnd },
              ] as const
            ).map(({ value, label, href, Icon }) => (
              <Link
                key={value}
                href={href}
                scroll={false}
                aria-label={`${label}로 보기`}
                aria-current={showType === value ? 'page' : undefined}
                className="inline-flex min-h-48px items-center justify-center gap-8px rounded-full px-12px text-body-3 text-ink-secondary hover:bg-bg-subtle aria-[current=page]:bg-action-primary-bg aria-[current=page]:text-action-primary-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <Icon className="size-16px" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        {showType === 'list' && (
          <p className="mt-16px text-body-2 text-ink-secondary">하나의 주제를 여러 글에 걸쳐 차근차근 살펴봅니다.</p>
        )}
        {series.some((item) => item.hasDrafts) && (
          <p className="mt-8px text-body-3 text-ink-muted">로컬 초안 미리보기</p>
        )}
      </header>
      {showType === 'list' ? (
        <SeriesList items={items} />
      ) : (
        <>
          <SeriesCarousel items={items} />
          <noscript>
            <SeriesList items={items} />
          </noscript>
        </>
      )}
    </main>
  );
}
