'use client';

import { validateCollection } from '../_shared/core/index';
import { useMachine, useStableId } from '../_shared/react/index';
import { useRovingFocus } from '../_shared/keyboard/index';
import { useEffect, useRef, useState } from 'react';
import { radioGroupMachine, radioGroupValue } from './radio-group.machine';
import type { RadioGroupOptions } from './radio-group.machine';
import { connectRadioGroup } from './radio-group.connect';

export function useRadioGroup(options: RadioGroupOptions) {
  validateCollection(options.items);
  const [controlled] = useState(options.value !== undefined);
  const id = useStableId('iris-radio-group', options.id);
  const service = useMachine(radioGroupMachine, { props: options });
  const pendingResets = useRef(new Set<ReturnType<typeof setTimeout>>());
  const roving = useRovingFocus({
    items: options.items,
    value: service.state.context.focusedValue,
    orientation: 'both',
    dir: options.dir,
    loop: true,
    homeEnd: false,
    disabled: options.disabled || options.inToolbar,
    onValueChange: (value) => {
      if (value !== null) service.send({ type: 'FOCUS', value });
    },
    onNavigate: (value) => service.send({ type: 'SELECT', value }),
    onLeave: () => service.send({ type: 'LEAVE' }),
  });
  useEffect(() => {
    const pending = pendingResets.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);
  useEffect(() => {
    const forms = new Set<HTMLFormElement>();
    for (const item of options.items) {
      const form = (roving.getItemElement(item.value) as HTMLInputElement | null)?.form;
      if (form) forms.add(form);
    }
    const reset = (event: Event) => {
      const form = event.target;
      // A microtask can run before React's delegated onReset and the native default action.
      // The next task observes cancellation and restores checked state after native reset.
      const timer = setTimeout(() => {
        pendingResets.current.delete(timer);
        if (event.defaultPrevented) return;
        const props = service.getProps();
        if (!props.items.some((item) => (roving.getItemElement(item.value) as HTMLInputElement | null)?.form === form))
          return;
        service.send({ type: 'RESET' });
        const selected = radioGroupValue(service.getProps(), service.getSnapshot().context);
        // Native reset also runs when a controlled owner declines the change request.
        for (const item of props.items) {
          const input = roving.getItemElement(item.value) as HTMLInputElement | null;
          if (input) input.checked = item.value === selected;
        }
      }, 0);
      pendingResets.current.add(timer);
    };
    forms.forEach((form) => form.addEventListener('reset', reset));
    return () => {
      forms.forEach((form) => form.removeEventListener('reset', reset));
    };
  });
  if (controlled !== (options.value !== undefined)) throw new Error('Radio Group cannot switch control modes.');
  return connectRadioGroup(service, roving, { ...options, id });
}

export type { RadioGroupOptions } from './radio-group.machine';
export type { RadioGroupApi } from './radio-group.connect';
