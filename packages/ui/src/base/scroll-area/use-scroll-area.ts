'use client';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useDirection, useMachine, usePointerDrag, useStableId } from "../_shared/react/index";
import { scrollAreaMachine, validateScrollArea } from "./scroll-area.machine";
import type { ScrollAreaOptions } from "./scroll-area.machine";
import { connectScrollArea } from "./scroll-area.connect";
import { clampScroll, logicalScrollLeft, physicalScrollLeft, scrollAxisMetrics } from "./scroll-area.geometry";
import type { ScrollAxis, RtlScrollType } from "./scroll-area.geometry";
import { detectRtlScrollType } from "./scroll-area.dom";

export function useScrollArea(options: ScrollAreaOptions = {}) {
  validateScrollArea(options);
  const id = useStableId('iris-scroll-area', options.id);
  const dir = useDirection(options.dir);
  const service = useMachine(scrollAreaMachine, { props: { ...options, dir } });
  const { send, getProps, getSnapshot } = service;
  const viewport = useRef<HTMLDivElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const horizontalScrollbar = useRef<HTMLDivElement | null>(null);
  const verticalScrollbar = useRef<HTMLDivElement | null>(null);
  const horizontalThumb = useRef<HTMLDivElement | null>(null);
  const verticalThumb = useRef<HTMLDivElement | null>(null);
  const [viewportNode, setViewport] = useState<HTMLDivElement | null>(null);
  const [contentNode, setContent] = useState<HTMLDivElement | null>(null);
  const [horizontalNode, setHorizontal] = useState<HTMLDivElement | null>(null);
  const [verticalNode, setVertical] = useState<HTMLDivElement | null>(null);
  const viewportRef = useCallback((node: HTMLDivElement | null) => {
    viewport.current = node;
    setViewport(node);
  }, []);
  const contentRef = useCallback((node: HTMLDivElement | null) => {
    content.current = node;
    setContent(node);
  }, []);
  const horizontalRef = useCallback((node: HTMLDivElement | null) => {
    horizontalScrollbar.current = node;
    setHorizontal(node);
  }, []);
  const verticalRef = useCallback((node: HTMLDivElement | null) => {
    verticalScrollbar.current = node;
    setVertical(node);
  }, []);
  const rtlType = useRef<RtlScrollType>('negative');
  const measure = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const props = getProps();
    const rtl = props.dir === 'rtl';
    const max = Math.max(0, node.scrollWidth - node.clientWidth);
    send({
      type: 'MEASURE',
      horizontal: scrollAxisMetrics(
        node.clientWidth,
        node.scrollWidth,
        horizontalScrollbar.current?.clientWidth ?? 0,
        rtl ? logicalScrollLeft(node.scrollLeft, max, rtlType.current) : node.scrollLeft,
        props.minThumbSize,
        rtl,
      ),
      vertical: scrollAxisMetrics(
        node.clientHeight,
        node.scrollHeight,
        verticalScrollbar.current?.clientHeight ?? 0,
        node.scrollTop,
        props.minThumbSize,
      ),
    });
  }, [getProps, send]);
  const scrollTo = useCallback(
    (axis: ScrollAxis, value: number) => {
      const node = viewport.current;
      if (!node || !Number.isFinite(value)) return;
      const max = Math.max(
        0,
        axis === 'horizontal' ? node.scrollWidth - node.clientWidth : node.scrollHeight - node.clientHeight,
      );
      const position = clampScroll(value, max);
      if (axis === 'vertical') node.scrollTop = position;
      else node.scrollLeft = getProps().dir === 'rtl' ? physicalScrollLeft(position, max, rtlType.current) : position;
      measure();
    },
    [getProps, measure],
  );
  useLayoutEffect(() => {
    if (!viewportNode) return;
    rtlType.current = detectRtlScrollType(viewportNode.ownerDocument);
    let active = true;
    const update = () => {
      if (active) measure();
    };
    const win = viewportNode.ownerDocument.defaultView!;
    const resize = win.ResizeObserver ? new win.ResizeObserver(update) : undefined;
    for (const node of [viewportNode, contentNode, horizontalNode, verticalNode]) if (node) resize?.observe(node);
    const mutation = new win.MutationObserver(update);
    if (contentNode) mutation.observe(contentNode, { childList: true, subtree: true, characterData: true });
    contentNode?.addEventListener('load', update, true);
    win.addEventListener('resize', update);
    update();
    return () => {
      active = false;
      resize?.disconnect();
      mutation.disconnect();
      contentNode?.removeEventListener('load', update, true);
      win.removeEventListener('resize', update);
    };
  }, [viewportNode, contentNode, horizontalNode, verticalNode, measure]);
  useLayoutEffect(measure, [
    measure,
    dir,
    options.minThumbSize,
    service.state.context.horizontal.overflow,
    service.state.context.vertical.overflow,
  ]);
  const dragStart = useRef<{ axis: ScrollAxis; offset: number } | null>(null);
  const start = (axis: ScrollAxis, event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current || !getSnapshot().context[axis].overflow) return false;
    const rect = event.currentTarget.getBoundingClientRect();
    const pointer = axis === 'horizontal' ? event.clientX - rect.left : event.clientY - rect.top;
    const metrics = getSnapshot().context[axis];
    const thumb = axis === 'horizontal' ? horizontalThumb.current : verticalThumb.current;
    const onThumb = thumb?.contains(event.target as Node);
    dragStart.current = { axis, offset: onThumb ? pointer - metrics.thumbOffset : metrics.thumbSize / 2 };
    event.currentTarget.focus({ preventScroll: true });
    send({ type: 'START', axis });
    if (!onThumb) move(axis, event);
    return true;
  };
  const move = (axis: ScrollAxis, event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current?.axis !== axis) return;
    const metrics = getSnapshot().context[axis];
    const rect = event.currentTarget.getBoundingClientRect();
    const pointer = axis === 'horizontal' ? event.clientX - rect.left : event.clientY - rect.top;
    const travel = metrics.track - metrics.thumbSize;
    if (travel <= 0) return;
    const ratio = (pointer - dragStart.current.offset) / travel;
    scrollTo(axis, (axis === 'horizontal' && getProps().dir === 'rtl' ? 1 - ratio : ratio) * metrics.max);
  };
  const end = () => {
    dragStart.current = null;
    send({ type: 'END' });
  };
  const horizontalDrag = usePointerDrag({
    disabled: !service.state.context.horizontal.overflow,
    onStart: (event) => start('horizontal', event),
    onMove: (event) => move('horizontal', event),
    onEnd: end,
  });
  const verticalDrag = usePointerDrag({
    disabled: !service.state.context.vertical.overflow,
    onStart: (event) => start('vertical', event),
    onMove: (event) => move('vertical', event),
    onEnd: end,
  });
  useLayoutEffect(() => {
    const current = getSnapshot().context;
    if (current.axis && !current[current.axis].overflow) {
      dragStart.current = null;
      send({ type: 'END' });
    }
    const active = viewport.current?.ownerDocument.activeElement ?? null;
    if (
      (!current.horizontal.overflow && horizontalScrollbar.current?.contains(active)) ||
      (!current.vertical.overflow && verticalScrollbar.current?.contains(active))
    )
      viewport.current?.focus({ preventScroll: true });
  }, [getSnapshot, send, service.state.context.horizontal.overflow, service.state.context.vertical.overflow]);
  // Refs are consumed only by committed handlers, effects and React ref assignment.
  /* eslint-disable react-hooks/refs -- connect stores refs for commit-time props and handlers only. */
  return connectScrollArea(
    service,
    { ...options, dir, id },
    {
      refs: { viewport, content, horizontalScrollbar, verticalScrollbar, horizontalThumb, verticalThumb },
      viewportRef,
      contentRef,
      horizontalRef,
      verticalRef,
      horizontalDrag,
      verticalDrag,
      measure,
      scrollTo,
    },
  );
  /* eslint-enable react-hooks/refs */
}
export type { ScrollAreaOptions } from "./scroll-area.machine";
export type { ScrollAreaApi, ScrollAreaRefs } from "./scroll-area.connect";
export type { ScrollAxis, ScrollAxisMetrics } from "./scroll-area.geometry";
