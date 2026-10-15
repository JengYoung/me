import { createMachine } from "../_shared/core/index";
export interface QrExportTask {
  format: 'svg' | 'png';
  size: number;
  filename?: string;
}
export interface QrCodeSchema {
  state: 'idle' | 'exporting' | 'success' | 'error';
  props: {
    key: string;
    encoder: unknown;
    disabled?: boolean;
    valid: boolean;
    performExport(options: QrExportTask, signal: AbortSignal): Promise<void>;
    onExportError?: (error: unknown) => void;
  };
  context: { options: QrExportTask; error: unknown };
  event:
    | { type: 'EXPORT'; options: QrExportTask }
    | { type: 'CANCEL' }
    | { type: 'SUCCESS' }
    | { type: 'ERROR'; error: unknown };
}
export const qrCodeMachine = createMachine<QrCodeSchema>({
  initial: 'idle',
  context: () => ({ options: { format: 'svg', size: 256 }, error: null }),
  onProps: {
    guard: ({ props, event }) =>
      props.key !== event.previous.key || props.encoder !== event.previous.encoder || !!props.disabled || !props.valid,
    target: 'idle',
    assign: () => ({ error: null }),
  },
  on: {
    EXPORT: {
      guard: ({ props }) => !props.disabled && props.valid,
      target: 'exporting',
      reenter: true,
      assign: ({ event }) => ({ options: event.options, error: null }),
    },
    CANCEL: { target: 'idle', assign: () => ({ error: null }) },
  },
  states: {
    idle: {},
    success: {},
    error: {},
    exporting: {
      effects: [
        ({ props, context, signal, send }) => {
          void props.performExport(context.options, signal).then(
            () => send({ type: 'SUCCESS' }),
            (error: unknown) => send({ type: 'ERROR', error }),
          );
        },
      ],
      on: {
        SUCCESS: { target: 'success' },
        ERROR: {
          target: 'error',
          assign: ({ event }) => ({ error: event.error }),
          actions: [({ props, event }) => props.onExportError?.(event.error)],
        },
      },
    },
  },
});
