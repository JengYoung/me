'use client';

import { validateCollection } from '../_shared/core/index';
import { useMachine, useStableId } from '../_shared/react/index';
import { useRovingFocus } from '../_shared/keyboard/index';
import { useRef, useState } from 'react';
import { tabsMachine } from './tabs.machine';
import type { TabsOptions } from './tabs.machine';
import { connectTabs } from './tabs.connect';

export function useTabs(options: TabsOptions) {
  validateCollection(options.items);
  const [controlled] = useState(options.value !== undefined);
  const id = useStableId('iris-tabs', options.id);
  const service = useMachine(tabsMachine, { props: options });
  const pointerFocus = useRef(false);
  const roving = useRovingFocus({
    items: options.items,
    value: service.state.context.focusedValue,
    orientation: options.orientation,
    dir: options.dir,
    loop: options.loop,
    disabled: options.disabled,
    onValueChange: (value) => {
      if (value !== null) service.send({ type: 'FOCUS', value });
    },
    onLeave: () => {
      pointerFocus.current = false;
      service.send({ type: 'LEAVE' });
    },
  });
  if (controlled !== (options.value !== undefined)) throw new Error('Tabs cannot switch control modes.');
  // connect stores these callbacks in props; it never invokes them while rendering.
  /* oxlint-disable react/refs */
  return connectTabs(
    service,
    roving,
    { ...options, id },
    {
      pointerStart: () => {
        pointerFocus.current = true;
      },
      pointerEnd: () => {
        pointerFocus.current = false;
      },
      focus: (value) => {
        // Pointer activation belongs to click so one gesture makes one controlled request.
        if (!pointerFocus.current) service.send({ type: 'NAVIGATE', value });
        pointerFocus.current = false;
      },
    },
  );
  /* oxlint-enable react/refs */
}

export type { TabsOptions } from './tabs.machine';
export type { TabsApi } from './tabs.connect';
