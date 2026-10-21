import type { ReactNode } from 'react';
import type { Post } from '../../../entities/post';

export function PostArticle({ post, children }: { post: Post; children: ReactNode }) {
  return (
    <article data-post-version={post.version} className="min-w-0 space-y-40px">
      <header className="space-y-16px border-b border-border pb-32px">
        {post.isDraft && <p className="text-body-3 text-ink-muted">로컬 초안 미리보기 · v{post.version}</p>}
        {post.series && (
          <p className="text-body-3 text-ink-muted">
            {post.series.id} · {post.series.order}번째 글
          </p>
        )}
        <h1 className="break-words break-keep text-heading-4 desktop:text-heading-2">{post.title}</h1>
        {post.summary && <p className="text-body-2 text-ink-secondary desktop:text-body-1">{post.summary}</p>}
        {post.tags.length > 0 && (
          <ul aria-label="태그" className="flex flex-wrap gap-8px text-body-3 text-ink-secondary">
            {post.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-bg-subtle px-12px py-4px">
                {tag}
              </li>
            ))}
          </ul>
        )}
        {post.reason && (
          <p className="text-body-3 text-ink-secondary">
            <span className="font-medium">수정 이유 · </span>
            {post.reason}
          </p>
        )}
      </header>
      {children}
    </article>
  );
}
