'use client';
import { validateCollection } from '../_shared/core/index';
import { useDirectionContext, useMachine, useStableId } from '../_shared/react/index';
import { useEffect, useRef, useState } from 'react';
import { listboxMachine, listboxActive } from './listbox.machine';
import type { ListboxOptions } from './listbox.machine';
import { connectListbox } from './listbox.connect';

export function useListbox(options: ListboxOptions) {
  validateCollection(options.items);
  const inherited = useDirectionContext();
  const id = useStableId('iris-listbox', options.id);
  const [controlled] = useState([options.value !== undefined, options.activeValue !== undefined]);
  const service = useMachine(listboxMachine, { props: options });
  const root = useRef<HTMLDivElement | null>(null);
  const active = listboxActive(options, service.state.context);
  useEffect(() => {
    if (active === null) return;
    root.current?.ownerDocument
      .getElementById(`${id}-option-${encodeURIComponent(active)}`)
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [id, active]);
  if (controlled[0] !== (options.value !== undefined) || controlled[1] !== (options.activeValue !== undefined))
    throw new Error('Listbox cannot switch control modes.');
  // connect stores the ref in props; current is only read in event handlers.
  // oxlint-disable-next-line react/refs
  return connectListbox(service, { ...options, dir: options.dir ?? inherited, id }, root);
}
export type { ListboxOptions, ListboxItem } from './listbox.machine';
export type { ListboxApi } from './listbox.connect';
