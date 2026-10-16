'use client';

import { useCallback, useRef } from 'react';
import type { PointerEvent } from 'react';
import { useCommitEffect } from './use-commit-effect';

export interface PointerDragOptions {
  disabled?: boolean;
  onStart(event: PointerEvent<HTMLDivElement>): boolean;
  onMove(event: PointerEvent<HTMLDivElement>): void;
  onEnd(): void;
}

/** One captured pointer per instance; no document listeners or render-time DOM reads. */
export function usePointerDrag(options: PointerDragOptions) {
  const latest = useRef(options);
  const active = useRef<{ element: HTMLDivElement; id: number } | null>(null);
  const release = useCallback(() => {
    const current = active.current;
    active.current = null;
    if (current?.element.hasPointerCapture?.(current.id)) current.element.releasePointerCapture(current.id);
  }, []);
  useCommitEffect(() => release, [release]);
  useCommitEffect(() => {
    latest.current = options;
    if (options.disabled) release();
  }, [options, release]);
  const ref = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) return;
      return () => {
        // A composed user ref may rebind on every render. Only end the session
        // when its element actually leaves the DOM; hook unmount releases synchronously.
        queueMicrotask(() => {
          if (active.current?.element === element && !element.isConnected) {
            release();
            latest.current.onEnd();
          }
        });
      };
    },
    [release],
  );
  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (latest.current.disabled || active.current || event.button !== 0 || event.isPrimary === false) return;
    if (!latest.current.onStart(event)) return;
    event.preventDefault();
    active.current = { element: event.currentTarget, id: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);
  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (active.current?.id !== event.pointerId || latest.current.disabled) return;
      // A mouse released outside the browser may not deliver pointerup (Firefox).
      if (event.pointerType === 'mouse' && event.buttons === 0) {
        release();
        latest.current.onEnd();
        return;
      }
      latest.current.onMove(event);
    },
    [release],
  );
  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (active.current?.id !== event.pointerId) return;
      release();
      latest.current.onEnd();
    },
    [release],
  );
  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onLostPointerCapture: onPointerUp,
  };
}

/** Track coordinates use bottom-to-top for vertical sliders and logical inline direction for horizontal ones. */
export function pointerRatio(
  event: PointerEvent<HTMLDivElement>,
  orientation: 'horizontal' | 'vertical',
  dir: 'ltr' | 'rtl',
) {
  const rect = event.currentTarget.getBoundingClientRect();
  const length = orientation === 'vertical' ? rect.height : rect.width;
  if (length <= 0) return undefined;
  const raw =
    orientation === 'vertical' ? (rect.bottom - event.clientY) / length : (event.clientX - rect.left) / length;
  return Math.min(1, Math.max(0, orientation === 'horizontal' && dir === 'rtl' ? 1 - raw : raw));
}
