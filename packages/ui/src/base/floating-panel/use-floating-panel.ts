'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDirection, useMachine, usePointerDrag, useStableId } from "../_shared/react/index";
import { useLayerFocus } from "../_shared/focus/index";
import type { LayerFocusOptions } from "../_shared/focus/index";
import {
  floatingPanelMachine,
  panelMode,
  panelNormalRect,
  panelOpen,
  validateFloatingPanel,
} from "./floating-panel.machine";
import type { FloatingPanelStateOptions } from "./floating-panel.machine";
import { panelBounds, panelEdges, resizePanel } from "./geometry";
import type { PanelRect, PanelResizeEdge } from "./geometry";
import { connectFloatingPanel } from "./floating-panel.connect";

const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
export interface FloatingPanelOptions
  extends
    FloatingPanelStateOptions,
    Pick<
      LayerFocusOptions,
      'initialFocus' | 'returnFocus' | 'autoFocus' | 'restoreFocus' | 'closeOnEscape' | 'onEscapeKeyDown'
    > {
  id?: string;
  dir?: 'ltr' | 'rtl';
  describedBy?: string;
}
export function useFloatingPanel(options: FloatingPanelOptions = {}) {
  validateFloatingPanel(options);
  const [controlled] = useState(() =>
    [options.open, options.mode, options.position, options.size].map((value) => value !== undefined),
  );
  if (
    [options.open, options.mode, options.position, options.size].some(
      (value, index) => (value !== undefined) !== controlled[index],
    )
  )
    throw new Error('Floating Panel cannot switch control modes.');
  const id = useStableId('iris-floating-panel', options.id);
  const dir = useDirection(options.dir);
  const service = useMachine(floatingPanelMachine, { props: options });
  const { send, getProps, getSnapshot } = service;
  const open = panelOpen(options, service.state.context);
  const mode = panelMode(options, service.state.context);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const focus = useLayerFocus({
    ...options,
    open,
    modal: false,
    activatable: true,
    closeOnOutside: false,
    closeOnFocusOutside: false,
    trigger: () => trigger,
    returnFocus: () => options.returnFocus?.() ?? trigger,
    onDismiss: () => send({ type: 'OPEN', open: false }),
  });
  useCommitEffect(() => {
    if (!open || !content) return;
    const view = content.ownerDocument.defaultView!;
    const update = () => {
      const visual = view.visualViewport;
      const viewport = {
        x: visual?.offsetLeft ?? 0,
        y: visual?.offsetTop ?? 0,
        width: visual?.width ?? view.innerWidth,
        height: visual?.height ?? view.innerHeight,
      };
      const previous = getSnapshot().context.viewport;
      if (!previous || Object.keys(viewport).some((key) => Reflect.get(viewport, key) !== Reflect.get(previous, key)))
        send({ type: 'VIEWPORT', viewport });
    };
    update();
    view.addEventListener('resize', update);
    view.visualViewport?.addEventListener('resize', update);
    view.visualViewport?.addEventListener('scroll', update);
    return () => {
      view.removeEventListener('resize', update);
      view.visualViewport?.removeEventListener('resize', update);
      view.visualViewport?.removeEventListener('scroll', update);
    };
  }, [open, content, send, getSnapshot]);
  useCommitEffect(() => {
    const active = content?.ownerDocument.activeElement as HTMLElement | null;
    if (
      open &&
      content &&
      active &&
      content.contains(active) &&
      (active.closest('[hidden]') || active.matches(':disabled'))
    )
      content.focus({ preventScroll: true });
  }, [open, mode, content]);
  const origin = useRef<{ rect: PanelRect; x: number; y: number; edge: PanelResizeEdge | null } | null>(null);
  const drag = usePointerDrag({
    disabled: !open || mode !== 'normal' || options.disabled,
    onStart(event) {
      const target = (event.target as Element).closest<HTMLButtonElement>('button[data-scope="floating-panel"]');
      if (!target || target.disabled || target.closest('[data-part="content"]')?.id !== `${id}-content`) return false;
      const part = target.dataset.part;
      const edge = target.dataset.edge as PanelResizeEdge;
      if (part !== 'drag-handle' && (part !== 'resize-handle' || !panelEdges.includes(edge))) return false;
      const props = getProps();
      if (
        (part === 'drag-handle' && props.draggable === false) ||
        (part === 'resize-handle' && props.resizable === false)
      )
        return false;
      origin.current = {
        rect: panelNormalRect(props, getSnapshot().context),
        x: event.clientX,
        y: event.clientY,
        edge: part === 'drag-handle' ? null : edge,
      };
      target.focus({ preventScroll: true });
      focus.activate();
      send({ type: 'START', interaction: part === 'drag-handle' ? 'dragging' : 'resizing' });
      return true;
    },
    onMove(event) {
      const start = origin.current;
      if (!start || getSnapshot().value === 'idle') return;
      const props = getProps();
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      const next = start.edge
        ? resizePanel(start.rect, start.edge, dx, dy, props, panelBounds(props, getSnapshot().context.viewport))
        : { ...start.rect, x: start.rect.x + dx, y: start.rect.y + dy };
      send({
        type: 'RECT',
        position: { x: next.x, y: next.y },
        ...(start.edge ? { size: { width: next.width, height: next.height } } : {}),
      });
    },
    onEnd() {
      origin.current = null;
      send({ type: 'END' });
    },
  });
  return connectFloatingPanel(service, { ...options, id, dir }, focus, drag, { setTrigger, setContent });
}
export type { FloatingPanelApi } from "./floating-panel.connect";
