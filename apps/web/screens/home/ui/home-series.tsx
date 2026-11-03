'use client';

import { useId } from 'react';
import dynamic from 'next/dynamic';
import type { HomeSeriesItem } from '../model/get-home-content';
import { HomeSeriesHeading } from './home-series-heading';
import styles from './home-content.module.css';

const HomeSeriesCarousel = dynamic(() => import('./home-series-carousel').then((module) => module.HomeSeriesCarousel));

export function HomeSeries({ items }: { items: readonly HomeSeriesItem[] }) {
  const id = useId();

  if (items.length > 0) return <HomeSeriesCarousel items={items} />;

  return (
    <section aria-labelledby={`${id}-heading`} className={styles.section}>
      <HomeSeriesHeading id={`${id}-heading`} />
      <p className="py-64px text-body-2 text-ink-secondary">새로운 시리즈를 준비하고 있어요.</p>
    </section>
  );
}
