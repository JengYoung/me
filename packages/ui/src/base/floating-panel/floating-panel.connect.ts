import { mergeProps } from "../_shared/react/index";
import type { CSSProperties, KeyboardEvent } from 'react';
import type { MachineApi, PartProps, usePointerDrag } from "../_shared/react/index";
import type { ModalFocusApi } from "../_shared/focus/index";
import { panelDisplayRect, panelMode, panelNormalRect, panelOpen } from "./floating-panel.machine";
import type { FloatingPanelMode, FloatingPanelSchema } from "./floating-panel.machine";
import { panelBounds, panelEdges, resizePanel } from "./geometry";
import type { PanelPoint, PanelResizeEdge, PanelSize } from "./geometry";
import type { FloatingPanelOptions } from "./use-floating-panel";

export function connectFloatingPanel(
  service: MachineApi<FloatingPanelSchema>,
  options: FloatingPanelOptions & { id: string; dir: 'ltr' | 'rtl' },
  focus: ModalFocusApi,
  drag: ReturnType<typeof usePointerDrag>,
  refs: { setTrigger: (node: HTMLButtonElement | null) => void; setContent: (node: HTMLDivElement | null) => void },
) {
  const open = panelOpen(options, service.state.context);
  const mode = panelMode(options, service.state.context);
  const rect = panelDisplayRect(options, service.state.context);
  const normal = panelNormalRect(options, service.state.context);
  const data = (part: string) => ({
    'data-scope': 'floating-panel',
    'data-part': part,
    'data-state': open ? 'open' : 'closed',
    'data-mode': mode,
    'data-active': focus.active || undefined,
    'data-interaction': service.state.value,
  });
  const setOpen = (value: boolean) => service.send({ type: 'OPEN', open: value });
  const setMode = (value: FloatingPanelMode) => service.send({ type: 'MODE', mode: value });
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, edge?: PanelResizeEdge) {
    if (
      event.target !== event.currentTarget ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.nativeEvent.isComposing
    )
      return;
    const props = service.getProps();
    const context = service.getSnapshot().context;
    if (
      props.disabled ||
      !panelOpen(props, context) ||
      panelMode(props, context) !== 'normal' ||
      (edge ? props.resizable === false : props.draggable === false)
    )
      return;
    const step = (props.keyboardStep ?? 10) * (event.shiftKey ? 10 : 1);
    const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
    const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
    if ((!dx && !dy) || (edge && ((dx && !/[ew]/.test(edge)) || (dy && !/[ns]/.test(edge))))) return;
    event.preventDefault();
    const current = panelNormalRect(props, context);
    const next = edge
      ? resizePanel(current, edge, dx, dy, props, panelBounds(props, context.viewport))
      : { ...current, x: current.x + dx, y: current.y + dy };
    service.send({
      type: 'RECT',
      position: { x: next.x, y: next.y },
      ...(edge ? { size: { width: next.width, height: next.height } } : {}),
    });
  }
  const style: CSSProperties & { '--iris-layer-index': number } = {
    position: 'fixed',
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
    '--iris-layer-index': focus.layerIndex,
  };
  return {
    open,
    mode,
    rect,
    position: { x: normal.x, y: normal.y },
    size: { width: normal.width, height: normal.height },
    active: focus.active,
    layerIndex: focus.layerIndex,
    scope: focus.scope,
    interaction: service.state.value,
    setOpen,
    setMode,
    activate: focus.activate,
    setPosition: (position: PanelPoint) => service.send({ type: 'RECT', position }),
    setSize: (size: PanelSize) => service.send({ type: 'RECT', size }),
    minimize: () => setMode('minimized'),
    maximize: () => setMode('maximized'),
    restore: () => setMode('normal'),
    getTriggerProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(props, {
        ...data('trigger'),
        ref: refs.setTrigger,
        id: `${options.id}-trigger`,
        type: props.type ?? 'button',
        disabled: options.disabled || props.disabled,
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-controls': `${options.id}-content`,
        onClick: () => {
          if (!props.disabled && !service.getProps().disabled)
            setOpen(!panelOpen(service.getProps(), service.getSnapshot().context));
        },
      });
    },
    getContentProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      const { 'aria-modal': _modal, ...user } = props;
      return focus.getContentProps(
        mergeProps<'div'>(mergeProps<'div'>(user, drag), {
          ...data('content'),
          ref: refs.setContent,
          id: `${options.id}-content`,
          role: 'dialog',
          'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : `${options.id}-title`),
          'aria-describedby': options.describedBy ?? props['aria-describedby'],
          hidden: !open,
          dir: options.dir,
          style,
          onPointerDown: () => focus.activate(),
        }),
      );
    },
    getTitleProps: (props: PartProps<'h2'> = {}) =>
      mergeProps<'h2'>(props, { ...data('title'), id: `${options.id}-title` }),
    getBodyProps: (props: PartProps<'div'> = {}) =>
      mergeProps<'div'>(props, { ...data('body'), id: `${options.id}-body`, hidden: mode === 'minimized' }),
    getDragHandleProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(props, {
        ...data('drag-handle'),
        type: 'button',
        'aria-label': props['aria-label'] ?? 'Move panel',
        'aria-controls': `${options.id}-content`,
        disabled: !!options.disabled || options.draggable === false || mode !== 'normal' || props.disabled,
        onKeyDown: (event) => keyboard(event),
      });
    },
    getResizeHandleProps(edge: PanelResizeEdge, props: PartProps<'button'> = {}): PartProps<'button'> {
      if (!panelEdges.includes(edge)) throw new Error('Invalid Floating Panel resize edge.');
      return mergeProps<'button'>(props, {
        ...data('resize-handle'),
        'data-edge': edge,
        type: 'button',
        'aria-label': props['aria-label'] ?? `Resize panel ${edge}`,
        'aria-controls': `${options.id}-content`,
        disabled: !!options.disabled || options.resizable === false || mode !== 'normal' || props.disabled,
        onKeyDown: (event) => keyboard(event, edge),
      });
    },
    getModeTriggerProps(target: FloatingPanelMode, props: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(props, {
        ...data('mode-trigger'),
        'data-mode-target': target,
        type: 'button',
        'aria-label': props['aria-label'] ?? `${target} panel`,
        'aria-pressed': mode === target,
        disabled: options.disabled || props.disabled,
        onClick: () => {
          if (!props.disabled && !service.getProps().disabled) setMode(target);
        },
      });
    },
    getCloseProps: (props: PartProps<'button'> = {}) =>
      mergeProps<'button'>(props, {
        ...data('close'),
        type: 'button',
        onClick: () => {
          if (!props.disabled) setOpen(false);
        },
      }),
  };
}
export type FloatingPanelApi = ReturnType<typeof connectFloatingPanel>;
