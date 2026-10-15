'use client';
import { useEffect, useRef, useState } from 'react';
import { useMachine, useStableId } from '../_shared/react/index';
import { tooltipMachine, tooltipOpen } from './tooltip.machine';
import type { TooltipOptions } from './tooltip.machine';
import { connectTooltip } from './tooltip.connect';
export function useTooltip(options: TooltipOptions = {}) {
  for (const delay of [options.openDelay, options.closeDelay])
    if (delay !== undefined && (!Number.isFinite(delay) || delay < 0 || delay > 2_147_483_647))
      throw new Error('Tooltip delays must be finite milliseconds between 0 and 2147483647.');
  const id = useStableId('iris-tooltip', options.id);
  const [controlled] = useState(options.open !== undefined);
  const service = useMachine(tooltipMachine, { props: options });
  const trigger = useRef<HTMLButtonElement | null>(null);
  const open = tooltipOpen(options, service.state.value);
  const listening = open || service.state.value === 'waiting-open';
  const { send } = service;
  useEffect(() => {
    if (!listening || !trigger.current) return;
    const document = trigger.current.ownerDocument;
    const escape = (event: KeyboardEvent) => {
      if (!event.defaultPrevented && !event.isComposing && event.key === 'Escape') {
        event.preventDefault();
        send({ type: 'DISMISS' });
      }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [listening, send]);
  if (controlled !== (options.open !== undefined)) throw new Error('Tooltip cannot switch control modes.');
  // connect stores the ref without reading current during render.
  // oxlint-disable-next-line react/refs
  return connectTooltip(service, { ...options, id }, trigger);
}
export type { TooltipOptions } from './tooltip.machine';
export type { TooltipApi } from './tooltip.connect';
