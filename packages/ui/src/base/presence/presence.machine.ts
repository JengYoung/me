import { createMachine } from '../_shared/core/index';

export type PresenceState = 'unmounted' | 'entering' | 'mounted' | 'exiting';

export interface PresenceOptions {
  /** The owner controls visibility; Presence only owns the mounting lifecycle. */
  present: boolean;
  /** Remove immediately on exit, without waiting for motion. */
  immediate?: boolean;
  /** Retain the DOM even in the unmounted state. Does not hide or disable it. */
  forceMount?: boolean;
  /** Upper bound in milliseconds for missing completion, paused or infinite motion. Default: 10,000. */
  maxDuration?: number;
  onExitComplete?: () => void;
}

export interface PresenceSchema {
  state: PresenceState;
  props: PresenceOptions;
  context: { generation: number };
  event: { type: 'COMPLETE'; generation: number };
}

/** Also projects the next DOM state before the adapter commits a prop change. */
export function presenceState(value: PresenceState, props: PresenceOptions): PresenceState {
  if (props.present) return value === 'unmounted' || value === 'exiting' ? 'entering' : value;
  if (props.immediate) return 'unmounted';
  return value === 'mounted' || value === 'entering' ? 'exiting' : value;
}

export const presenceMachine = createMachine<PresenceSchema>({
  initial: ({ props }) => (props.present ? 'entering' : 'unmounted'),
  context: () => ({ generation: 0 }),
  onProps: [
    {
      guard: ({ value, props }) => value !== 'unmounted' && presenceState(value, props) === 'unmounted',
      target: 'unmounted',
      assign: ({ context }) => ({ generation: context.generation + 1 }),
      actions: [({ props }) => props.onExitComplete?.()],
    },
    {
      guard: ({ value, props }) => value !== 'entering' && presenceState(value, props) === 'entering',
      target: 'entering',
      assign: ({ context }) => ({ generation: context.generation + 1 }),
    },
    {
      guard: ({ value, props }) => value !== 'exiting' && presenceState(value, props) === 'exiting',
      target: 'exiting',
      assign: ({ context }) => ({ generation: context.generation + 1 }),
    },
  ],
  states: {
    unmounted: {},
    mounted: {},
    entering: {
      on: {
        COMPLETE: {
          guard: ({ props, context, event }) => props.present && context.generation === event.generation,
          target: 'mounted',
        },
      },
    },
    exiting: {
      on: {
        COMPLETE: {
          guard: ({ props, context, event }) => !props.present && context.generation === event.generation,
          target: 'unmounted',
          actions: [({ props }) => props.onExitComplete?.()],
        },
      },
    },
  },
});
