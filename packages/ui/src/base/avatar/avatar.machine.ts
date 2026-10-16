import { createMachine } from '../_shared/core/index';
export type AvatarState = 'idle' | 'loading' | 'loaded' | 'error';
export interface AvatarOptions {
  src?: string;
  /** Accessible name on Root. Empty means decorative. */
  name: string;
  fallbackDelay?: number;
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  referrerPolicy?:
    | ''
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
  onStatusChange?: (status: AvatarState) => void;
}
export interface AvatarSchema {
  state: AvatarState;
  props: AvatarOptions & { load: (options: AvatarOptions, done: (loaded: boolean) => void) => () => void };
  context: { fallback: boolean; revision: number };
  event: { type: 'LOADED' } | { type: 'ERROR' } | { type: 'FALLBACK' } | { type: 'RETRY' };
}
export function validateAvatar(options: AvatarOptions) {
  const delay = options.fallbackDelay ?? 0;
  if (!Number.isFinite(delay) || delay < 0 || delay > 2_147_483_647)
    throw new Error('Avatar fallbackDelay must be between 0 and 2147483647 milliseconds.');
}
export function avatarSourceChanged(props: AvatarOptions, previous: AvatarOptions) {
  return (
    props.src !== previous.src ||
    props.crossOrigin !== previous.crossOrigin ||
    props.referrerPolicy !== previous.referrerPolicy
  );
}
export const avatarMachine = createMachine<AvatarSchema>({
  initial: ({ props }) => (props.src ? 'loading' : 'idle'),
  context: ({ props }) => ({ fallback: !props.src || !props.fallbackDelay, revision: 0 }),
  onProps: [
    {
      guard: ({ props, event }) => avatarSourceChanged(props, event.previous) && !props.src,
      target: 'idle',
      assign: ({ context }) => ({ fallback: true, revision: context.revision + 1 }),
      actions: [({ props }) => props.onStatusChange?.('idle')],
    },
    {
      guard: ({ props, event, value }) =>
        !!props.src &&
        (avatarSourceChanged(props, event.previous) ||
          (value === 'loading' && props.fallbackDelay !== event.previous.fallbackDelay)),
      target: 'loading',
      reenter: true,
      assign: ({ context, props }) => ({ fallback: !props.fallbackDelay, revision: context.revision + 1 }),
      actions: [({ props }) => props.onStatusChange?.('loading')],
    },
  ],
  on: {
    RETRY: {
      guard: ({ props }) => !!props.src,
      target: 'loading',
      reenter: true,
      assign: ({ context, props }) => ({ fallback: !props.fallbackDelay, revision: context.revision + 1 }),
      actions: [({ props }) => props.onStatusChange?.('loading')],
    },
  },
  states: {
    idle: {},
    loading: {
      effects: [
        ({ props, send, schedule }) => {
          if (props.fallbackDelay) schedule({ type: 'FALLBACK' }, props.fallbackDelay);
          return props.load(props, (loaded) => send({ type: loaded ? 'LOADED' : 'ERROR' }));
        },
      ],
      on: {
        FALLBACK: { assign: () => ({ fallback: true }) },
        LOADED: {
          target: 'loaded',
          assign: () => ({ fallback: false }),
          actions: [({ props }) => props.onStatusChange?.('loaded')],
        },
        ERROR: {
          target: 'error',
          assign: () => ({ fallback: true }),
          actions: [({ props }) => props.onStatusChange?.('error')],
        },
      },
    },
    loaded: {},
    error: {},
  },
});
