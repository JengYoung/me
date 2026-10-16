import { createMachine } from '../_shared/core/index';
export interface HoverCardStateOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
}
export interface HoverCardSchema {
  state: 'idle' | 'opening' | 'closing' | 'dismissed';
  props: HoverCardStateOptions;
  context: { open: boolean; trigger: boolean; content: boolean; focused: boolean };
  event:
    | { type: 'HOVER'; part: 'trigger' | 'content'; hovered: boolean }
    | { type: 'FOCUS'; focused: boolean }
    | { type: 'EVALUATE' }
    | { type: 'SET_OPEN'; open: boolean }
    | { type: 'DISMISS' };
}
const present = (context: HoverCardSchema['context']) => context.trigger || context.content || context.focused;
export const hoverCardOpen = (props: HoverCardStateOptions, context: HoverCardSchema['context']) =>
  !props.disabled && (props.open ?? context.open);
export const hoverCardMachine = createMachine<HoverCardSchema>({
  initial: 'idle',
  context: ({ props }) => ({ open: props.defaultOpen ?? false, trigger: false, content: false, focused: false }),
  states: {
    idle: {},
    dismissed: {},
    opening: {
      effects: [
        ({ props, schedule }) => {
          schedule({ type: 'SET_OPEN', open: true }, props.openDelay ?? 500);
        },
      ],
    },
    closing: {
      effects: [
        ({ props, schedule }) => {
          schedule({ type: 'SET_OPEN', open: false }, props.closeDelay ?? 250);
        },
      ],
    },
  },
  onProps: [
    {
      guard: ({ props }) => !!props.disabled,
      target: 'idle',
      assign: () => ({ open: false, trigger: false, content: false, focused: false }),
    },
    {
      guard: ({ props, value }) =>
        (value === 'opening' && props.open === true) || (value === 'closing' && props.open === false),
      target: 'idle',
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
        ({ event, value, send }) => {
          if (event.focused && value !== 'dismissed') send({ type: 'SET_OPEN', open: true });
          else send({ type: 'EVALUATE' });
        },
      ],
    },
    EVALUATE: [
      { guard: ({ value, context }) => value === 'dismissed' && !present(context), target: 'idle' },
      { guard: ({ value }) => value === 'dismissed' },
      { guard: ({ props, context }) => present(context) && hoverCardOpen(props, context), target: 'idle' },
      { guard: ({ props, context }) => present(context) && !hoverCardOpen(props, context), target: 'opening' },
      { guard: ({ props, context }) => !present(context) && hoverCardOpen(props, context), target: 'closing' },
      { target: 'idle' },
    ],
    SET_OPEN: [
      {
        guard: ({ props, context, event }) => !props.disabled && event.open !== hoverCardOpen(props, context),
        target: 'idle',
        assign: ({ props, context, event }) => ({ open: props.open === undefined ? event.open : context.open }),
        actions: [({ props, event }) => props.onOpenChange?.(event.open)],
      },
      { target: 'idle' },
    ],
    DISMISS: [
      {
        guard: ({ props, context }) => hoverCardOpen(props, context),
        target: 'dismissed',
        assign: ({ props, context }) => ({ open: props.open === undefined ? false : context.open }),
        actions: [({ props }) => props.onOpenChange?.(false)],
      },
      { target: 'dismissed' },
    ],
  },
});
