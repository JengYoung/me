'use client';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useMachine, useStableId } from '../_shared/react/index';
import { messageScrollerMachine, validateMessageScroller } from './message-scroller.machine';
import type { MessageScrollerOptions, MessageScrollPosition } from './message-scroller.machine';
import { connectMessageScroller } from './message-scroller.connect';
import type { MessageScrollOptions } from './message-scroller.connect';
import { captureMessagePosition, messageElements, messageOffset, restoredMessageTop } from './message-scroller.dom';

export function useMessageScroller(options: MessageScrollerOptions) {
  validateMessageScroller(options);
  const id = useStableId('iris-message-scroller', options.id);
  const service = useMachine(messageScrollerMachine, { props: options });
  const { send, getProps, getSnapshot } = service;
  const viewport = useRef<HTMLDivElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const [viewportNode, setViewport] = useState<HTMLDivElement | null>(null);
  const [contentNode, setContent] = useState<HTMLDivElement | null>(null);
  const viewportRef = useCallback((node: HTMLDivElement | null) => {
    viewport.current = node;
    setViewport(node);
  }, []);
  const contentRef = useCallback((node: HTMLDivElement | null) => {
    content.current = node;
    setContent(node);
  }, []);
  const anchor = useRef<MessageScrollPosition | null>(null);
  const measured = useRef<{
    node: HTMLDivElement;
    ids: readonly string[];
    height: number;
    width: number;
    viewportHeight: number;
    tailText: string | null;
  } | null>(null);
  const target = useRef<number | null>(null);
  const reduced = useRef(true);
  const getScrollPosition = useCallback(() => {
    if (!viewport.current || !content.current) return null;
    return captureMessagePosition(viewport.current, content.current, getSnapshot().value === 'following');
  }, [getSnapshot]);
  const updatePosition = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    send({
      type: 'POSITION',
      atBottom: node.scrollHeight - node.clientHeight - node.scrollTop <= (getProps().bottomThreshold ?? 4),
    });
    anchor.current = getScrollPosition();
  }, [send, getProps, getScrollPosition]);
  const move = useCallback(
    (top: number, behavior: 'instant' | 'smooth' = 'instant') => {
      const node = viewport.current;
      if (!node) return;
      const destination = Math.max(0, Math.min(Math.max(0, node.scrollHeight - node.clientHeight), top));
      target.current = destination;
      if (behavior === 'smooth' && !reduced.current && node.scrollTo)
        node.scrollTo({ top: destination, behavior: 'smooth' });
      else {
        node.scrollTop = destination;
        updatePosition();
      }
    },
    [updatePosition],
  );
  const interrupt = useCallback(() => {
    target.current = null;
  }, []);
  const scrollToLatest = useCallback(
    (settings?: Pick<MessageScrollOptions, 'behavior'>) => {
      const node = viewport.current;
      if (!node) return;
      send({ type: 'FOLLOW', following: true });
      move(node.scrollHeight, settings?.behavior);
    },
    [move, send],
  );
  const scrollToMessage = useCallback(
    (messageId: string, settings?: MessageScrollOptions) => {
      const node = viewport.current;
      const list = content.current;
      const message = list && messageElements(list).find((element) => element.dataset.messageId === messageId);
      if (!node || !message) return false;
      send({ type: 'FOLLOW', following: false });
      const spare = node.clientHeight - message.getBoundingClientRect().height;
      const align = settings?.align ?? 'start';
      move(
        node.scrollTop + messageOffset(node, message) - (align === 'center' ? spare / 2 : align === 'end' ? spare : 0),
        settings?.behavior,
      );
      return true;
    },
    [move, send],
  );
  const restoreScrollPosition = useCallback(
    (position: MessageScrollPosition) => {
      const node = viewport.current;
      const list = content.current;
      if (!node || !list || !Number.isFinite(position.scrollTop) || !Number.isFinite(position.offset)) return false;
      send({ type: 'FOLLOW', following: position.following });
      move(position.following ? node.scrollHeight : restoredMessageTop(node, list, position));
      return true;
    },
    [move, send],
  );
  const measure = useCallback(() => {
    const node = viewport.current;
    const list = content.current;
    if (!node || !list) return;
    const previous = measured.current;
    const props = getProps();
    const ids = props.messageIds;
    const tail = messageElements(list).find((element) => element.dataset.messageId === ids.at(-1));
    const tailText = tail?.textContent ?? null;
    const changedIds =
      !previous || ids.length !== previous.ids.length || ids.some((id, index) => id !== previous.ids[index]);
    const changedSize =
      !previous ||
      previous.height !== node.scrollHeight ||
      previous.width !== node.clientWidth ||
      previous.viewportHeight !== node.clientHeight;
    if (!previous || previous.node !== node) {
      if (props.initialPosition) restoreScrollPosition(props.initialPosition);
      else if (getSnapshot().value === 'following') move(node.scrollHeight);
    } else if (changedIds || changedSize || tailText !== previous.tailText) {
      const oldLast = previous.ids.at(-1);
      const appended = ids.length > 0 && ids.at(-1) !== oldLast && (!oldLast || ids.includes(oldLast));
      const streamed = ids.at(-1) === oldLast && tailText !== previous.tailText;
      const sameViewport = previous.width === node.clientWidth && previous.viewportHeight === node.clientHeight;
      if (appended || streamed || (!changedIds && sameViewport && node.scrollHeight > previous.height))
        send({ type: 'CONTENT' });
      if (getSnapshot().value === 'following') move(node.scrollHeight);
      else if (anchor.current) move(restoredMessageTop(node, list, anchor.current));
    }
    measured.current = {
      node,
      ids: [...ids],
      height: node.scrollHeight,
      width: node.clientWidth,
      viewportHeight: node.clientHeight,
      tailText,
    };
    updatePosition();
  }, [getProps, getSnapshot, move, restoreScrollPosition, send, updatePosition]);
  const onScroll = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    if (target.current !== null) {
      if (Math.abs(node.scrollTop - target.current) < 1) target.current = null;
    } else
      send({
        type: 'FOLLOW',
        following: node.scrollHeight - node.clientHeight - node.scrollTop <= (getProps().bottomThreshold ?? 4),
      });
    updatePosition();
  }, [send, getProps, updatePosition]);
  useLayoutEffect(() => {
    if (!viewportNode || !contentNode) return;
    let active = true;
    const update = () => {
      if (active) measure();
    };
    const win = viewportNode.ownerDocument.defaultView!;
    const media = win.matchMedia?.('(prefers-reduced-motion: reduce)');
    const motion = () => {
      reduced.current = media?.matches ?? false;
      if (reduced.current && target.current !== null) move(target.current);
    };
    motion();
    media?.addEventListener('change', motion);
    const resize = win.ResizeObserver ? new win.ResizeObserver(update) : undefined;
    resize?.observe(viewportNode);
    resize?.observe(contentNode);
    const mutation = new win.MutationObserver(update);
    mutation.observe(contentNode, { childList: true, subtree: true, characterData: true });
    contentNode.addEventListener('load', update, true);
    win.addEventListener('resize', update);
    update();
    return () => {
      active = false;
      resize?.disconnect();
      mutation.disconnect();
      contentNode.removeEventListener('load', update, true);
      media?.removeEventListener('change', motion);
      win.removeEventListener('resize', update);
      target.current = null;
    };
  }, [viewportNode, contentNode, measure, move]);
  useLayoutEffect(() => {
    measure();
  });
  // Mutable DOM refs are only accessed by committed effects and handlers.
  /* eslint-disable react-hooks/refs -- connect stores refs for commit-time props and handlers only. */
  return connectMessageScroller(
    service,
    { ...options, id },
    {
      refs: { viewport, content },
      viewportRef,
      contentRef,
      onScroll,
      interrupt,
      measure,
      scrollToMessage,
      scrollToLatest,
      getScrollPosition,
      restoreScrollPosition,
    },
  );
  /* eslint-enable react-hooks/refs */
}
export type { MessageScrollerOptions, MessageScrollPosition } from './message-scroller.machine';
export type { MessageScrollerApi, MessageScrollOptions } from './message-scroller.connect';
