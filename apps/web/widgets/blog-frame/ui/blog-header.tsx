'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Header, ScrollHeaderPlugin, Sidebar } from '../../../shared/ui';

const navigation = [
  { href: '/', label: '홈' },
  { href: '/posts', label: '포스트' },
  { href: '/series', label: '시리즈' },
  { href: '/diary', label: '일기' },
] as const;

function HeaderNavigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sidebar.Root open={open} onOpenChange={setOpen}>
      <Header
        plugin={ScrollHeaderPlugin}
        leftChildren={
          <Link
            href="/"
            aria-label="JengYoung 홈"
            className="inline-flex min-h-48px items-center gap-12px rounded-8 text-title-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <Image src="/characters/character/00-neutral.svg" alt="" width={40} height={40} loading="eager" />
            <span className="text-title-3 font-bold">JengYoung</span>
          </Link>
        }
        rightChildren={
          <Sidebar.Trigger aria-label="메뉴 열기">
            <Menu aria-hidden="true" focusable="false" className="size-24px" />
          </Sidebar.Trigger>
        }
      />
      <Sidebar.Content title="둘러보기" closeLabel="메뉴 닫기">
        <nav aria-label="블로그 메뉴" className="grid gap-8px">
          {navigation.map(({ href, label }) => {
            const current = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className="flex min-h-48px items-center rounded-8 px-16px py-12px text-title-4 text-ink-secondary hover:bg-bg-subtle hover:text-ink aria-[current=page]:bg-bg-subtle aria-[current=page]:text-ink focus-visible:outline-2 focus-visible:outline-ring"
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </Sidebar.Content>
    </Sidebar.Root>
  );
}

export function BlogHeader() {
  const pathname = usePathname();
  return <HeaderNavigation key={pathname} pathname={pathname} />;
}
