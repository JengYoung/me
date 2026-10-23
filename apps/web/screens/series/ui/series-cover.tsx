'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  return (
    <>
      {active && item.thumbnail && (
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
          onPointerDown={(event) => {
            swiped.current = false;
            gesture.current =
              event.pointerType === 'touch' && event.isPrimary ? { x: event.clientX, y: event.clientY } : null;
          }}
          onPointerCancel={() => {
            gesture.current = null;
          }}
          onPointerUp={(event) => {
            const start = gesture.current;
            gesture.current = null;
            if (!start) return;
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
            swiped.current = true;
            onSwipe(dx < 0 ? 'next' : 'previous');
          }}
          onClick={(event) => {
            if (swiped.current && event.detail !== 0) event.preventDefault();
            swiped.current = false;
          }}
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
