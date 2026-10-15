'use client';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { PointerEvent } from 'react';
import { settleDrawer } from "./drawer.machine";
const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
export type DrawerSide = 'top' | 'bottom' | 'left' | 'right';
interface DragOptions {
  open: boolean;
  side: DrawerSide;
  content: HTMLDivElement | null;
  snapPoint: number;
  points: readonly number[];
  closeThreshold: number;
  velocityThreshold: number;
  dismissible: boolean;
  onDrag(value: number): void;
  onCancel(): void;
  onSnap(value: number): void;
  onClose(): void;
}
interface Session {
  element: HTMLDivElement;
  pointer: number;
  start: number;
  initial: number;
  last: number;
  time: number;
  velocity: number;
  size: number;
  value: number;
}
export function useDrawerDrag(options: DragOptions) {
  const latest = useRef(options);
  const session = useRef<Session | null>(null);
  const release = useCallback(() => {
    const current = session.current;
    session.current = null;
    if (current?.element.hasPointerCapture?.(current.pointer)) current.element.releasePointerCapture(current.pointer);
  }, []);
  const cancel = useCallback(() => {
    release();
    latest.current.onCancel();
  }, [release]);
  useCommitEffect(() => {
    latest.current = options;
  });
  const pointsKey = options.points.join(',');
  useCommitEffect(() => {
    cancel();
  }, [options.open, options.side, options.snapPoint, options.content, pointsKey, cancel]);
  useCommitEffect(() => release, [release]);
  const coordinate = (event: PointerEvent<HTMLDivElement>, side: DrawerSide) =>
    side === 'top' || side === 'bottom' ? event.clientY : event.clientX;
  const sign = (side: DrawerSide) => (side === 'bottom' || side === 'right' ? -1 : 1);
  const move = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const current = session.current;
    if (!current || current.pointer !== event.pointerId) return;
    const options = latest.current;
    const next = coordinate(event, options.side);
    const elapsed = event.timeStamp - current.time;
    if (elapsed > 0) current.velocity = ((next - current.last) * sign(options.side)) / elapsed;
    current.last = next;
    current.time = event.timeStamp;
    current.value = Math.max(
      0,
      Math.min(options.points.at(-1)!, current.initial + ((next - current.start) * sign(options.side)) / current.size),
    );
    options.onDrag(current.value);
  }, []);
  return {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      const options = latest.current;
      if (!options.open || !options.content || session.current || event.button !== 0 || event.isPrimary === false)
        return;
      const rect = options.content.getBoundingClientRect();
      const size = options.side === 'top' || options.side === 'bottom' ? rect.height : rect.width;
      if (!size) return;
      event.preventDefault();
      event.currentTarget.focus({ preventScroll: true });
      const start = coordinate(event, options.side);
      session.current = {
        element: event.currentTarget,
        pointer: event.pointerId,
        size,
        start,
        initial: options.snapPoint,
        last: start,
        time: event.timeStamp,
        velocity: 0,
        value: options.snapPoint,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
      options.onDrag(options.snapPoint);
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.buttons === 0) {
        cancel();
        return;
      }
      move(event);
    },
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
      const current = session.current;
      if (!current || current.pointer !== event.pointerId) return;
      // Pointerup can carry a last coordinate without a preceding move.
      if (coordinate(event, latest.current.side) !== current.last) move(event);
      const options = latest.current;
      const point = settleDrawer(
        current.value,
        event.timeStamp - current.time > 80 ? 0 : current.velocity,
        current.size,
        options.points,
        options.closeThreshold,
        options.velocityThreshold,
        options.dismissible,
      );
      release();
      options.onCancel();
      if (point === 0) options.onClose();
      else options.onSnap(point);
    },
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => {
      if (session.current?.pointer === event.pointerId) cancel();
    },
    onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => {
      if (session.current?.pointer === event.pointerId) cancel();
    },
  };
}
