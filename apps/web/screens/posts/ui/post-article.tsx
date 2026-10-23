import type { ReactNode } from 'react';
import type { Post } from '../../../entities/post';
import { ArticleHeader } from '../../../shared/article';
import Link from 'next/link';
import { series, seriesPath, seriesTitle } from '../../../entities/series';

export function PostArticle({ post, children }: { post: Post; children: ReactNode }) {
  const currentSeries = series.find((item) => item.id === post.series?.id);
  const position = currentSeries?.posts.findIndex((item) => item.id === post.id) ?? -1;
  return (
    <article data-post-version={post.version} className="min-w-0 space-y-40px">
      <ArticleHeader
        title={post.title}
        summary={post.summary}
        tags={post.tags}
        before={
          <>
            {post.isDraft && <p className="text-body-3 text-ink-muted">로컬 초안 미리보기 · v{post.version}</p>}
            {post.series && (
              <p className="text-body-3 text-ink-muted">
                {currentSeries ? (
                  <Link
                    href={seriesPath(currentSeries.id)}
                    className="rounded-4 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {seriesTitle(currentSeries)}
                  </Link>
                ) : (
                  post.series.id
                )}
                {position >= 0 && ` · ${position + 1}번째 글`}
              </p>
            )}
          </>
        }
        after={
          post.reason && (
            <p className="text-body-3 text-ink-secondary">
              <span className="font-medium">수정 이유 · </span>
              {post.reason}
            </p>
          )
        }
      />
      {children}
    </article>
  );
}
