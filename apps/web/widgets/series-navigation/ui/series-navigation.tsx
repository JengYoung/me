import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import type { Series as ContentSeries } from '../../../entities/series';
import { seriesTitle } from '../../../entities/series';
import { PostSeriesProgress } from './series-progress';

export function PostSeriesNavigation({ series, postId }: { series: ContentSeries; postId: string }) {
  const currentIndex = series.posts.findIndex((item) => item.id === postId);
  if (currentIndex < 0) return null;

  const posts = series.posts.map((post) => ({
    id: post.id,
    title: post.title,
  }));
  const total = posts.length;
  const current = currentIndex + 1;
  const percentage = Math.round((current / total) * 100);
  const previous = posts[currentIndex - 1];
  const next = posts[currentIndex + 1];

  return (
    <nav aria-label="현재 시리즈 탐색" className="max-w-3xl overflow-hidden rounded-16 bg-bg-surface">
      <div className="space-y-8px bg-bg-canvas p-16px">
        <div className="flex flex-wrap items-center justify-between gap-x-12px gap-y-4px text-body-3">
          <p className="inline-flex items-center gap-8px text-ink-muted">
            <FolderOpen size={16} aria-hidden="true" />
            시리즈 · 총 {total}편
          </p>
          <p className="text-action-primary-bg">
            <span className="font-semibold">
              현재 {current} / {total}번째 글
            </span>{' '}
            ({percentage}%)
          </p>
        </div>
        <Link
          href={`/series/${series.id}`}
          className="group block min-h-48px space-y-4px rounded-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <h2 className="break-words break-keep text-title-2 text-ink group-hover:underline">{seriesTitle(series)}</h2>
          {series.description && (
            <p className="break-words break-keep text-body-3 text-ink-secondary">{series.description}</p>
          )}
        </Link>
        <PostSeriesProgress current={current} total={total} />
      </div>
      <details open className="group p-8px">
        <summary className="flex min-h-48px cursor-pointer list-none items-center justify-between gap-12px rounded-8 px-8px py-8px hover:bg-bg-subtle active:bg-bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 items-center gap-8px text-title-4">
            <BookOpen size={20} className="shrink-0 text-action-primary-bg" aria-hidden="true" />
            시리즈 목차 <span className="text-body-3 text-ink-muted">({total}편)</span>
          </span>
          <span className="flex shrink-0 items-center gap-4px text-body-3 text-ink-muted">
            <span className="group-open:hidden">펼치기</span>
            <span className="hidden group-open:inline">접기</span>
            <ChevronDown
              size={20}
              aria-hidden="true"
              className="transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
            />
          </span>
        </summary>
        <ol aria-label="현재 시리즈 목차" className="space-y-4px pt-4px">
          {posts.map((item, index) => {
            const isCurrent = item.id === postId;
            return (
              <li key={item.id}>
                <Link
                  href={`/posts/${item.id}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`flex min-h-48px items-center gap-12px rounded-8 p-8px hover:bg-bg-subtle active:bg-bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${isCurrent ? 'bg-bg-subtle' : ''}`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex size-32px shrink-0 items-center justify-center rounded-full text-body-3 ${isCurrent ? 'bg-action-primary-bg font-semibold text-action-primary-fg' : 'bg-bg-canvas text-ink-muted'}`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="sr-only">{index + 1}번째 글 · </span>
                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-8px gap-y-4px">
                    <span
                      className={`min-w-0 break-words break-keep text-body-2 ${isCurrent ? 'font-semibold text-action-primary-bg' : 'text-ink'}`}
                    >
                      {item.title}
                    </span>
                    {isCurrent && (
                      <span className="shrink-0 rounded-4 bg-action-primary-bg px-8px py-4px text-detail text-action-primary-fg">
                        현재
                      </span>
                    )}
                  </span>
                  {!isCurrent && <ChevronRight size={16} className="shrink-0 text-ink-muted" aria-hidden="true" />}
                </Link>
              </li>
            );
          })}
        </ol>
      </details>
      {(previous || next) && (
        <div className="grid gap-8px bg-bg-canvas p-12px desktop:grid-cols-2">
          {previous && (
            <Link
              rel="prev"
              href={`/posts/${previous.id}`}
              className="flex min-h-64px items-center gap-12px rounded-8 bg-bg-surface p-12px hover:bg-bg-subtle active:bg-bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <ArrowLeft size={20} className="shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-detail text-ink-muted">이전 글</span>
                <span className="block break-words break-keep text-body-3 font-semibold">{previous.title}</span>
              </span>
            </Link>
          )}
          {next && (
            <Link
              rel="next"
              href={`/posts/${next.id}`}
              className="flex min-h-64px items-center justify-between gap-12px rounded-8 bg-action-primary-bg p-12px text-action-primary-fg hover:bg-action-primary-hover active:bg-action-primary-pressed focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring desktop:col-start-2"
            >
              <span className="min-w-0">
                <span className="block text-detail">다음 글</span>
                <span className="block break-words break-keep text-body-3 font-semibold">{next.title}</span>
              </span>
              <ArrowRight size={20} className="shrink-0" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
