import { mergeProps } from "../_shared/react/index";
import type { PartProps } from "../_shared/react/index";
import type { DialogApi } from "../dialog/index";
import type { CSSProperties } from 'react';
import type { useDrawerDrag, DrawerSide } from "./drawer.dom";
export function connectDrawer(
  dialog: DialogApi,
  state: { snapPoint: number; snapTo(value: number): void; dragging: boolean; progress: number },
  options: { side: DrawerSide; dir: 'ltr' | 'rtl'; points: readonly number[] },
  dom: { setContent(node: HTMLDivElement | null): void; drag: ReturnType<typeof useDrawerDrag> },
) {
  const attributes = {
    'data-scope': 'drawer',
    'data-side': options.side,
    'data-state': dialog.open ? 'open' : 'closed',
  };
  const vertical = options.side === 'top' || options.side === 'bottom';
  const distance = (1 - state.progress) * (options.side === 'top' || options.side === 'left' ? -100 : 100);
  return {
    ...dialog,
    ...state,
    side: options.side,
    getTriggerProps: (props: PartProps<'button'> = {}) =>
      mergeProps<'button'>(dialog.getTriggerProps(props), attributes),
    getContentProps: (props: PartProps<'div'> = {}) =>
      mergeProps<'div'>(dialog.getContentProps(props), {
        ...attributes,
        ref: dom.setContent,
        dir: options.dir,
        'data-dragging': state.dragging || undefined,
        'data-snap-point': state.snapPoint,
        style: {
          '--iris-drawer-progress': state.progress,
          transform: vertical ? `translateY(${distance}%)` : `translateX(${distance}%)`,
          ...(state.dragging ? { transition: 'none' } : {}),
        } as CSSProperties,
      }),
    getTitleProps: (props: PartProps<'h2'> = {}) => mergeProps<'h2'>(dialog.getTitleProps(props), attributes),
    getDescriptionProps: (props: PartProps<'p'> = {}) => mergeProps<'p'>(dialog.getDescriptionProps(props), attributes),
    getCloseProps: (props: PartProps<'button'> = {}) => mergeProps<'button'>(dialog.getCloseProps(props), attributes),
    getBackdropProps: (props: PartProps<'div'> = {}) => mergeProps<'div'>(dialog.getBackdropProps(props), attributes),
    getHandleProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ...attributes,
        'data-part': 'handle',
        role: 'slider',
        tabIndex: 0,
        'aria-label': props['aria-label'] ?? (props['aria-labelledby'] ? undefined : 'Drawer size'),
        'aria-valuemin': options.points[0]! * 100,
        'aria-valuemax': options.points.at(-1)! * 100,
        'aria-valuenow': state.snapPoint * 100,
        'aria-valuetext': `${Math.round(state.snapPoint * 100)}%`,
        'aria-orientation': vertical ? 'vertical' : 'horizontal',
        style: { touchAction: 'none', userSelect: 'none' },
        ...dom.drag,
        onKeyDown: (event) => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing || !dialog.open) return;
          const index = options.points.indexOf(state.snapPoint);
          const increase = vertical
            ? options.side === 'bottom'
              ? 'ArrowUp'
              : 'ArrowDown'
            : options.side === 'right'
              ? 'ArrowLeft'
              : 'ArrowRight';
          const decrease = vertical
            ? options.side === 'bottom'
              ? 'ArrowDown'
              : 'ArrowUp'
            : options.side === 'right'
              ? 'ArrowRight'
              : 'ArrowLeft';
          let next: number | undefined;
          if (event.key === 'Home') next = options.points[0];
          else if (event.key === 'End') next = options.points.at(-1);
          else if (event.key === increase) next = options.points[Math.min(options.points.length - 1, index + 1)];
          else if (event.key === decrease) next = options.points[Math.max(0, index - 1)];
          if (next !== undefined) {
            event.preventDefault();
            state.snapTo(next);
          }
        },
      });
    },
  };
}
export type DrawerApi = ReturnType<typeof connectDrawer>;
