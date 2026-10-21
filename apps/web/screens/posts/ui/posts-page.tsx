import Link from 'next/link';
import { formatPublishedAt, postPath } from '../../../entities/post';
import { posts } from '@post-content/catalog.generated';

/** 상세 화면의 목록 복귀·진입점. 검색과 목록 디자인은 별도 화면 범위다. */
export function PostsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-32px px-24px py-40px desktop:px-0 desktop:py-64px">
      <h1 className="text-heading-4 desktop:text-heading-2">포스트</h1>
      {posts.length === 0 ? (
        <p className="text-body-2 text-ink-secondary">아직 공개된 글이 없습니다.</p>
      ) : (
        <ul className="space-y-24px">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={postPath(post.id)}
                className="block space-y-12px rounded-12 border border-border p-24px hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
              >
                <h2 className="text-title-1">{post.title}</h2>
                <p className="text-body-2 text-ink-secondary">{post.summary}</p>
                {post.isDraft ? (
                  <span className="text-body-3 text-ink-muted">로컬 초안 미리보기</span>
                ) : (
                  <time dateTime={post.createdAt} className="text-body-3 text-ink-muted">
                    {formatPublishedAt(post.createdAt)}
                  </time>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
