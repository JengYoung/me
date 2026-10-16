'use client';

import { useCallback, useRef, useState } from 'react';
import { useMachine, useStableId } from '../_shared/react/index';
import { useModalFocus } from '../_shared/focus/index';
import type { ModalFocusOptions } from '../_shared/focus/index';
import { dialogMachine } from './dialog.machine';
import type { DialogChangeReason, DialogStateOptions } from './dialog.machine';
import { connectDialog } from './dialog.connect';

export interface DialogOptions extends DialogStateOptions, Omit<ModalFocusOptions, 'open' | 'onDismiss'> {
  id?: string;
  /** null omits the description for structured content; undefined links the Description part. */
  describedBy?: string | null;
}

export function useDialog(options: DialogOptions = {}) {
  const [controlled] = useState(options.open !== undefined);
  const id = useStableId('iris-dialog', options.id);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const { state, send } = useMachine(dialogMachine, { props: options });
  const open = options.open ?? state.value === 'open';
  const setOpen = useCallback(
    (next: boolean, reason: DialogChangeReason = 'programmatic') => {
      send({ type: 'SET_OPEN', open: next, reason });
    },
    [send],
  );
  // The focus hook invokes these getters after commit, never while rendering.
  /* oxlint-disable react/refs */
  const focus = useModalFocus({
    ...options,
    open,
    closeOnOutside: options.closeOnOutside ?? true,
    returnFocus: () => options.returnFocus?.() ?? trigger.current,
    onDismiss: (reason) => setOpen(false, reason),
  });
  /* oxlint-enable react/refs */
  if (controlled !== (options.open !== undefined)) throw new Error('Dialog cannot switch control modes.');
  // connect only places the ref in props; it never reads current during render.
  // oxlint-disable-next-line react/refs
  return connectDialog({ open, setOpen }, focus, { id, describedBy: options.describedBy, trigger });
}

export type { DialogApi } from './dialog.connect';
export type { DialogChangeDetails, DialogChangeReason } from './dialog.machine';
