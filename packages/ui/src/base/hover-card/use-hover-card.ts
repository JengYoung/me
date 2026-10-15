'use client';
import { useCallback, useRef, useState } from 'react';
import { useDirection, useMachine, useStableId } from '../_shared/react/index';
import { useLayerFocus } from '../_shared/focus/index';
import { usePosition } from '../_shared/positioning/index';
import type { PositionOptions } from '../_shared/positioning/index';
import { hoverCardMachine, hoverCardOpen } from './hover-card.machine';
import type { HoverCardStateOptions } from './hover-card.machine';
import { connectHoverCard } from './hover-card.connect';
export interface HoverCardOptions extends HoverCardStateOptions, PositionOptions {
  id?: string;
}
export function useHoverCard(options: HoverCardOptions = {}) {
  const id = useStableId('iris-hover-card', options.id);
  const dir = useDirection(options.dir);
  const [controlled] = useState(options.open !== undefined);
  const service = useMachine(hoverCardMachine, { props: options });
  const [trigger, setTrigger] = useState<HTMLAnchorElement | null>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const touch = useRef(false);
  const open = hoverCardOpen(options, service.state.context);
  const { send } = service;
  const setOpen = useCallback((next: boolean) => send({ type: 'SET_OPEN', open: next }), [send]);
  const dismiss = useCallback(() => send({ type: 'DISMISS' }), [send]);
  const focus = useLayerFocus({
    open,
    modal: false,
    autoFocus: false,
    closeOnOutside: true,
    trigger: () => trigger,
    returnFocus: () => trigger,
    onDismiss: dismiss,
  });
  const position = usePosition({ ...options, dir, open, anchor: trigger, content, onAnchorHidden: dismiss });
  for (const delay of [options.openDelay, options.closeDelay])
    if (delay !== undefined && (!Number.isFinite(delay) || delay < 0 || delay > 2_147_483_647))
      throw new Error('Hover Card delays must be finite milliseconds between 0 and 2147483647.');
  if (controlled !== (options.open !== undefined)) throw new Error('Hover Card cannot switch control modes.');
  // The connector only reads the mutable pointer modality from event handlers.
  /* oxlint-disable react/refs */
  return connectHoverCard(
    { open, setOpen, dismiss, service },
    focus,
    position,
    { id, dir },
    { trigger, content, setTrigger, setContent, touch },
  );
  /* oxlint-enable react/refs */
}
export type { HoverCardApi } from './hover-card.connect';
