import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { postPath } from '../../../entities/post';
import { absoluteUrl, pageMetadata } from '../../../shared/seo';
import { ArticleLayout, ArticleBackLink } from '../../../shared/article';
import { posts } from '@post-content/catalog.generated';
import { currentPosts } from '@post-content/current.generated';
import { PostArticle } from './post-article';
import { series as allSeries } from '../../../entities/series';
import { PostSeriesNavigation } from '../../../widgets/series-navigation';
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
  const series = allSeries.find((item) => item.id === post.series?.id);
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
    <ArticleLayout>
      {!post.isDraft && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c') }}
        />
      )}
      <ArticleBackLink href="/posts">포스트 목록 보러가기</ArticleBackLink>
      {post.isDraft ? (
        article
      ) : (
        <PostVersionViewer key={postId} postId={postId} latestVersion={post.version} revisions={revisions}>
          {article}
        </PostVersionViewer>
      )}
      {series && <PostSeriesNavigation series={series} postId={postId} />}
    </ArticleLayout>
  );
}
