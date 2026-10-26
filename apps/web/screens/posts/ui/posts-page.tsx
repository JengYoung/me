import { formatPublishedAt, postPath } from '../../../entities/post';
import { ArticleList } from '../../../shared/article';
import { posts } from '@post-content/catalog.generated';

/** 상세 화면의 목록 복귀·진입점. 검색과 목록 디자인은 별도 화면 범위다. */
export function PostsPage() {
  return (
    <ArticleList
      title="포스트"
      emptyMessage="아직 공개된 글이 없습니다."
      items={posts.map((post) => ({
        id: post.id,
        href: postPath(post.id),
        title: post.title,
        summary: post.summary,
        isDraft: post.isDraft,
        ...(!post.isDraft ? { dateTime: post.createdAt, dateLabel: formatPublishedAt(post.createdAt) } : {}),
      }))}
    />
  );
}
