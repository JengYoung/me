'use client';
import { validateCollection } from '../_shared/core/index';
import { useMachine, useStableId } from '../_shared/react/index';
import { useRovingFocus } from '../_shared/keyboard/index';
import { useState } from 'react';
import { toolbarMachine, toolbarValue } from './toolbar.machine';
import type { ToolbarOptions } from './toolbar.machine';
import { connectToolbar } from './toolbar.connect';

export function useToolbar(options: ToolbarOptions) {
  validateCollection(options.items);
  const [controlled] = useState(options.value !== undefined);
  const id = useStableId('iris-toolbar', options.id);
  const service = useMachine(toolbarMachine, { props: options });
  const roving = useRovingFocus({
    items: options.items,
    value: toolbarValue(options, service.state.context),
    orientation: options.orientation,
    dir: options.dir,
    loop: options.loop,
    disabled: options.disabled,
    onValueChange: (value) => {
      if (value !== null) service.send({ type: 'FOCUS', value });
    },
    onLeave: () => service.send({ type: 'LEAVE' }),
  });
  if (controlled !== (options.value !== undefined)) throw new Error('Toolbar cannot switch control modes.');
  return connectToolbar(service, roving, { ...options, id });
}
export type { ToolbarOptions } from './toolbar.machine';
export type { ToolbarApi } from './toolbar.connect';
