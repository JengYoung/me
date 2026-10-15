import { createMachine } from "../_shared/core/index";
import type { MachineArgs } from "../_shared/core/index";

/** Coordinates and pressure are normalized to [0,1]; time is the pointer event timestamp. */
export interface SignaturePoint {
  x: number;
  y: number;
  pressure: number;
  time: number;
}
export type SignatureStroke = readonly SignaturePoint[];
export type SignatureValue = readonly SignatureStroke[];
export interface SignatureExportOptions {
  format?: 'svg' | 'png' | 'json';
  width?: number;
  height?: number;
}
export interface SignaturePadMachineOptions {
  value?: SignatureValue;
  defaultValue?: SignatureValue;
  onValueChange?: (value: SignatureValue) => void;
  disabled?: boolean;
  onExportError?: (error: unknown) => void;
}
export function normalizeSignaturePoint(point: SignaturePoint): SignaturePoint {
  if (![point.x, point.y, point.pressure, point.time].every(Number.isFinite))
    throw new Error('Invalid signature point.');
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  return { x: clamp(point.x), y: clamp(point.y), pressure: clamp(point.pressure), time: point.time };
}
export function normalizeSignature(value: SignatureValue): SignatureValue {
  return value.filter((stroke) => stroke.length).map((stroke) => stroke.map(normalizeSignaturePoint));
}
export interface SignaturePadSchema {
  state: 'idle' | 'drawing' | 'exporting' | 'success' | 'error';
  props: SignaturePadMachineOptions & {
    performExport(value: SignatureValue, options: SignatureExportOptions, signal: AbortSignal): Promise<void>;
  };
  context: { value: SignatureValue; draft: SignatureStroke; error: unknown; exportOptions: SignatureExportOptions };
  event:
    | { type: 'START'; point: SignaturePoint }
    | { type: 'MOVE'; point: SignaturePoint }
    | { type: 'END' }
    | { type: 'CANCEL' }
    | { type: 'CLEAR' }
    | { type: 'SUCCESS' }
    | { type: 'SET'; value: SignatureValue }
    | { type: 'EXPORT'; options: SignatureExportOptions }
    | { type: 'ERROR'; error: unknown };
}
export const signatureValue = (props: SignaturePadMachineOptions, context: SignaturePadSchema['context']) =>
  props.value ?? context.value;
const editable = ({ props }: MachineArgs<SignaturePadSchema>) => !props.disabled;
export const signaturePadMachine = createMachine<SignaturePadSchema>({
  initial: 'idle',
  context: ({ props }) => ({
    value: normalizeSignature(props.defaultValue ?? []),
    draft: [],
    error: null,
    exportOptions: {},
  }),
  onProps: {
    guard: ({ props, event }) => (!!props.disabled && !event.previous.disabled) || props.value !== event.previous.value,
    target: 'idle',
    assign: () => ({ draft: [], error: null }),
  },
  on: {
    START: {
      guard: editable,
      target: 'drawing',
      assign: ({ event }) => ({ draft: [normalizeSignaturePoint(event.point)], error: null }),
    },
    CANCEL: { target: 'idle', assign: () => ({ draft: [], error: null }) },
    CLEAR: {
      guard: editable,
      target: 'idle',
      assign: ({ props, context }) => ({
        value: props.value === undefined ? [] : context.value,
        draft: [],
        error: null,
      }),
      actions: [({ props }) => props.onValueChange?.([])],
    },
    SET: {
      guard: editable,
      target: 'idle',
      assign: ({ props, context, event }) => ({
        value: props.value === undefined ? normalizeSignature(event.value) : context.value,
        draft: [],
        error: null,
      }),
      actions: [({ props, event }) => props.onValueChange?.(normalizeSignature(event.value))],
    },
    EXPORT: {
      guard: editable,
      target: 'exporting',
      reenter: true,
      assign: ({ event }) => ({ exportOptions: event.options, draft: [], error: null }),
    },
  },
  states: {
    idle: {},
    success: {},
    error: {},
    drawing: {
      on: {
        MOVE: {
          guard: editable,
          assign: ({ context, event }) => ({ draft: [...context.draft, normalizeSignaturePoint(event.point)] }),
        },
        END: {
          target: 'idle',
          actions: [
            ({ props, context, send }) =>
              send({ type: 'SET', value: [...signatureValue(props, context), context.draft] }),
          ],
        },
      },
    },
    exporting: {
      effects: [
        ({ props, context, signal, send }) => {
          void props.performExport(signatureValue(props, context), context.exportOptions, signal).then(
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
