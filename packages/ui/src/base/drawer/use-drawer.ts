'use client';
import { useCallback, useState } from 'react';
import { useDirection, useMachine } from "../_shared/react/index";
import { useDialog } from "../dialog/index";
import type { DialogOptions } from "../dialog/index";
import { defaultSnapPoints, drawerMachine, drawerSnap } from "./drawer.machine";
import type { DrawerSnapOptions } from "./drawer.machine";
import { useDrawerDrag } from "./drawer.dom";
import { connectDrawer } from "./drawer.connect";
export interface DrawerOptions extends DialogOptions, DrawerSnapOptions {
  side?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';
  dir?: 'ltr' | 'rtl';
  dismissible?: boolean;
  closeThreshold?: number;
  velocityThreshold?: number;
}
export function useDrawer(options: DrawerOptions = {}) {
  const dir = useDirection(options.dir);
  const requested = options.side ?? 'bottom';
  const side =
    requested === 'start'
      ? dir === 'rtl'
        ? 'right'
        : 'left'
      : requested === 'end'
        ? dir === 'rtl'
          ? 'left'
          : 'right'
        : requested;
  const points = options.snapPoints ?? defaultSnapPoints;
  const [controlled] = useState(options.snapPoint !== undefined);
  const dialog = useDialog(options);
  const { state, send } = useMachine(drawerMachine, { props: options });
  const snapPoint = drawerSnap(options, state.context.snap);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const snapTo = useCallback((value: number) => send({ type: 'SNAP', value }), [send]);
  const closeThreshold = options.closeThreshold ?? 0.5;
  const velocityThreshold = options.velocityThreshold ?? 0.5;
  const drag = useDrawerDrag({
    open: dialog.open,
    side,
    content,
    snapPoint,
    points,
    closeThreshold,
    velocityThreshold,
    dismissible: options.dismissible ?? true,
    onDrag: (value) => send({ type: 'DRAG', value }),
    onCancel: () => send({ type: 'CANCEL' }),
    onSnap: snapTo,
    onClose: () => dialog.setOpen(false),
  });
  if (
    !points.length ||
    points.some(
      (point, index) =>
        !Number.isFinite(point) || point <= 0 || point > 1 || (index > 0 && point <= points[index - 1]!),
    )
  )
    throw new Error('Drawer snapPoints must be strictly increasing fractions in (0, 1].');
  for (const point of [options.snapPoint, options.defaultSnapPoint])
    if (point !== undefined && !points.includes(point))
      throw new Error('Drawer snapPoint must be a member of snapPoints.');
  if (
    !Number.isFinite(closeThreshold) ||
    closeThreshold < 0 ||
    closeThreshold > 1 ||
    !Number.isFinite(velocityThreshold) ||
    velocityThreshold < 0
  )
    throw new Error(
      'Drawer thresholds must be finite; closeThreshold is in [0, 1], velocityThreshold is non-negative.',
    );
  if (controlled !== (options.snapPoint !== undefined)) throw new Error('Drawer cannot switch snap control modes.');
  return connectDrawer(
    dialog,
    {
      snapPoint,
      snapTo,
      dragging: state.value === 'dragging',
      progress: state.value === 'dragging' ? state.context.drag : snapPoint,
    },
    { side, dir, points },
    { setContent, drag },
  );
}
export type { DrawerApi } from "./drawer.connect";
