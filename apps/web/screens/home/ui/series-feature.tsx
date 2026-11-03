import Image from 'next/image';
import Link from 'next/link';
import type { HomeSeriesItem } from '../model/get-home-content';
import styles from './home-series.module.css';

export function SeriesFeature({ item }: { item: HomeSeriesItem }) {
  return (
    <div className={styles.feature}>
      <Link
        href={item.href}
        aria-label={`${item.title} 시리즈 보기`}
        data-series-cover
        data-fallback={!item.thumbnail}
        className={`${styles.cover} rounded-16 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
      >
        <Image
          src={item.thumbnail ?? '/characters/character/10-curious.svg'}
          alt=""
          fill
          sizes="(min-width: 1200px) 560px, (min-width: 640px) 576px, calc(100vw - 48px)"
          className={item.thumbnail ? 'object-cover' : 'object-contain p-32px desktop:p-48px'}
          draggable={false}
        />
      </Link>
      <div className="space-y-16px desktop:space-y-24px">
        <h3 className="break-words text-heading-4 desktop:text-heading-2">
          <Link
            href={item.href}
            className="rounded-4 hover:text-action-primary-bg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {item.title}
          </Link>
        </h3>
        <p className="break-words text-body-1 text-ink-secondary">{item.summary || '시리즈 소개를 준비하고 있어요.'}</p>
        <p className="text-body-3 text-ink-muted">{item.postCount}개의 글</p>
      </div>
    </div>
  );
}
