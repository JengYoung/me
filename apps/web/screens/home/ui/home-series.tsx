'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { Carousel, type CarouselApi } from '@repo/ui';
import { ChevronDown, ChevronUp, Pause, Play } from 'lucide-react';
import {
  CarouselPlaybackProgress,
  carouselMotionStyles,
  useCarouselMotion,
  useCarouselSwipe,
} from '../../../shared/ui/carousel';
import type { HomeSeriesItem } from '../model/get-home-content';
import { SeriesFeature } from './series-feature';
import { HomeSectionLabel } from './home-section-label';
import homeStyles from './home-content.module.css';
import styles from './home-series.module.css';

const HEADING = '이런 것들에 관심 가지며 개발하고 있어요';
const AUTOPLAY_INTERVAL = 5000;
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

export function HomeSeries({ items }: { items: readonly HomeSeriesItem[] }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const transition = useCarouselMotion({ value: selected?.id ?? null, onValueChange: setSelectedId });
  const id = useId();

  return (
    <section aria-labelledby={`${id}-heading`} className={homeStyles.section}>
      {selected ? (
        <>
          <Carousel.Root
            slides={items.map((item) => ({ value: item.id, label: item.title }))}
            value={selected.id}
            onValueChange={(value) => {
              const from = items.findIndex((item) => item.id === selected.id);
              const to = items.findIndex((item) => item.id === value);
              transition.select(value, Math.abs(to - from) === 1);
              transition.setDirection('next');
            }}
            defaultRotating
            interval={AUTOPLAY_INTERVAL}
            loop
            aria-label="홈 시리즈 캐러셀"
            aria-roledescription="캐러셀"
            className={`${styles.enhanced} ${carouselMotionStyles.root}`}
            data-direction={transition.motion ?? undefined}
          >
            {(api) => <HomeSeriesSlides items={items} api={api} transition={transition} id={id} />}
          </Carousel.Root>
          <noscript>
            <style>{`.${styles.enhanced} { display: none; }`}</style>
            <SeriesHeading id={`${id}-fallback-heading`} />
            <div className="my-32px grid gap-32px">
              {items.map((item) => (
                <section key={item.id} aria-label={item.title} className="space-y-12px">
                  <h3 className="text-title-1">
                    <Link href={item.href}>{item.title} 시리즈 보기</Link>
                  </h3>
                  {item.summary && <p className="text-body-2 text-ink-secondary">{item.summary}</p>}
                  <p className="text-body-3 text-ink-muted">{item.postCount}개의 글</p>
                </section>
              ))}
            </div>
          </noscript>
        </>
      ) : (
        <>
          <SeriesHeading id={`${id}-heading`} />
          <p className="py-64px text-body-2 text-ink-secondary">새로운 시리즈를 준비하고 있어요.</p>
        </>
      )}
    </section>
  );
}

function HomeSeriesSlides({
  items,
  api,
  transition,
  id,
}: {
  items: readonly HomeSeriesItem[];
  api: CarouselApi;
  transition: ReturnType<typeof useCarouselMotion>;
  id: string;
}) {
  const { viewport, slideEvents } = transition;
  const swipe = useCarouselSwipe((direction) => {
    api.stop();
    transition.move(direction, api);
  });
  return (
    <div className={styles.layout}>
      <div className={styles.editorial}>
        <header className={styles.intro}>
          <div className={styles.heading}>
            <SeriesHeading id={`${id}-heading`} />
            {items.some((item) => item.isDraft) && (
              <p className="mt-12px text-body-3 text-ink-muted">로컬 초안 미리보기</p>
            )}
          </div>
        </header>
        <div className={styles.navigation}>
          <fieldset aria-label="시리즈 선택" className={styles.selector}>
            {items.length > 1 && (
              <Carousel.Previous
                aria-label="이전 시리즈"
                className={`${styles.control} ${FOCUS}`}
                onClickCapture={() => {
                  api.stop();
                  transition.setDirection('previous');
                }}
              >
                <ChevronUp size={16} aria-hidden="true" />
              </Carousel.Previous>
            )}
            <div className={styles.rollingViewport} data-series-titles>
              <div
                className={styles.rollingTrack}
                style={{ transform: `translateY(calc(var(--spacing-64px) * ${0.25 - api.index}))` }}
              >
                {items.map((item, index) => (
                  <Carousel.Picker
                    key={item.id}
                    value={item.id}
                    aria-label={`${item.title} 선택`}
                    aria-pressed={api.value === item.id}
                    data-position={index < api.index ? 'previous' : index > api.index ? 'next' : 'active'}
                    aria-hidden={Math.abs(index - api.index) > 1 || undefined}
                    inert={Math.abs(index - api.index) > 1 || undefined}
                    tabIndex={index === api.index ? 0 : -1}
                    onClickCapture={() => transition.setDirection(index > api.index ? 'next' : 'previous')}
                    className={`${styles.option} text-title-3 ${FOCUS}`}
                  >
                    <span className="text-detail text-ink-muted" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="line-clamp-2 min-w-0 break-words">{item.title}</span>
                    {api.value === item.id && (
                      <span className="shrink-0 whitespace-nowrap text-detail text-ink-muted">
                        {item.postCount}개의 글
                      </span>
                    )}
                  </Carousel.Picker>
                ))}
              </div>
            </div>
            {items.length > 1 && (
              <Carousel.Next
                aria-label="다음 시리즈"
                className={`${styles.control} ${FOCUS}`}
                onClickCapture={() => {
                  api.stop();
                  transition.setDirection('next');
                }}
              >
                <ChevronDown size={16} aria-hidden="true" />
              </Carousel.Next>
            )}
          </fieldset>
          {items.length > 1 && (
            <div className={styles.playback}>
              <div className={styles.progress} aria-hidden="true">
                <CarouselPlaybackProgress
                  value={api.value}
                  running={api.rotating}
                  duration={AUTOPLAY_INTERVAL}
                  disabled={api.getRotationProps().disabled}
                  className={styles.progressIndicator}
                />
              </div>
              <fieldset aria-label="시리즈 번호 선택" className={styles.pageButtons}>
                {items.map((item, index) => (
                  <Carousel.Picker
                    key={item.id}
                    value={item.id}
                    aria-label={`${index + 1}번 시리즈: ${item.title}`}
                    aria-pressed={api.value === item.id}
                    onClickCapture={() => transition.setDirection(index > api.index ? 'next' : 'previous')}
                    className={`${styles.pageButton} text-detail tabular-nums ${FOCUS}`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Carousel.Picker>
                ))}
              </fieldset>
              <Carousel.Rotation
                aria-label={api.rotationEnabled ? '자동 재생 일시정지' : '자동 재생 시작'}
                className={`${styles.control} ${FOCUS}`}
                onClickCapture={() => transition.setDirection('next')}
              >
                {api.rotationEnabled ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              </Carousel.Rotation>
            </div>
          )}
        </div>
      </div>
      <output aria-live={api.rotating ? 'off' : 'polite'} aria-atomic="true" className="sr-only">
        {items.length}개 중 {api.index + 1}번째 시리즈, {items[api.index]?.title}
      </output>
      <div
        {...api.getViewportProps()}
        ref={viewport}
        aria-live="off"
        className={`${styles.panels} ${carouselMotionStyles.viewport}`}
        {...swipe}
      >
        {items.map((item) => (
          <Carousel.Slide
            key={item.id}
            value={item.id}
            aria-roledescription="슬라이드"
            aria-hidden={api.value !== item.id || undefined}
            inert={api.value !== item.id || undefined}
            className={`${styles.panel} ${carouselMotionStyles.slide}`}
            {...slideEvents(api.value === item.id, api)}
          >
            <SeriesFeature item={item} />
          </Carousel.Slide>
        ))}
      </div>
    </div>
  );
}

function SeriesHeading({ id }: { id: string }) {
  return (
    <div className="space-y-12px">
      <HomeSectionLabel label="Series" href="/series?showType=carousel" linkLabel="시리즈 목록 보러가기" />
      <h2 id={id} aria-label={HEADING} className="text-heading-6 desktop:text-heading-4">
        이런 것들에 관심 가지며
        <br />
        개발하고 있어요
      </h2>
    </div>
  );
}
