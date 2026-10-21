import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { postPath } from '../../../entities/post';
import { absoluteUrl, pageMetadata } from '../../../shared/seo';
import { posts } from '@post-content/catalog.generated';
import { currentPosts } from '@post-content/current.generated';
import { PostArticle } from './post-article';
import { PostVersionViewer } from './post-version-viewer';

export function getPostStaticParams() {
  return [...currentPosts.keys()].map((postId) => ({ postId }));
}

export function getPostMetadata(postId: string): Metadata {
  const post = posts.find((item) => item.id === postId);
  if (!post) notFound();
  if (post.isDraft) return { title: post.title, description: post.summary, robots: { index: false, follow: false } };
  const metadata = pageMetadata({ title: post.title, description: post.summary, pathname: postPath(post.id) });
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.publishedAt,
      tags: post.tags,
    },
  };
}

export function PostPage({ postId }: { postId: string }) {
  const entry = currentPosts.get(postId);
  if (!entry) notFound();
  const { post, revisions, Content } = entry;
  const series = post.series;
  const related = series ? posts.filter((item) => item.series?.id === series.id) : [];
  // oxlint-disable-next-line unicorn/no-array-sort -- props나 카탈로그가 아닌 filter로 만든 지역 배열만 정렬한다.
  related.sort((a, b) => a.series!.order - b.series!.order);
  const position = related.findIndex((item) => item.id === postId);
  const previous = related[position - 1];
  const next = related[position + 1];
  const article = (
    <PostArticle post={post}>
      <Content />
    </PostArticle>
  );
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: absoluteUrl(postPath(post.id)),
    headline: post.title,
    description: post.summary,
    datePublished: post.createdAt,
    dateModified: post.publishedAt,
    version: post.version,
    inLanguage: 'ko',
    keywords: post.tags,
  };
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-3xl space-y-32px px-24px py-40px desktop:px-0 desktop:py-64px"
    >
      {!post.isDraft && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c') }}
        />
      )}
      <Link
        href="/posts"
        className="inline-flex min-h-48px items-center rounded-4 text-title-4 text-ink-secondary underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        포스트 목록 보러가기
      </Link>
      {post.isDraft ? (
        article
      ) : (
        <PostVersionViewer key={postId} postId={postId} latestVersion={post.version} revisions={revisions}>
          {article}
        </PostVersionViewer>
      )}
      {(previous || next) && (
        <nav aria-label="시리즈 이어 읽기" className="grid gap-16px border-t border-border pt-24px desktop:grid-cols-2">
          {previous && (
            <Link
              href={postPath(previous.id)}
              className="space-y-8px rounded-12 p-16px hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="block text-body-3 text-ink-muted">이전 글</span>
              <span className="text-title-3">{previous.title}</span>
            </Link>
          )}
          {next && (
            <Link
              href={postPath(next.id)}
              className="space-y-8px rounded-12 p-16px text-right hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="block text-body-3 text-ink-muted">다음 글</span>
              <span className="text-title-3">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
