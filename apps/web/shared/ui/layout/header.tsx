'use client';

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import type { HeaderPlugin } from './header-plugin.types';

export type HeaderProps = Omit<ComponentPropsWithoutRef<'header'>, 'children' | 'title'> & {
  leftChildren?: ReactNode;
  rightChildren?: ReactNode;
  title?: string;
  /** 자체 Hook으로 효과를 관리하는 컴포넌트입니다. 기본값은 null입니다. */
  plugin?: HeaderPlugin | null;
};

/** 높이 64px의 고정 헤더입니다. 본문 상단 여백은 사용하는 레이아웃에서 확보합니다. */
export function Header({
  leftChildren,
  rightChildren,
  title,
  plugin: Plugin = null,
  className,
  ...props
}: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);

  return (
    <header
      {...props}
      ref={headerRef}
      className={[
        'fixed inset-x-0 top-0 z-30 h-64px border-b border-transparent bg-transparent font-sans text-ink transition-[background-color,border-color,transform] duration-300 ease-out data-[scrolled=true]:bg-bg-surface/90 data-[border-visible=true]:border-border focus-within:transition-none motion-reduce:transition-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-scrolled={false}
      data-border-visible={true}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-24px mobile:px-24px desktop:px-64px">
        <div className="flex shrink-0 items-center gap-12px">{leftChildren}</div>
        {title && <h1 className="min-w-0 truncate text-title-2">{title}</h1>}
        <div className="flex items-center gap-16px">{rightChildren}</div>
      </div>
      {Plugin && <Plugin headerRef={headerRef} />}
    </header>
  );
}
