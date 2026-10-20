'use client';

import { Drawer, type DrawerRootProps } from '@repo/ui';
import type { ComponentProps, ReactNode } from 'react';

const ICON_BUTTON_CLASS_NAME =
  'inline-flex size-48px shrink-0 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-bg-subtle active:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none';

export type SidebarRootProps = Pick<
  DrawerRootProps,
  'children' | 'open' | 'defaultOpen' | 'onOpenChange' | 'initialFocus' | 'returnFocus' | 'id'
>;

export type SidebarTriggerProps = ComponentProps<typeof Drawer.Trigger>;

export type SidebarContentProps = {
  title: ReactNode;
  closeLabel?: string;
  children: ReactNode;
};

/** 오른쪽 모달 사이드바입니다. 열림 상태와 포커스 처리는 Drawer가 관리합니다. */
function SidebarRoot(props: SidebarRootProps) {
  return <Drawer.Root {...props} side="right" describedBy={null} />;
}

function SidebarTrigger({ className = '', ...props }: SidebarTriggerProps) {
  return <Drawer.Trigger {...props} className={`${ICON_BUTTON_CLASS_NAME} ${className}`} />;
}

function SidebarContent({ title, closeLabel = '사이드바 닫기', children }: SidebarContentProps) {
  return (
    <Drawer.Portal>
      {/* 닫힘 모션 동안에도 배경과 패널이 포인터를 가로채지 않도록 합니다. */}
      <Drawer.Backdrop className="fixed inset-0 z-40 bg-bg-inverse/40 opacity-100 transition-[opacity,display] transition-discrete duration-300 ease-out data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 motion-reduce:transition-none starting:opacity-0" />
      <Drawer.Content className="fixed inset-y-0 right-0 z-50 flex w-[calc(100%_-_var(--spacing-48px))] max-w-sm translate-x-0 flex-col overflow-hidden border-l border-border bg-bg-surface font-sans text-ink transition-[translate,display] transition-discrete duration-300 ease-out data-[state=closed]:pointer-events-none data-[state=closed]:translate-x-full motion-reduce:transition-none starting:translate-x-full">
        <div
          data-sidebar-header
          className="flex h-64px shrink-0 items-center justify-between gap-16px border-b border-border px-24px"
        >
          <Drawer.Title className="min-w-0 truncate text-title-2">{title}</Drawer.Title>
          <Drawer.Close aria-label={closeLabel} className={ICON_BUTTON_CLASS_NAME}>
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-24px"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </Drawer.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-24px">{children}</div>
      </Drawer.Content>
    </Drawer.Portal>
  );
}

export const Sidebar = {
  Root: SidebarRoot,
  Trigger: SidebarTrigger,
  Content: SidebarContent,
};
