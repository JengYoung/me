'use client';

import { useRef, useState } from 'react';
import { Button, Popover } from '@repo/ui';
import { Check, X } from 'lucide-react';
import { formatPublishedAt } from '../../../entities/post';
import type { PostRevision } from '../../../entities/post';

export function PostVersionHistory({
  revisions,
  selectedVersion,
  latestVersion,
  onSelect,
}: {
  revisions: readonly PostRevision[];
  selectedVersion: string;
  latestVersion: string;
  onSelect: (version: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedRef = useRef<HTMLButtonElement>(null);
  return (
    <Popover.Root
      open={open}
      onOpenChange={setOpen}
      initialFocus={() => selectedRef.current}
      placement="bottom-start"
      offset={8}
      collisionPadding={16}
    >
      <Popover.Trigger className="min-h-48px cursor-pointer rounded-8 px-8px text-body-3 text-ink-secondary underline hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-ring">
        이전 수정 내역 보기
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-50 w-80 max-w-full overflow-y-auto rounded-12 border border-border bg-bg-surface p-8px text-ink">
          <div className="flex items-center justify-between gap-8px">
            <Popover.Title className="px-12px text-title-4">수정 내역</Popover.Title>
            <Popover.Close
              aria-label="수정 내역 닫기"
              className="flex min-h-48px min-w-48px cursor-pointer items-center justify-center rounded-8 hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="size-16px" aria-hidden="true" />
            </Popover.Close>
          </div>
          <ul aria-label="수정 내역" className="space-y-4px">
            {revisions.map((revision) => (
              <li key={revision.version}>
                <Button
                  ref={revision.version === selectedVersion ? selectedRef : undefined}
                  aria-current={revision.version === selectedVersion ? 'true' : undefined}
                  className="flex min-h-48px w-full cursor-pointer items-start gap-8px rounded-8 px-12px py-12px text-left text-body-3 text-ink-secondary hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-ring aria-[current=true]:bg-bg-subtle"
                  onClick={() => {
                    setOpen(false);
                    if (revision.version !== selectedVersion) onSelect(revision.version);
                  }}
                >
                  <span className="min-w-0 space-y-4px">
                    <time className="block" dateTime={revision.publishedAt}>
                      {formatPublishedAt(revision.publishedAt)}
                    </time>
                    <span className="block text-body-4 text-ink-muted">
                      v{revision.version}
                      {revision.version === latestVersion ? ' · 최신' : ''}
                    </span>
                    {revision.reason && <span className="block break-words text-body-3">{revision.reason}</span>}
                  </span>
                  {revision.version === selectedVersion && (
                    <Check className="ml-auto size-16px shrink-0" aria-hidden="true" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
