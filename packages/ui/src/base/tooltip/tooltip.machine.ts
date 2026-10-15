import { createMachine } from "../_shared/core/index";
export interface TooltipOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
  id?: string;
}
export interface TooltipSchema {
  state: 'closed' | 'waiting-open' | 'open' | 'waiting-close' | 'dismissed';
  props: TooltipOptions;
  context: { trigger: boolean; content: boolean; focused: boolean };
  event:
    | { type: 'HOVER'; part: 'trigger' | 'content'; hovered: boolean }
    | { type: 'FOCUS'; focused: boolean }
    | { type: 'EVALUATE' }
    | { type: 'SET_OPEN'; open: boolean }
    | { type: 'DISMISS' };
}
export const tooltipOpen = (props: TooltipOptions, value: TooltipSchema['state']) =>
  !props.disabled && (props.open ?? (value === 'open' || value === 'waiting-close'));
const present = (context: TooltipSchema['context']) => context.trigger || context.content || context.focused;
export const tooltipMachine = createMachine<TooltipSchema>({
  initial: ({ props }) => ((props.open ?? props.defaultOpen ?? false) ? 'open' : 'closed'),
  context: () => ({ trigger: false, content: false, focused: false }),
  states: {
    closed: {},
    dismissed: {},
    open: {},
    'waiting-open': {
      effects: [
        ({ props, schedule }) => {
          schedule({ type: 'SET_OPEN', open: true }, props.openDelay ?? 700);
        },
      ],
    },
    'waiting-close': {
      effects: [
        ({ props, schedule }) => {
          schedule({ type: 'SET_OPEN', open: false }, props.closeDelay ?? 150);
        },
      ],
    },
  },
  onProps: [
    {
      guard: ({ props }) => !!props.disabled,
      target: 'closed',
      assign: () => ({ trigger: false, content: false, focused: false }),
    },
    {
      guard: ({ props, value }) => props.open === true && value !== 'dismissed' && value !== 'waiting-close',
      target: 'open',
    },
    {
      guard: ({ props, value }) => props.open === false && (value === 'open' || value === 'waiting-close'),
      target: 'closed',
    },
  ],
  on: {
    HOVER: {
      guard: ({ props }) => !props.disabled,
      assign: ({ event }) => ({ [event.part]: event.hovered }),
      actions: [({ send }) => send({ type: 'EVALUATE' })],
    },
    FOCUS: {
      guard: ({ props }) => !props.disabled,
      assign: ({ event }) => ({ focused: event.focused }),
      actions: [
        ({ value, event, send }) => {
          if (event.focused && value !== 'dismissed') send({ type: 'SET_OPEN', open: true });
          else send({ type: 'EVALUATE' });
        },
      ],
    },
    EVALUATE: [
      { guard: ({ value, context }) => value === 'dismissed' && !present(context), target: 'closed' },
      { guard: ({ value, context }) => value === 'closed' && present(context), target: 'waiting-open' },
      { guard: ({ value, context }) => value === 'waiting-open' && !present(context), target: 'closed' },
      { guard: ({ value, context }) => value === 'open' && !present(context), target: 'waiting-close' },
      { guard: ({ value, context }) => value === 'waiting-close' && present(context), target: 'open' },
    ],
    SET_OPEN: [
      {
        guard: ({ props, value, event }) =>
          !props.disabled && props.open !== undefined && event.open !== tooltipOpen(props, value),
        actions: [({ props, event }) => props.onOpenChange?.(event.open)],
      },
      {
        guard: ({ props, value, event }) =>
          !props.disabled && props.open === undefined && event.open && !tooltipOpen(props, value),
        target: 'open',
        actions: [({ props }) => props.onOpenChange?.(true)],
      },
      {
        guard: ({ props, value, event }) => props.open === undefined && !event.open && tooltipOpen(props, value),
        target: 'closed',
        actions: [({ props }) => props.onOpenChange?.(false)],
      },
    ],
    DISMISS: [
      {
        guard: ({ props, value }) => tooltipOpen(props, value),
        target: 'dismissed',
        actions: [({ props }) => props.onOpenChange?.(false)],
      },
      { target: 'dismissed' },
    ],
  },
});
