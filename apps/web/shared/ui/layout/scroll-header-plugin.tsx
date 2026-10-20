'use client';

import { useEffect } from 'react';
import { scrollHeaderPlugin } from './header-plugin.lib';
import type { HeaderPluginProps } from './header-plugin.types';

/** 스크롤 효과의 설치·정리를 자신의 생명주기에서 관리합니다. */
export function ScrollHeaderPlugin({ headerRef }: HeaderPluginProps) {
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    return scrollHeaderPlugin(header);
  }, [headerRef]);

  return null;
}
