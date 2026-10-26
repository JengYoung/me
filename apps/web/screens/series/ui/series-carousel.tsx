'use client';

import { useState } from 'react';
import { Carousel } from '@repo/ui';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { CharacterExpression } from '../../../shared/ui/character';
import { carouselMotionStyles, useCarouselMotion } from '../../../shared/ui/carousel';
import type { SeriesOverviewItem } from '../model/get-series-overview';
import { SeriesCover } from './series-cover';
import { SeriesSlideDetails } from './series-slide-details';
import styles from './series-carousel.module.css';

const POSITIVE_EXPRESSIONS = ['happy', 'sparkly', 'love', 'wink'] as const;
const CONTROL_CLASS_NAME =
  'flex min-h-48px min-w-48px cursor-pointer items-center justify-center rounded-full bg-bg-surface text-ink hover:bg-action-primary-bg hover:text-action-primary-fg active:bg-action-primary-pressed active:text-action-primary-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

export function SeriesCarousel({ items }: { items: readonly SeriesOverviewItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [expressions, setExpressions] = useState<Record<string, CharacterExpression>>(() =>
    items[0] ? { [items[0].id]: 'happy' } : {},
  );
  const transition = useCarouselMotion({
    value: activeId,
    onValueChange(nextId) {
      if (!expressions[nextId]) {
        const candidates = POSITIVE_EXPRESSIONS.filter((candidate) => candidate !== expressions[activeId ?? '']);
        const expression = candidates[Math.floor(Math.random() * candidates.length)]!;
        setExpressions((current) => ({ ...current, [nextId]: expression }));
      }
      setActiveId(nextId);
    },
  });

  if (items.length === 0) return <p className="text-body-2 text-ink-secondary">아직 시리즈가 없습니다.</p>;

  return (
    <Carousel.Root
      slides={items.map((item) => ({ value: item.id, label: item.title }))}
      value={activeId}
      onValueChange={transition.select}
      defaultRotating={false}
      loop
      aria-label="시리즈 둘러보기"
      aria-roledescription="캐러셀"
      className={`${styles.carousel} ${carouselMotionStyles.root}`}
      data-direction={transition.motion ?? undefined}
    >
      {(api) => (
        <>
          {items.length > 1 && (
            <>
              <Carousel.Previous
                aria-label="이전 시리즈"
                className={`${CONTROL_CLASS_NAME} ${styles.previous}`}
                onClickCapture={() => {
                  transition.setDirection('previous');
                }}
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </Carousel.Previous>
              <Carousel.Next
                aria-label="다음 시리즈"
                className={`${CONTROL_CLASS_NAME} ${styles.next}`}
                onClickCapture={() => {
                  transition.setDirection('next');
                }}
              >
                <ArrowRight size={20} aria-hidden="true" />
              </Carousel.Next>
              <div aria-hidden="true" className={`${styles.position} text-detail text-ink-muted`}>
                <div className={styles.progress}>
                  {items.map((item) => (
                    <span key={item.id} className={styles.progressTrack} />
                  ))}
                  <span
                    className={styles.progressIndicator}
                    data-part="position-indicator"
                    style={{
                      width: `calc((100% - var(--spacing-4px) * ${items.length - 1}) / ${items.length})`,
                      transform: `translateX(calc((100% + var(--spacing-4px)) * ${api.index}))`,
                    }}
                  />
                </div>
                <span className="rounded-full bg-bg-surface px-8px py-4px tabular-nums">
                  {api.index + 1} / {items.length}
                </span>
              </div>
            </>
          )}
          <output aria-live="polite" aria-atomic="true" className="sr-only">
            {items.length}개 중 {api.index + 1}번째 시리즈, {items[api.index]?.title}
          </output>
          <div
            {...api.getViewportProps()}
            ref={transition.viewport}
            aria-live="off"
            className={`${styles.viewport} ${carouselMotionStyles.viewport}`}
          >
            {items.map((item) => (
              <Carousel.Slide
                key={item.id}
                value={item.id}
                aria-roledescription="슬라이드"
                className={`${styles.slide} ${carouselMotionStyles.slide}`}
                aria-hidden={api.value !== item.id || undefined}
                inert={api.value !== item.id || undefined}
                {...transition.slideEvents(api.value === item.id, api)}
              >
                {/* 퇴장 중에도 시각적 전환만 유지하고, 비활성 시리즈의 읽기·포커스·클릭은 즉시 차단합니다. */}
                <SeriesCover
                  item={item}
                  active={api.value === item.id}
                  expression={expressions[item.id] ?? 'happy'}
                  onSwipe={(value) => transition.move(value, api)}
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
