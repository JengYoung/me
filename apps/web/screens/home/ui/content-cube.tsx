'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import type { HomeContentItem } from '../model/get-home-content';
import { useCubeArrival } from '../lib/use-cube-arrival';
import styles from './home-content.module.css';

function ContentDate({ item }: { item: HomeContentItem }) {
  if (!item.dateTime) return <span>{item.isDraft ? '작성 중' : '날짜 미지정'}</span>;
  return (
    <time dateTime={item.dateTime}>
      {new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeZone: 'Asia/Seoul' }).format(
        new Date(item.dateTime),
      )}
    </time>
  );
}

export function ContentCube({ item }: { item: HomeContentItem }) {
  const [expanded, setExpanded] = useState(false);
  const rootRef = useCubeArrival();
  const id = useId();
  const titleId = `${id}-title`;

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- 자식 링크에서 올라오는 Escape를 처리하며 article 자체는 조작 대상이 아닙니다.
    <article
      ref={rootRef}
      aria-labelledby={titleId}
      data-content-cube={item.kind}
      data-expanded={expanded}
      className={styles.item}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' && !event.currentTarget.contains(document.activeElement)) {
          setExpanded(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse' && !event.currentTarget.contains(document.activeElement)) {
          setExpanded(false);
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !expanded) return;
        event.preventDefault();
        setExpanded(false);
      }}
    >
      <h3 id={titleId} className="sr-only">
        {item.title}
      </h3>
      <Link
        href={item.href}
        aria-label={item.title}
        className={`${styles.arrival} block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
        data-cube-arrival
        onFocus={() => setExpanded(true)}
      >
        <div className={styles.scene}>
          <div className={styles.floating}>
            <div className={styles.cube}>
              <div className={`${styles.face} ${styles.front}`} aria-hidden={expanded}>
                <div className={styles.cover}>
                  <span className={`${styles.thumbnail} block w-full bg-bg-subtle`}>
                    <Image
                      src={item.thumbnail?.src ?? '/characters/character/10-curious.svg'}
                      alt=""
                      fill
                      sizes="(min-width: 1200px) 352px, (max-width: 400px) 85vw, 352px"
                      className={item.thumbnail ? 'object-cover' : 'object-contain p-24px'}
                    />
                  </span>
                  <span className="flex flex-col gap-8px p-20px">
                    <span className="text-detail text-action-primary-fg">
                      {item.kind === 'post' ? 'Post' : `Series · ${item.postCount}개의 글`}
                    </span>
                    <span className="break-words break-keep text-title-2">{item.title}</span>
                    <span className="text-right text-detail text-action-primary-fg">
                      {item.kind === 'series' && '최근 수정 '}
                      <ContentDate item={item} />
                    </span>
                  </span>
                </div>
              </div>
              <div className={`${styles.face} ${styles.right}`} aria-hidden={!expanded}>
                <div className={styles.details}>
                  <section
                    aria-label={`${item.title} 요약`}
                    className={`${styles.detailsScroll} flex flex-col gap-12px p-20px`}
                  >
                    <p className="break-words text-body-4 text-action-primary-fg">
                      {item.seriesTitle ?? (item.kind === 'series' ? `Series · ${item.postCount}개의 글` : 'Post')}
                    </p>
                    <p className="break-words break-keep text-title-2">{item.title}</p>
                    {item.tags.length > 0 && (
                      <ul aria-label="태그" className="flex flex-wrap gap-4px">
                        {item.tags.map((tag) => (
                          <li
                            key={tag}
                            className="max-w-full rounded-4 bg-action-primary-pressed px-8px py-4px break-words text-detail text-action-primary-fg"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="break-words break-keep text-body-2 text-action-primary-fg">{item.summary}</p>
                  </section>
                  <p className="shrink-0 px-20px py-12px text-right text-detail text-action-primary-fg">
                    {item.kind === 'series' && '최근 수정 '}
                    <ContentDate item={item} />
                  </p>
                </div>
              </div>
              <div aria-hidden="true" className={`${styles.face} ${styles.left}`} />
              <div aria-hidden="true" className={`${styles.face} ${styles.back}`} />
              <div aria-hidden="true" className={`${styles.face} ${styles.top}`} />
              <div aria-hidden="true" className={`${styles.face} ${styles.bottom}`} />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
