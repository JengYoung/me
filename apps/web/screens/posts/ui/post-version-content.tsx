'use client';

import { Component } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@repo/ui';
import { archiveComponents } from '@post-content/archives.generated';

function ArchiveError({ onShowLatest }: { onShowLatest: () => void }) {
  return (
    <div role="alert" className="space-y-16px rounded-12 border border-border p-24px text-body-2">
      <p>선택한 수정본을 불러올 수 없습니다.</p>
      <Button
        onClick={onShowLatest}
        className="min-h-48px cursor-pointer rounded-8 px-16px text-title-4 text-ink underline hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
      >
        최신 글 보기
      </Button>
    </div>
  );
}

class ArchiveBoundary extends Component<{ children: ReactNode; onShowLatest: () => void }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? <ArchiveError onShowLatest={this.props.onShowLatest} /> : this.props.children;
  }
}

export function PostVersionContent({
  postId,
  selectedVersion,
  latestVersion,
  children,
  onShowLatest,
}: {
  postId: string;
  selectedVersion: string;
  latestVersion: string;
  children: ReactNode;
  onShowLatest: () => void;
}) {
  if (selectedVersion === latestVersion) return children;
  const ArchivedContent = archiveComponents.get(postId)?.get(selectedVersion);
  if (!ArchivedContent) return <ArchiveError onShowLatest={onShowLatest} />;
  return (
    <ArchiveBoundary key={`${postId}/${selectedVersion}`} onShowLatest={onShowLatest}>
      {/* oxlint-disable-next-line react/static-components -- 빌드 시 모듈 최상위에서 생성한 next/dynamic 컴포넌트를 조회한다. */}
      <ArchivedContent />
    </ArchiveBoundary>
  );
}
