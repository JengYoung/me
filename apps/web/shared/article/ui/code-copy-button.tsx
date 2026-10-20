'use client';

import { Clipboard } from '@repo/ui';

/** 아티클 코드 복사만 클라이언트에서 실행하고 본문은 서버 렌더링 가능하게 유지한다. */
export function CodeCopyButton({ code }: { code: string }) {
  return (
    <Clipboard.Root
      value={code}
      messages={{ success: '복사했습니다.', error: '복사하지 못했습니다. 코드를 직접 선택해 복사해주세요.' }}
      feedbackDuration={0}
      className="flex min-w-0 flex-wrap items-center justify-end gap-8px"
    >
      <Clipboard.Feedback className="text-body-3 text-ink-secondary" />
      <Clipboard.Trigger className="min-h-48px shrink-0 cursor-pointer rounded-8 px-16px py-12px text-title-4 text-ink hover:bg-bg-subtle active:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-ring">
        코드 복사
      </Clipboard.Trigger>
    </Clipboard.Root>
  );
}
