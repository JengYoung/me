'use client';

import { Progress } from '@repo/ui';

export function PostSeriesProgress({ current, total }: { current: number; total: number }) {
  return (
    <Progress.Root
      value={current}
      max={total}
      aria-label="시리즈 읽기 진행률"
      valueText={`전체 ${total}편 중 ${current}번째 글 (${Math.round((current / total) * 100)}%)`}
    >
      <Progress.Track className="h-8px overflow-hidden rounded-full bg-border">
        <Progress.Indicator className="h-full w-(--iris-progress-percent) rounded-full bg-action-primary-bg" />
      </Progress.Track>
    </Progress.Root>
  );
}
