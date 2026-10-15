import { createMachine } from '../_shared/core/index';

export type DialogChangeReason =
  | 'trigger'
  | 'close-button'
  | 'escape'
  | 'outside'
  | 'programmatic'
  | 'confirm'
  | 'cancel';
export interface DialogChangeDetails {
  reason: DialogChangeReason;
}
export interface DialogStateOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: DialogChangeDetails) => void;
}
export interface DialogSchema {
  state: 'open' | 'closed';
  context: Record<string, never>;
  props: DialogStateOptions;
  event: { type: 'SET_OPEN'; open: boolean; reason: DialogChangeReason };
}

/** Dialog and AlertDialog share the same open/request state machine. No DOM or React effects. */
export const dialogMachine = createMachine<DialogSchema>({
  initial: ({ props }) => ((props.open ?? props.defaultOpen ?? false) ? 'open' : 'closed'),
  context: () => ({}),
  states: { open: {}, closed: {} },
  onProps: [
    { guard: ({ props }) => props.open === true, target: 'open' },
    { guard: ({ props }) => props.open === false, target: 'closed' },
  ],
  on: {
    SET_OPEN: [
      {
        guard: ({ props, event }) => props.open !== undefined && event.open !== props.open,
        actions: [({ props, event }) => props.onOpenChange?.(event.open, { reason: event.reason })],
      },
      {
        guard: ({ props, value, event }) => props.open === undefined && value === 'closed' && event.open,
        target: 'open',
        actions: [({ props, event }) => props.onOpenChange?.(true, { reason: event.reason })],
      },
      {
        guard: ({ props, value, event }) => props.open === undefined && value === 'open' && !event.open,
        target: 'closed',
        actions: [({ props, event }) => props.onOpenChange?.(false, { reason: event.reason })],
      },
    ],
  },
});
