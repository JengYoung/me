import { createMachine } from '../_shared/core/index';
export interface MenuButtonStateOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}
export interface MenuButtonSchema {
  state: 'closed' | 'open';
  props: MenuButtonStateOptions;
  context: { edge: 'first' | 'last' };
  event: { type: 'OPEN'; open: boolean; edge?: 'first' | 'last' };
}
export const menuButtonMachine = createMachine<MenuButtonSchema>({
  initial: ({ props }) => ((props.open ?? props.defaultOpen ?? false) ? 'open' : 'closed'),
  context: () => ({ edge: 'first' }),
  states: { closed: {}, open: {} },
  onProps: [
    { guard: ({ props }) => props.open === true, target: 'open' },
    { guard: ({ props }) => props.open === false, target: 'closed' },
  ],
  on: {
    OPEN: [
      {
        guard: ({ props, value, event }) =>
          !props.disabled && props.open !== undefined && event.open !== (props.open ?? value === 'open'),
        assign: ({ event }) => ({ edge: event.edge ?? 'first' }),
        actions: [({ props, event }) => props.onOpenChange?.(event.open)],
      },
      ...([false, true] as const).map((open) => ({
        target: open ? ('open' as const) : ('closed' as const),
        guard: ({
          props,
          value,
          event,
        }: {
          props: MenuButtonStateOptions;
          value: 'open' | 'closed';
          event: MenuButtonSchema['event'];
        }) => !props.disabled && props.open === undefined && event.open === open && (value === 'open') !== open,
        assign: ({ event }: { event: MenuButtonSchema['event'] }) => ({ edge: event.edge ?? 'first' }),
        actions: [({ props }: { props: MenuButtonStateOptions }) => props.onOpenChange?.(open)],
      })),
    ],
  },
});
