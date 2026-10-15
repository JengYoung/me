'use client';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useMachine, usePointerDrag, useStableId } from "../_shared/react/index";
import { cropValue, imageCropperMachine } from "./image-cropper.machine";
import type { CropExportOptions, ImageCropperMachineOptions } from "./image-cropper.machine";
import { getCropGeometry, normalizeCropValue } from "./crop-geometry";
import type { CropValue } from "./crop-geometry";
import { cropExportSize, exportCrop } from "./crop-export";
import type { CropExportAdapter } from "./crop-export";
import { connectImageCropper } from "./image-cropper.connect";
export interface ImageCropperOptions extends ImageCropperMachineOptions {
  id?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  exportAdapter?: CropExportAdapter;
}
export function useImageCropper(options: ImageCropperOptions) {
  if (options.aspectRatio !== undefined && (!Number.isFinite(options.aspectRatio) || options.aspectRatio <= 0))
    throw new Error('aspectRatio must be positive.');
  normalizeCropValue(
    options.value ?? options.defaultValue ?? { x: 0.5, y: 0.5, zoom: 1, rotation: 0 },
    options.maxZoom,
  );
  const [controlled] = useState(options.value !== undefined);
  const id = useStableId('iris-image-cropper', options.id);
  const pending = useRef<{ resolve(blob: Blob): void; reject(error: unknown): void } | null>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const viewport = useRef<HTMLDivElement | null>(null);
  const origin = useRef<{ x: number; y: number; value: CropValue } | null>(null);
  const capture = useRef<{ element: HTMLDivElement; id: number } | null>(null);
  const service = useMachine(imageCropperMachine, {
    props: {
      ...options,
      performExport: async (size, value, settings, signal) => {
        const request = pending.current;
        pending.current = null;
        const abort = () => request?.reject(signal.reason);
        signal.addEventListener('abort', abort, { once: true });
        try {
          const geometry = getCropGeometry(size, value, options.aspectRatio, options.maxZoom);
          const blob = await (options.exportAdapter ?? exportCrop)({
            src: options.src,
            image: size,
            geometry,
            ...cropExportSize(settings, geometry),
            crossOrigin: options.crossOrigin,
            signal,
          });
          signal.throwIfAborted();
          request?.resolve(blob);
        } catch (error) {
          request?.reject(error);
          throw error;
        } finally {
          signal.removeEventListener('abort', abort);
        }
      },
    },
  });
  const { send, getProps, getSnapshot } = service;
  useLayoutEffect(() => {
    if (service.state.value === 'dragging') return;
    const current = capture.current;
    capture.current = null;
    origin.current = null;
    if (current?.element.hasPointerCapture?.(current.id)) current.element.releasePointerCapture(current.id);
  }, [service.state.value]);
  const readImage = useCallback(
    (element: HTMLImageElement) => {
      const src = element.getAttribute('src') ?? '';
      if (src !== getProps().src || !element.complete) return;
      if (element.naturalWidth > 0 && element.naturalHeight > 0)
        send({ type: 'LOAD', src, image: { width: element.naturalWidth, height: element.naturalHeight } });
      else send({ type: 'LOAD_ERROR', src });
    },
    [getProps, send],
  );
  useLayoutEffect(() => {
    if (image.current?.complete) readImage(image.current);
  }, [options.src, readImage]);
  const drag = usePointerDrag({
    disabled: options.disabled || service.state.context.src !== options.src || !service.state.context.image,
    onStart: (event) => {
      if (!viewport.current || !getSnapshot().context.image) return false;
      capture.current = { element: event.currentTarget, id: event.pointerId };
      origin.current = { x: event.clientX, y: event.clientY, value: cropValue(getProps(), getSnapshot().context) };
      event.currentTarget.focus({ preventScroll: true });
      send({ type: 'START' });
      return true;
    },
    onMove: (event) => {
      const start = origin.current;
      const rect = viewport.current?.getBoundingClientRect();
      if (!start || !rect?.width || !rect.height) return;
      send({
        type: 'SET',
        value: {
          x: start.value.x + (event.clientX - start.x) / rect.width,
          y: start.value.y + (event.clientY - start.y) / rect.height,
        },
      });
    },
    onEnd: () => {
      capture.current = null;
      origin.current = null;
      send({ type: 'END' });
    },
  });
  const exportImage = (settings: CropExportOptions = {}): Promise<Blob> => {
    const current = getProps();
    const snapshot = getSnapshot();
    if (
      current.disabled ||
      snapshot.status !== 'active' ||
      !snapshot.context.image ||
      snapshot.context.src !== current.src
    )
      return Promise.reject(new Error('Image Cropper is not ready.'));
    try {
      cropExportSize(
        settings,
        getCropGeometry(
          snapshot.context.image,
          cropValue(current, snapshot.context),
          current.aspectRatio,
          current.maxZoom,
        ),
      );
    } catch (error) {
      return Promise.reject(error);
    }
    return new Promise((resolve, reject) => {
      pending.current = { resolve, reject };
      send({ type: 'EXPORT', options: settings });
    });
  };
  if (controlled !== (options.value !== undefined)) throw new Error('Image Cropper cannot switch control modes.');
  // connect passes refs and deferred DOM commands into prop getters without reading them.
  /* oxlint-disable react/refs */
  return connectImageCropper(
    service,
    { ...options, id },
    {
      imageRef: image,
      viewportRef: viewport,
      readImage,
      drag: {
        ...drag,
        onPointerCancel: (event: PointerEvent<HTMLDivElement>) => {
          drag.onPointerCancel(event);
        },
      },
      exportImage,
    },
  );
  /* oxlint-enable react/refs */
}
export type { ImageCropperApi } from "./image-cropper.connect";
