import { createMachine } from '../_shared/core/index';
import type { MachineArgs } from '../_shared/core/index';
import { defaultCropValue, getCropGeometry, normalizeCropValue } from './crop-geometry';
import type { CropValue, ImageSize } from './crop-geometry';
export interface CropExportOptions {
  width?: number;
  height?: number;
}
export interface ImageCropperMachineOptions {
  src: string;
  value?: CropValue;
  defaultValue?: CropValue;
  onValueChange?: (value: CropValue) => void;
  aspectRatio?: number;
  maxZoom?: number;
  disabled?: boolean;
  onExportError?: (error: unknown) => void;
}
export interface ImageCropperSchema {
  state: 'loading' | 'ready' | 'dragging' | 'exporting' | 'success' | 'error';
  props: ImageCropperMachineOptions & {
    performExport(image: ImageSize, value: CropValue, options: CropExportOptions, signal: AbortSignal): Promise<void>;
  };
  context: {
    src: string;
    image: ImageSize | null;
    value: CropValue;
    initial: CropValue;
    requested: CropValue;
    notify: boolean;
    error: unknown;
    exportOptions: CropExportOptions;
  };
  event:
    | { type: 'LOAD'; src: string; image: ImageSize }
    | { type: 'LOAD_ERROR'; src: string }
    | { type: 'SET'; value: Partial<CropValue> }
    | { type: 'START' }
    | { type: 'END' }
    | { type: 'CANCEL' }
    | { type: 'RESET' }
    | { type: 'EXPORT'; options: CropExportOptions }
    | { type: 'SUCCESS' }
    | { type: 'ERROR'; error: unknown };
}
export function cropValue(props: ImageCropperMachineOptions, context: ImageCropperSchema['context']) {
  const value = props.value ?? context.value;
  return context.image
    ? getCropGeometry(context.image, value, props.aspectRatio, props.maxZoom).value
    : normalizeCropValue(value, props.maxZoom);
}
const editable = ({ props, context }: MachineArgs<ImageCropperSchema>) =>
  !props.disabled && context.image !== null && context.src === props.src;
function request(props: ImageCropperMachineOptions, context: ImageCropperSchema['context'], patch: Partial<CropValue>) {
  const current = cropValue(props, context);
  const next = getCropGeometry(context.image!, { ...current, ...patch }, props.aspectRatio, props.maxZoom).value;
  return {
    value: props.value === undefined ? next : context.value,
    requested: next,
    notify: Object.keys(next).some((key) => next[key as keyof CropValue] !== current[key as keyof CropValue]),
    error: null,
  };
}
const notify = ({ props, context }: MachineArgs<ImageCropperSchema>) => {
  if (context.notify) props.onValueChange?.(context.requested);
};
export const imageCropperMachine = createMachine<ImageCropperSchema>({
  initial: 'loading',
  context: ({ props }) => {
    const value = normalizeCropValue(props.defaultValue ?? defaultCropValue, props.maxZoom);
    return {
      src: props.src,
      image: null,
      value,
      initial: value,
      requested: value,
      notify: false,
      error: null,
      exportOptions: {},
    };
  },
  onProps: [
    {
      guard: ({ props, event }) => props.src !== event.previous.src,
      target: 'loading',
      assign: ({ props, context }) => ({ src: props.src, image: null, value: context.initial, error: null }),
    },
    {
      guard: ({ props, context, event }) =>
        context.image !== null &&
        ((props.value !== event.previous.value &&
          (!props.value ||
            (Object.keys(context.requested) as (keyof CropValue)[]).some(
              (key) => props.value![key] !== context.requested[key],
            ))) ||
          props.aspectRatio !== event.previous.aspectRatio ||
          props.maxZoom !== event.previous.maxZoom ||
          props.disabled !== event.previous.disabled),
      target: 'ready',
      assign: () => ({ error: null }),
    },
  ],
  on: {
    LOAD: {
      guard: ({ props, event }) => props.src === event.src,
      target: 'ready',
      assign: ({ event }) => ({ image: event.image, src: event.src, error: null }),
    },
    LOAD_ERROR: {
      guard: ({ props, event }) => props.src === event.src,
      target: 'error',
      assign: () => ({ image: null, error: 'Image failed to load.' }),
    },
    SET: {
      guard: editable,
      assign: ({ props, context, event }) => request(props, context, event.value),
      actions: [notify],
    },
    START: { guard: editable, target: 'dragging' },
    END: { guard: editable, target: 'ready' },
    CANCEL: { guard: ({ context }) => context.image !== null, target: 'ready', assign: () => ({ error: null }) },
    RESET: {
      guard: editable,
      target: 'ready',
      assign: ({ props, context }) => request(props, context, context.initial),
      actions: [notify],
    },
    EXPORT: {
      guard: editable,
      target: 'exporting',
      reenter: true,
      assign: ({ event }) => ({ exportOptions: event.options, error: null }),
    },
  },
  states: {
    loading: {},
    ready: {},
    dragging: {},
    success: {},
    error: {},
    exporting: {
      effects: [
        ({ props, context, signal, send }) => {
          void props.performExport(context.image!, cropValue(props, context), context.exportOptions, signal).then(
            () => send({ type: 'SUCCESS' }),
            (error: unknown) => send({ type: 'ERROR', error }),
          );
        },
      ],
      on: {
        SET: {
          guard: editable,
          target: 'ready',
          assign: ({ props, context, event }) => request(props, context, event.value),
          actions: [notify],
        },
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
