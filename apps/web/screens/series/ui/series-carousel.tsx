'use client';

import { useRef, useState } from 'react';
import { Carousel } from '@repo/ui';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { CharacterExpression } from '../../../shared/ui/character';
import type { SeriesOverviewItem } from '../model/get-series-overview';
import { SeriesCover } from './series-cover';
import { SeriesSlideDetails } from './series-slide-details';
import styles from './series-carousel.module.css';

const POSITIVE_EXPRESSIONS = ['happy', 'sparkly', 'love', 'wink'] as const;
const CONTROL_CLASS_NAME =
  'flex min-h-48px min-w-48px cursor-pointer items-center justify-center rounded-full bg-bg-surface text-ink hover:bg-action-primary-bg hover:text-action-primary-fg active:bg-action-primary-pressed active:text-action-primary-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

export function SeriesCarousel({ items }: { items: readonly SeriesOverviewItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [expression, setExpression] = useState<CharacterExpression>('happy');
  const [motion, setMotion] = useState<'next' | 'previous' | null>(null);
  const direction = useRef<'next' | 'previous'>('next');

  function selectSeries(nextId: string | null) {
    if (!nextId || nextId === activeId) return;
    setMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? null : direction.current);
    const candidates = POSITIVE_EXPRESSIONS.filter((candidate) => candidate !== expression);
    setExpression(candidates[Math.floor(Math.random() * candidates.length)]!);
    setActiveId(nextId);
  }

  if (items.length === 0) return <p className="text-body-2 text-ink-secondary">아직 시리즈가 없습니다.</p>;

  return (
    <Carousel.Root
      slides={items.map((item) => ({ value: item.id, label: item.title }))}
      value={activeId}
      onValueChange={selectSeries}
      defaultRotating={false}
      loop
      aria-label="시리즈 둘러보기"
      aria-roledescription="캐러셀"
      className={styles.carousel}
    >
      {(api) => (
        <>
          {items.length > 1 && (
            <>
              <Carousel.Previous
                aria-label="이전 시리즈"
                className={`${CONTROL_CLASS_NAME} ${styles.previous}`}
                onClickCapture={() => {
                  direction.current = 'previous';
                }}
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </Carousel.Previous>
              <Carousel.Next
                aria-label="다음 시리즈"
                className={`${CONTROL_CLASS_NAME} ${styles.next}`}
                onClickCapture={() => {
                  direction.current = 'next';
                }}
              >
                <ArrowRight size={20} aria-hidden="true" />
              </Carousel.Next>
              <div aria-hidden="true" className={`${styles.position} text-detail text-ink-muted`}>
                <div className={styles.progress}>
                  {items.map((item) => (
                    <span key={item.id} data-active={item.id === api.value} />
                  ))}
                </div>
                <span className="rounded-full bg-bg-surface px-8px py-4px">
                  {api.index + 1} / {items.length}
                </span>
              </div>
            </>
          )}
          <output aria-live="polite" aria-atomic="true" className="sr-only">
            {items.length}개 중 {api.index + 1}번째 시리즈, {items[api.index]?.title}
          </output>
          <div {...api.getViewportProps()} aria-live="off" className={styles.viewport}>
            {items.map((item) => (
              <Carousel.Slide
                key={item.id}
                value={item.id}
                aria-roledescription="슬라이드"
                className={styles.slide}
                data-direction={api.value === item.id ? motion : undefined}
              >
                {/* 비활성 시리즈도 서버 HTML에 본문과 링크를 남깁니다. hidden은 접근성 트리와 Tab 순서에서 제외합니다. */}
                <SeriesCover
                  item={item}
                  active={api.value === item.id}
                  expression={expression}
                  onSwipe={(value) => {
                    direction.current = value;
                    if (value === 'next') api.next();
                    else api.previous();
                  }}
                />
                <SeriesSlideDetails item={item} active={api.value === item.id} />
              </Carousel.Slide>
            ))}
          </div>
        </>
      )}
    </Carousel.Root>
  );
}
