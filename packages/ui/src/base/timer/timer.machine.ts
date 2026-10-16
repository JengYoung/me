import { createMachine } from '../_shared/core/index';

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';
export type TimerAction = 'start' | 'pause' | 'resume' | 'reset' | 'restart';
export interface TimerOptions {
  mode?: 'countdown' | 'countup';
  /** Milliseconds. Changing mode or duration resets to idle. */
  duration?: number;
  interval?: number;
  /** Initial activation after commit; changing this option does not restart. */
  autoStart?: boolean;
  onComplete?: () => void;
}
export interface TimerSchema {
  state: TimerState;
  props: TimerOptions & { now: () => number };
  context: { elapsed: number; anchor: number | null; activated: boolean };
  event:
    | { [Type in 'START' | 'PAUSE' | 'RESUME' | 'RESTART' | 'TICK']: { type: Type; now: number } }[
        | 'START'
        | 'PAUSE'
        | 'RESUME'
        | 'RESTART'
        | 'TICK']
    | { type: 'RESET' }
    | { type: 'WAKE' }
    | { type: 'ACTIVATE' };
}

export function validateTimer(options: TimerOptions) {
  if (!Number.isFinite(options.duration ?? 60_000) || (options.duration ?? 60_000) < 0)
    throw new Error('Timer duration must be a finite, non-negative number of milliseconds.');
  if (
    !Number.isFinite(options.interval ?? 1000) ||
    (options.interval ?? 1000) < 1 ||
    (options.interval ?? 1000) > 2_147_483_647
  )
    throw new Error('Timer interval must be between 1 and 2147483647 milliseconds.');
}
export function elapsedAt(context: TimerSchema['context'], now: number, props: TimerOptions) {
  const elapsed = Math.max(context.elapsed, context.anchor === null ? context.elapsed : now - context.anchor);
  return props.mode === 'countup' ? elapsed : Math.min(props.duration ?? 60_000, elapsed);
}
const isZero = (props: TimerOptions) => props.mode !== 'countup' && (props.duration ?? 60_000) === 0;

export const timerMachine = createMachine<TimerSchema>({
  initial: 'idle',
  context: () => ({ elapsed: 0, anchor: null, activated: false }),
  effects: [({ send }) => send({ type: 'ACTIVATE' })],
  onProps: [
    {
      guard: ({ props, event }) =>
        (props.mode ?? 'countdown') !== (event.previous.mode ?? 'countdown') ||
        (props.duration ?? 60_000) !== (event.previous.duration ?? 60_000),
      target: 'idle',
      assign: () => ({ elapsed: 0, anchor: null }),
    },
    {
      guard: ({ value, props, event }) => value === 'running' && props.interval !== event.previous.interval,
      target: 'running',
      reenter: true,
    },
  ],
  on: {
    ACTIVATE: {
      guard: ({ context }) => !context.activated,
      assign: () => ({ activated: true }),
      actions: [
        ({ props, send }) => {
          if (props.autoStart) send({ type: 'START', now: props.now() });
        },
      ],
    },
    RESET: { target: 'idle', assign: () => ({ elapsed: 0, anchor: null }) },
    RESTART: [
      {
        guard: ({ props }) => isZero(props),
        target: 'completed',
        assign: () => ({ elapsed: 0, anchor: null }),
        actions: [({ props }) => props.onComplete?.()],
      },
      { target: 'running', reenter: true, assign: ({ event }) => ({ elapsed: 0, anchor: event.now }) },
    ],
  },
  states: {
    idle: {
      on: {
        START: [
          { guard: ({ props }) => isZero(props), target: 'completed', actions: [({ props }) => props.onComplete?.()] },
          { target: 'running', assign: ({ event }) => ({ anchor: event.now, elapsed: 0 }) },
        ],
      },
    },
    running: {
      effects: [
        ({ props, context, schedule }) => {
          const remaining =
            props.mode === 'countup' ? Infinity : (props.duration ?? 60_000) - elapsedAt(context, props.now(), props);
          schedule({ type: 'WAKE' }, Math.min(props.interval ?? 1000, Math.max(0, remaining)));
        },
      ],
      on: {
        WAKE: { actions: [({ props, send }) => send({ type: 'TICK', now: props.now() })] },
        TICK: [
          {
            guard: ({ props, context, event }) =>
              props.mode !== 'countup' && elapsedAt(context, event.now, props) >= (props.duration ?? 60_000),
            target: 'completed',
            assign: ({ props }) => ({ elapsed: props.duration ?? 60_000, anchor: null }),
            actions: [({ props }) => props.onComplete?.()],
          },
          {
            target: 'running',
            reenter: true,
            assign: ({ context, props, event }) => ({ elapsed: elapsedAt(context, event.now, props) }),
          },
        ],
        PAUSE: [
          {
            guard: ({ props, context, event }) =>
              props.mode !== 'countup' && elapsedAt(context, event.now, props) >= (props.duration ?? 60_000),
            target: 'completed',
            assign: ({ props }) => ({ elapsed: props.duration ?? 60_000, anchor: null }),
            actions: [({ props }) => props.onComplete?.()],
          },
          {
            target: 'paused',
            assign: ({ context, props, event }) => ({ elapsed: elapsedAt(context, event.now, props), anchor: null }),
          },
        ],
      },
    },
    paused: {
      on: { RESUME: { target: 'running', assign: ({ context, event }) => ({ anchor: event.now - context.elapsed }) } },
    },
    completed: {},
  },
});
