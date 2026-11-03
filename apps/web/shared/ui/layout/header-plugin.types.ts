import type { ComponentType, RefObject } from 'react';

export type HeaderPluginProps = {
  /** DOM은 effect에서 읽습니다. Header가 마운트된 동안 같은 요소를 가리킵니다. */
  headerRef: RefObject<HTMLElement | null>;
};

/** 자체 Hook으로 효과를 관리하는 컴포넌트입니다. 동작만 추가할 때는 null을 반환합니다. */
export type HeaderPlugin = ComponentType<HeaderPluginProps>;
