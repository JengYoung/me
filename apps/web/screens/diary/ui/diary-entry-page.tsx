import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { diaryPath, formatEntryDate } from '../../../entities/diary';
import { ArticleLayout, ArticleBackLink, ArticleHeader } from '../../../shared/ui/article';
import { absoluteUrl, pageMetadata } from '../../../shared/lib/seo';
import { diary } from '@diary-content/catalog.generated';
import { currentDiary } from '@diary-content/current.generated';

export function getDiaryStaticParams() {
  return [...currentDiary.keys()].map((entryId) => ({ entryId }));
}

export function getDiaryMetadata(entryId: string): Metadata {
  const entry = diary.find((item) => item.id === entryId);
  if (!entry) notFound();
  if (entry.isDraft) return { title: entry.title, description: entry.summary, robots: { index: false, follow: false } };
  const metadata = pageMetadata({ title: entry.title, description: entry.summary, pathname: diaryPath(entry.id) });
  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, type: 'article', publishedTime: entry.publishedAt, tags: entry.tags },
  };
}

export function DiaryEntryPage({ entryId }: { entryId: string }) {
  const document = currentDiary.get(entryId);
  if (!document) notFound();
  const { entry, Content } = document;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: absoluteUrl(diaryPath(entry.id)),
    headline: entry.title,
    description: entry.summary,
    datePublished: entry.publishedAt,
    inLanguage: 'ko',
    keywords: entry.tags,
  };
  return (
    <ArticleLayout typography="serif">
      {!entry.isDraft && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c') }}
        />
      )}
      <ArticleBackLink href="/diary">일기 목록 보러가기</ArticleBackLink>
      <article className="min-w-0 space-y-40px">
        <ArticleHeader
          title={entry.title}
          summary={entry.summary}
          tags={entry.tags}
          before={
            <>
              {entry.isDraft && <p className="text-body-3 text-ink-muted">로컬 초안 미리보기</p>}
              <p className="text-body-3 text-ink-muted">
                <time dateTime={entry.entryDate}>{formatEntryDate(entry.entryDate)}</time>
              </p>
            </>
          }
        />
        <Content />
      </article>
    </ArticleLayout>
  );
}
