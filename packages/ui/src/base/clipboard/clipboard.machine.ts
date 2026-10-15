import { createMachine } from '../_shared/core/index';

export type ClipboardState = 'idle' | 'pending' | 'success' | 'error';
export interface ClipboardFailure {
  reason: 'unavailable' | 'denied' | 'failed';
  cause?: unknown;
}
export interface ClipboardOptions {
  value: string;
  disabled?: boolean;
  /** Milliseconds, 0 keeps feedback until copy/reset/value change. */
  feedbackDuration?: number;
  onSuccess?: (value: string) => void;
  onError?: (error: ClipboardFailure) => void;
  messages?: { success?: string; error?: string };
}
export interface ClipboardSchema {
  state: ClipboardState;
  props: ClipboardOptions & { writeText: (value: string) => Promise<void> };
  context: { copiedValue: string | null; error: ClipboardFailure | null };
  event: { type: 'COPY' } | { type: 'RESET' } | { type: 'SUCCESS' } | { type: 'ERROR'; error: ClipboardFailure };
}
export function validateClipboard(options: ClipboardOptions) {
  const duration = options.feedbackDuration ?? 2000;
  if (!Number.isFinite(duration) || duration < 0 || duration > 2_147_483_647)
    throw new Error('Clipboard feedbackDuration must be between 0 and 2147483647 milliseconds.');
}
export const clipboardMachine = createMachine<ClipboardSchema>({
  initial: 'idle',
  context: () => ({ copiedValue: null, error: null }),
  onProps: {
    guard: ({ props, event }) => props.value !== event.previous.value || (!!props.disabled && !event.previous.disabled),
    target: 'idle',
    assign: () => ({ copiedValue: null, error: null }),
  },
  on: {
    COPY: {
      guard: ({ props }) => !props.disabled,
      target: 'pending',
      reenter: true,
      assign: ({ props }) => ({ copiedValue: props.value, error: null }),
    },
    RESET: { target: 'idle', assign: () => ({ copiedValue: null, error: null }) },
  },
  states: {
    idle: {},
    pending: {
      effects: [
        ({ props, context, send }) => {
          // Runs synchronously in the initiating event, preserving browser user activation.
          void props.writeText(context.copiedValue!).then(
            () => send({ type: 'SUCCESS' }),
            (error: ClipboardFailure) => send({ type: 'ERROR', error }),
          );
        },
      ],
      on: {
        SUCCESS: { target: 'success', actions: [({ props, context }) => props.onSuccess?.(context.copiedValue!)] },
        ERROR: {
          target: 'error',
          assign: ({ event }) => ({ error: event.error }),
          actions: [({ props, event }) => props.onError?.(event.error)],
        },
      },
    },
    success: {
      effects: [
        ({ props, schedule }) => {
          if ((props.feedbackDuration ?? 2000) > 0) schedule({ type: 'RESET' }, props.feedbackDuration ?? 2000);
        },
      ],
    },
    error: {
      effects: [
        ({ props, schedule }) => {
          if ((props.feedbackDuration ?? 2000) > 0) schedule({ type: 'RESET' }, props.feedbackDuration ?? 2000);
        },
      ],
    },
  },
});
