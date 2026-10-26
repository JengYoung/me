import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { series, seriesPath, seriesTitle } from '../../../entities/series';
import { postPath } from '../../../entities/post';
import { pageMetadata } from '../../../shared/lib/seo';
import { Character } from '../../../shared/ui/character';
import { SeriesDate } from './series-date';

function getSeries(id: string) {
  const item = series.find((candidate) => candidate.id === id);
  if (!item) notFound();
  return item;
}
export function getSeriesStaticParams() {
  return series.map(({ id }) => ({ seriesId: id }));
}
export function getSeriesMetadata(id: string) {
  const item = getSeries(id);
  return {
    ...pageMetadata({ title: seriesTitle(item), description: item.description, pathname: seriesPath(id) }),
    ...(item.hasDrafts ? { robots: { index: false, follow: false } } : {}),
  };
}

export function SeriesDetailPage({ seriesId }: { seriesId: string }) {
  const item = getSeries(seriesId);
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl space-y-32px px-24px py-40px desktop:py-64px">
      <Link
        href="/series"
        className="inline-flex min-h-48px items-center rounded-4 text-title-4 text-ink-secondary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
      >
        시리즈 목록 보러가기
      </Link>
      <header className="grid gap-24px desktop:grid-cols-2 desktop:items-center">
        <div className="space-y-16px">
          <p className="text-body-3 text-action-primary-bg">시리즈 · 총 {item.postCount}편</p>
          {item.hasDrafts && <p className="text-body-3 text-ink-muted">로컬 초안 미리보기</p>}
          <h1 className="break-words break-keep text-heading-4 desktop:text-heading-2">{seriesTitle(item)}</h1>
          {item.description && <p className="text-body-2 text-ink-secondary desktop:text-body-1">{item.description}</p>}
          <Link
            href={postPath(item.posts[0]!.id)}
            className="inline-flex min-h-48px items-center rounded-8 bg-action-primary-bg px-20px py-12px text-title-4 text-action-primary-fg hover:bg-action-primary-hover active:bg-action-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            첫 글부터 읽기
          </Link>
        </div>
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-16 bg-bg-subtle">
          {item.thumbnail ? (
            <Image src={item.thumbnail} alt="" fill sizes="(min-width: 1200px) 50vw, 100vw" className="object-cover" />
          ) : (
            <Character decorative expression="happy" className="h-full w-full p-32px" />
          )}
        </div>
      </header>
      <section aria-labelledby="series-posts-heading" className="space-y-24px">
        <h2 id="series-posts-heading" className="text-title-2">
          시리즈 글
        </h2>
        <ol aria-label="시리즈 글 목록" className="divide-y divide-border">
          {item.posts.map((post, index) => (
            <li key={post.id}>
              <Link
                href={postPath(post.id)}
                className="group flex items-start gap-16px rounded-12 p-16px hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-ring desktop:gap-32px"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-8 bg-bg-subtle desktop:size-40">
                  <Image
                    src="/characters/character/10-curious.svg"
                    alt=""
                    fill
                    sizes="(min-width: 1200px) 160px, 80px"
                    className="object-contain p-12px transition-transform duration-300 ease-out motion-safe:group-hover:scale-105 motion-safe:group-focus-visible:scale-105 motion-reduce:transition-none desktop:p-20px"
                  />
                </div>
                <div className="grid min-w-0 flex-1 gap-8px">
                  <span className="text-body-3 text-action-primary-bg">{index + 1}번째 글</span>
                  <h3 className="break-words text-title-3 group-hover:text-action-primary-bg desktop:text-title-2">
                    {post.title}
                  </h3>
                  <p className="break-words text-body-2 text-ink-secondary">{post.summary}</p>
                  <SeriesDate dateTime={post.createdAt} className="text-body-3 text-ink-muted" />
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
