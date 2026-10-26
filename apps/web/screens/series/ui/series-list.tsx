import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SeriesDate } from './series-date';
import type { SeriesOverviewItem } from '../model/get-series-overview';
import styles from './series-carousel.module.css';

export function SeriesList({ items }: { items: readonly SeriesOverviewItem[] }) {
  if (items.length === 0) return <p className="text-body-2 text-ink-secondary">아직 시리즈가 없습니다.</p>;
  return (
    <ol aria-label="모든 시리즈" className="space-y-8px">
      {items.map((item, index) => (
        <li key={item.id}>
          <Link
            href={`/series/${item.id}`}
            className={`${styles.listRow} group rounded-12 hover:bg-bg-surface active:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
          >
            <span aria-hidden="true" className={`${styles.listNumber} text-body-3 text-ink-muted`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <h2
              className={`${styles.listTitle} break-words break-keep text-title-2 text-ink group-hover:text-action-primary-bg`}
            >
              {item.title}
            </h2>
            <p className={`${styles.listDescription} break-words break-keep text-body-2 text-ink-secondary`}>
              {item.description}
            </p>
            <div className={`${styles.listDate} space-y-4px text-detail text-ink-muted`}>
              <SeriesDate dateTime={item.updatedAt} className="block text-body-3" />
              <span>최근 업데이트 · {item.postCount}편</span>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" className={styles.listArrow} />
          </Link>
        </li>
      ))}
    </ol>
  );
}
