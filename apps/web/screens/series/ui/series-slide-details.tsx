'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Character } from '../../../shared/ui/character';
import { SeriesDate } from './series-date';

import type { SeriesOverviewItem } from '../model/get-series-overview';
import styles from './series-carousel.module.css';

export function SeriesSlideDetails({ item, active }: { item: SeriesOverviewItem; active: boolean }) {
  const contentId = useId();
  const heading = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const collapsed = overflows && !expanded;

  useEffect(() => {
    if (!active || !heading.current || !body.current) return;
    const media = window.matchMedia('(min-width: 1200px)');
    const measure = () => {
      // 본문은 접어도 자연 높이를 유지하므로 폭/글자 크기가 바뀔 때 다시 측정할 수 있습니다.
      const titleHeight = heading.current?.querySelector('a')?.scrollHeight ?? 0;
      const contentHeight = titleHeight + (body.current?.scrollHeight ?? 0);
      const shouldCollapse = !media.matches && contentHeight > window.innerHeight * 0.35;
      if (shouldCollapse && body.current?.contains(document.activeElement)) setExpanded(true);
      setOverflows(shouldCollapse);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(heading.current);
    observer.observe(body.current);
    media.addEventListener('change', measure);
    window.addEventListener('resize', measure);
    measure();
    return () => {
      observer.disconnect();
      media.removeEventListener('change', measure);
      window.removeEventListener('resize', measure);
    };
  }, [active]);

  return (
    <div className={styles.details} data-collapsed={collapsed}>
      <div ref={heading} className={styles.detailsHeading}>
        <Character expression="sparkly" decorative className={styles.sparklyCharacter} />
        <h2 className="break-words break-keep text-heading-5 desktop:text-heading-4">
          <Link
            href={`/series/${item.id}`}
            className={`${collapsed ? 'line-clamp-2' : 'block'} min-h-48px rounded-4 hover:text-action-primary-bg hover:underline active:text-action-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
          >
            {item.title}
          </Link>
        </h2>
      </div>
      {collapsed && (
        <p className="mt-8px line-clamp-2 break-words text-body-2 text-ink-secondary">{item.description}</p>
      )}
      <div
        id={contentId}
        className={styles.detailsBody}
        data-collapsed={collapsed}
        aria-hidden={collapsed || undefined}
        inert={collapsed || undefined}
      >
        <div ref={body} className="space-y-16px">
          <p className="break-words break-keep text-body-2 text-ink-secondary">{item.description}</p>
          <section className="space-y-8px">
            <h3 className="text-title-4">최근 글</h3>
            <ul aria-label={`${item.title}의 최근 글`} className="grid grid-cols-3 gap-8px desktop:gap-16px">
              {item.latestPosts.map((post) => (
                <li key={post.id} className="min-w-0">
                  <Link
                    href={`/posts/${post.id}`}
                    className="group flex h-full min-h-48px min-w-48px flex-col gap-8px rounded-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    <div
                      className={`${styles.postThumbnail} flex items-center justify-center rounded-8 bg-bg-subtle p-8px`}
                    >
                      <Character decorative className="size-64px" />
                    </div>
                    <h4 className="line-clamp-2 break-words text-body-3 text-ink group-hover:text-action-primary-bg group-hover:underline group-active:text-action-primary-pressed">
                      {post.title}
                    </h4>
                    <SeriesDate dateTime={post.publishedAt} className="mt-auto block text-detail text-ink-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      {overflows && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((value) => !value)}
          className="mt-8px inline-flex min-h-48px cursor-pointer items-center justify-center gap-8px self-start rounded-full bg-bg-subtle px-16px text-body-3 text-ink hover:bg-action-primary-bg hover:text-action-primary-fg active:bg-action-primary-pressed active:text-action-primary-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {expanded ? '접기' : '내용 펼치기'}
          {expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
