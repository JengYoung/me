import type { ReactNode } from 'react';
import type { Post } from '../../../entities/post';
import { ArticleHeader } from '../../../shared/article';

export function PostArticle({ post, children }: { post: Post; children: ReactNode }) {
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
                {post.series.id} · {post.series.order}번째 글
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
