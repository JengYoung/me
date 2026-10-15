import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps, usePointerDrag } from "../_shared/react/index";
import type { Ref } from 'react';
import { cropValue } from "./image-cropper.machine";
import type { CropExportOptions, ImageCropperSchema } from "./image-cropper.machine";
import { getCropGeometry } from "./crop-geometry";
import type { CropValue } from "./crop-geometry";
import type { ImageCropperOptions } from "./use-image-cropper";
export type CropControl = 'x' | 'y' | 'zoom' | 'rotation';
export function connectImageCropper(
  machine: MachineApi<ImageCropperSchema>,
  options: ImageCropperOptions & { id: string },
  dom: {
    imageRef: Ref<HTMLImageElement>;
    viewportRef: Ref<HTMLDivElement>;
    readImage(image: HTMLImageElement): void;
    drag: ReturnType<typeof usePointerDrag>;
    exportImage(options?: CropExportOptions): Promise<Blob>;
  },
) {
  const { state, send, getProps, getSnapshot } = machine;
  const image = state.context.src === options.src ? state.context.image : null;
  const value = cropValue(options, { ...state.context, image });
  const geometry = image ? getCropGeometry(image, value, options.aspectRatio, options.maxZoom) : null;
  const disabled = !!options.disabled || !image;
  const data = (part: string) => ({
    'data-scope': 'image-cropper',
    'data-part': part,
    'data-state': state.context.src === options.src ? state.value : 'loading',
    'data-disabled': options.disabled ? '' : undefined,
  });
  const setValue = (next: Partial<CropValue>) => send({ type: 'SET', value: next });
  return {
    value,
    image,
    geometry,
    state: state.context.src === options.src ? state.value : 'loading',
    error: state.context.src === options.src ? state.context.error : null,
    imageKey: options.src,
    setValue,
    reset: () => send({ type: 'RESET' }),
    cancel: () => send({ type: 'CANCEL' }),
    exportImage: dom.exportImage,
    getViewportProps: (user: PartProps<'div'> = {}) =>
      mergeProps<'div'>(user, {
        ...data('viewport'),
        id: options.id,
        ref: dom.viewportRef,
        role: 'group',
        'aria-busy': state.context.src !== options.src || state.value === 'loading' || state.value === 'exporting',
      }),
    getImageProps(user: PartProps<'img'> = {}): PartProps<'img'> {
      return mergeProps<'img'>(user, {
        ...data('image'),
        ref: dom.imageRef,
        src: options.src,
        crossOrigin: options.crossOrigin,
        alt: user.alt ?? '',
        draggable: false,
        onLoad: (event) => dom.readImage(event.currentTarget),
        onError: (event) => send({ type: 'LOAD_ERROR', src: event.currentTarget.getAttribute('src') ?? '' }),
      });
    },
    getSelectionProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        ...data('selection'),
        ...dom.drag,
        role: 'group',
        tabIndex: disabled ? -1 : 0,
        'aria-disabled': disabled,
        'aria-label': user['aria-label'] ?? 'Crop region',
        onKeyDown: (event) => {
          if (disabled || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
          event.preventDefault();
          const current = getProps();
          const context = getSnapshot().context;
          if (!context.image) return;
          const next = getCropGeometry(
            context.image,
            cropValue(current, context),
            current.aspectRatio,
            current.maxZoom,
          );
          const amount = event.shiftKey ? 10 : 1;
          setValue({
            x:
              next.value.x +
              (event.key === 'ArrowRight' ? amount : event.key === 'ArrowLeft' ? -amount : 0) / next.rotated.width,
            y:
              next.value.y +
              (event.key === 'ArrowDown' ? amount : event.key === 'ArrowUp' ? -amount : 0) / next.rotated.height,
          });
        },
      });
    },
    getControlProps(control: CropControl, user: PartProps<'input'> = {}): PartProps<'input'> {
      return mergeProps<'input'>(user, {
        ...data('control'),
        'data-control': control,
        type: 'range',
        min: control === 'zoom' ? 1 : 0,
        max: control === 'zoom' ? (options.maxZoom ?? 10) : control === 'rotation' ? 359 : 1,
        step: control === 'rotation' ? 1 : 0.01,
        value: value[control],
        disabled: disabled || !!user.disabled,
        'aria-label':
          user['aria-label'] ??
          { x: 'Horizontal crop position', y: 'Vertical crop position', zoom: 'Zoom', rotation: 'Rotation' }[control],
        onChange: (event) => {
          if (!user.disabled) {
            setValue({ [control]: event.currentTarget.valueAsNumber });
            event.currentTarget.value = String(cropValue(getProps(), getSnapshot().context)[control]);
          }
        },
      });
    },
  };
}
export type ImageCropperApi = ReturnType<typeof connectImageCropper>;
