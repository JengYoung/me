'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCarouselSwipe } from '../../../shared/ui/carousel';
import { Character } from '../../../shared/ui/character';
import type { CharacterExpression } from '../../../shared/ui/character';
import type { SeriesOverviewItem } from '../model/get-series-overview';
import styles from './series-carousel.module.css';

export function SeriesCover({
  item,
  active,
  expression,
  onSwipe,
}: {
  item: SeriesOverviewItem;
  active: boolean;
  expression: CharacterExpression;
  onSwipe: (direction: 'next' | 'previous') => void;
}) {
  const swipe = useCarouselSwipe(onSwipe);

  return (
    <>
      {item.thumbnail && (
        <div className={styles.backdrop} aria-hidden="true">
          {/* 작은 소스 한 장을 확대합니다. 스크롤/포인터마다 다시 그리는 backdrop-filter는 사용하지 않습니다. */}
          <Image src={item.thumbnail} alt="" fill sizes="48px" className="object-cover" />
        </div>
      )}
      <div className={styles.cover}>
        <Link
          href={`/series/${item.id}`}
          aria-label={`${item.title} 시리즈 썸네일`}
          className={`${styles.coverLink} bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
          {...swipe}
        >
          {item.thumbnail ? (
            <>
              <Image
                src={item.thumbnail}
                alt=""
                fill
                sizes="(min-width: 1200px) 50vw, 100vw"
                loading={active ? 'eager' : 'lazy'}
                className="object-cover object-left"
                draggable={false}
              />
              <Character expression={expression} decorative className={styles.coverCompanion} />
            </>
          ) : (
            <Character expression={expression} decorative className="size-full p-32px" />
          )}
        </Link>
      </div>
    </>
  );
}
