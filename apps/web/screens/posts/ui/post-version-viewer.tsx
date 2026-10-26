'use client';

import type { ReactNode } from 'react';
import { formatPublishedAt } from '../../../entities/post';
import type { PostRevision } from '../../../entities/post';
import { usePostVersion } from '../lib/use-post-version';
import { PostVersionContent } from './post-version-content';
import { PostVersionHistory } from './post-version-history';

export function PostVersionViewer({
  postId,
  latestVersion,
  revisions,
  children,
}: {
  postId: string;
  latestVersion: string;
  revisions: PostRevision[];
  children: ReactNode;
}) {
  const { version, selectVersion } = usePostVersion();
  const selectedVersion = version ?? latestVersion;
  const selected = revisions.find((revision) => revision.version === selectedVersion);
  return (
    <div className="space-y-16px">
      <div className="flex min-h-48px flex-wrap items-center gap-x-8px text-body-3 text-ink-muted">
        {selected && <time dateTime={selected.publishedAt}>{formatPublishedAt(selected.publishedAt)}</time>}
        {revisions.length > 1 && (
          <PostVersionHistory
            revisions={revisions}
            latestVersion={latestVersion}
            selectedVersion={selectedVersion}
            onSelect={(next) => selectVersion(next === latestVersion ? null : next)}
          />
        )}
      </div>
      <PostVersionContent
        postId={postId}
        latestVersion={latestVersion}
        selectedVersion={selectedVersion}
        onShowLatest={() => selectVersion(null)}
      >
        {children}
      </PostVersionContent>
      <noscript>
        <p className="text-body-2 text-ink-secondary">
          현재 최신 글을 보고 있습니다. 이전 수정 내역을 보려면 JavaScript가 필요합니다.
        </p>
      </noscript>
    </div>
  );
}
