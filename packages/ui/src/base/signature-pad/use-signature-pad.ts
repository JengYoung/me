'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useMachine, usePointerDrag, useStableId } from "../_shared/react/index";
import { normalizeSignature, signaturePadMachine } from "./signature-pad.machine";
import type { SignatureExportOptions, SignaturePadMachineOptions } from "./signature-pad.machine";
import { renderSignature, signatureExportOptions } from "./signature-renderer";
import type { SignatureRenderer } from "./signature-renderer";
import { connectSignaturePad } from "./signature-pad.connect";
export interface SignaturePadOptions extends SignaturePadMachineOptions {
  id?: string;
  renderer?: SignatureRenderer;
}
export function useSignaturePad(options: SignaturePadOptions = {}) {
  if (options.value) normalizeSignature(options.value);
  const [controlled] = useState(options.value !== undefined);
  const pending = useRef<{ resolve(value: Blob): void; reject(error: unknown): void } | null>(null);
  const pointerId = useRef<number | null>(null);
  const capture = useRef<{ element: HTMLDivElement; id: number } | null>(null);
  const id = useStableId('iris-signature-pad', options.id);
  const service = useMachine(signaturePadMachine, {
    props: {
      ...options,
      performExport: async (value, settings, signal) => {
        const request = pending.current;
        pending.current = null;
        const abort = () => request?.reject(signal.reason);
        signal.addEventListener('abort', abort, { once: true });
        try {
          const result = await (options.renderer ?? renderSignature)(value, {
            ...signatureExportOptions(settings),
            signal,
          });
          signal.throwIfAborted();
          request?.resolve(result);
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
    if (service.state.value === 'drawing') return;
    const current = capture.current;
    capture.current = null;
    pointerId.current = null;
    if (current?.element.hasPointerCapture?.(current.id)) current.element.releasePointerCapture(current.id);
  }, [service.state.value]);
  const point = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      pressure: event.pressure || 0.5,
      time: event.timeStamp,
    };
  };
  const drag = usePointerDrag({
    disabled: options.disabled,
    onStart: (event) => {
      const value = point(event);
      if (!value) return false;
      pointerId.current = event.pointerId;
      capture.current = { element: event.currentTarget, id: event.pointerId };
      event.currentTarget.focus({ preventScroll: true });
      send({ type: 'START', point: value });
      return true;
    },
    onMove: (event) => {
      const value = point(event);
      if (value) send({ type: 'MOVE', point: value });
    },
    onEnd: () => {
      pointerId.current = null;
      capture.current = null;
      send({ type: 'END' });
    },
  });
  const exportImage = (settings: SignatureExportOptions = {}): Promise<Blob> => {
    if (getProps().disabled || getSnapshot().status !== 'active')
      return Promise.reject(new Error('Signature Pad is inactive.'));
    try {
      signatureExportOptions(settings);
    } catch (error) {
      return Promise.reject(error);
    }
    return new Promise((resolve, reject) => {
      pending.current = { resolve, reject };
      send({ type: 'EXPORT', options: settings });
    });
  };
  if (controlled !== (options.value !== undefined)) throw new Error('Signature Pad cannot switch control modes.');
  // connect stores pointer/export callbacks; ref access only occurs when an event invokes them.
  /* oxlint-disable react/refs */
  return connectSignaturePad(
    service,
    { ...options, id },
    {
      ...drag,
      onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
        // A released mouse can be observed before pointerup. Commit the stroke
        // before drag releases capture and can synchronously emit lostpointercapture.
        if (pointerId.current === event.pointerId && event.pointerType === 'mouse' && event.buttons === 0) {
          pointerId.current = null;
          send({ type: 'END' });
        }
        drag.onPointerMove(event);
      },
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
        if (pointerId.current === event.pointerId) {
          pointerId.current = null;
          send({ type: 'END' });
        }
        drag.onPointerUp(event);
      },
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) => {
        if (pointerId.current === event.pointerId) {
          pointerId.current = null;
          send({ type: 'CANCEL' });
        }
        drag.onPointerCancel(event);
      },
      onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => {
        if (pointerId.current === event.pointerId) {
          pointerId.current = null;
          // Mouse release can deliver lostpointercapture before pointerup.
          // A released mouse completes the stroke; capture loss while pressed cancels it.
          send({ type: event.pointerType === 'mouse' && event.buttons === 0 ? 'END' : 'CANCEL' });
        }
        drag.onLostPointerCapture(event);
      },
    },
    exportImage,
  );
  /* oxlint-enable react/refs */
}
export type { SignaturePadApi } from "./signature-pad.connect";
