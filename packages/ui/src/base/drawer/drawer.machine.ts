import { createMachine } from '../_shared/core/index';
export interface DrawerSnapOptions {
  snapPoints?: readonly number[];
  snapPoint?: number;
  defaultSnapPoint?: number;
  onSnapPointChange?: (snapPoint: number) => void;
}
export const defaultSnapPoints: readonly number[] = [1];
export function drawerSnap(props: DrawerSnapOptions, stored: number) {
  const points = props.snapPoints ?? defaultSnapPoints;
  return points.includes(props.snapPoint ?? stored) ? (props.snapPoint ?? stored) : points[points.length - 1]!;
}
export interface DrawerSchema {
  state: 'idle' | 'dragging';
  props: DrawerSnapOptions;
  context: { snap: number; drag: number };
  event: { type: 'SNAP'; value: number } | { type: 'DRAG'; value: number } | { type: 'CANCEL' };
}
export const drawerMachine = createMachine<DrawerSchema>({
  initial: 'idle',
  context: ({ props }) => ({
    snap: props.defaultSnapPoint ?? (props.snapPoints ?? defaultSnapPoints).at(-1)!,
    drag: 0,
  }),
  states: { idle: {}, dragging: {} },
  on: {
    DRAG: { target: 'dragging', assign: ({ event }) => ({ drag: Math.max(0, Math.min(1, event.value)) }) },
    CANCEL: { target: 'idle' },
    SNAP: [
      {
        guard: ({ props, context, event }) =>
          (props.snapPoints ?? defaultSnapPoints).includes(event.value) &&
          drawerSnap(props, context.snap) !== event.value,
        target: 'idle',
        assign: ({ props, context, event }) => ({ snap: props.snapPoint === undefined ? event.value : context.snap }),
        actions: [({ props, event }) => props.onSnapPointChange?.(event.value)],
      },
      { target: 'idle' },
    ],
  },
});

/** Dismiss at the actual release position; velocity projects 200ms ahead only to select an open snap point. */
export function settleDrawer(
  value: number,
  velocity: number,
  size: number,
  points: readonly number[],
  closeThreshold: number,
  velocityThreshold: number,
  dismissible: boolean,
) {
  if (dismissible && value < points[0]! * closeThreshold) return 0;
  const projected = value + (Math.abs(velocity) >= velocityThreshold ? (velocity * 200) / size : 0);
  return points.reduce(
    (closest, point) => (Math.abs(point - projected) < Math.abs(closest - projected) ? point : closest),
    points[0]!,
  );
}
