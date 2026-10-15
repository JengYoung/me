'use client';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useDirection, useMachine, useStableId } from '../_shared/react/index';
import { marqueeMachine, validateMarquee } from './marquee.machine';
import type { MarqueeOptions } from './marquee.machine';
import { connectMarquee } from './marquee.connect';
import { syncMarqueeCopy } from './marquee.dom';

export function useMarquee(options: MarqueeOptions = {}) {
  validateMarquee(options);
  const id = useStableId('iris-marquee', options.id);
  const dir = useDirection(options.dir);
  const [controlled] = useState(options.playing !== undefined);
  const service = useMachine(marqueeMachine, { props: { ...options, dir } });
  const { send, getProps } = service;
  const viewport = useRef<HTMLDivElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const copies = useRef(new Map<number, HTMLDivElement>());
  const [copyRefs] = useState(() =>
    Array.from({ length: 100 }, (_, index) => (node: HTMLDivElement | null) => {
      if (node) {
        copies.current.set(index, node);
        if (content.current) syncMarqueeCopy(content.current, node);
      } else copies.current.delete(index);
    }),
  );
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
  const copyRef = useCallback((index: number) => copyRefs[index]!, [copyRefs]);
  const syncCopies = useCallback(() => {
    if (content.current) for (const copy of copies.current.values()) syncMarqueeCopy(content.current, copy);
  }, []);
  const measure = useCallback(() => {
    const node = viewport.current;
    const source = content.current;
    if (!node || !source) return;
    const vertical = getProps().orientation === 'vertical';
    send({
      type: 'MEASURE',
      viewportSize: vertical ? node.clientHeight : node.clientWidth,
      contentSize: vertical ? source.offsetHeight : source.offsetWidth,
    });
  }, [getProps, send]);
  useLayoutEffect(() => {
    if (!viewportNode || !contentNode) return;
    let active = true;
    const update = () => {
      if (active) {
        syncCopies();
        measure();
      }
    };
    const win = viewportNode.ownerDocument.defaultView!;
    const document = viewportNode.ownerDocument;
    const media = win.matchMedia?.('(prefers-reduced-motion: reduce)');
    const environment = () =>
      send({ type: 'ENVIRONMENT', reduced: media?.matches ?? false, hidden: document.visibilityState === 'hidden' });
    environment();
    media?.addEventListener('change', environment);
    document.addEventListener('visibilitychange', environment);
    const resize = win.ResizeObserver ? new win.ResizeObserver(update) : undefined;
    resize?.observe(viewportNode);
    resize?.observe(contentNode);
    const mutation = new win.MutationObserver(update);
    mutation.observe(contentNode, { subtree: true, childList: true, characterData: true, attributes: true });
    contentNode.addEventListener('load', update, true);
    win.addEventListener('resize', update);
    update();
    return () => {
      active = false;
      resize?.disconnect();
      mutation.disconnect();
      contentNode.removeEventListener('load', update, true);
      media?.removeEventListener('change', environment);
      document.removeEventListener('visibilitychange', environment);
      win.removeEventListener('resize', update);
    };
  }, [viewportNode, contentNode, measure, syncCopies, send]);
  useLayoutEffect(measure, [measure, options.orientation]);
  if (controlled !== (options.playing !== undefined)) throw new Error('Marquee cannot switch control modes.');
  // Ref registration is stable and does not read DOM until React's commit.
  /* eslint-disable react-hooks/refs -- connect stores refs for commit-time props and handlers only. */
  return connectMarquee(
    service,
    { ...options, id, dir },
    { refs: { viewport, content }, viewportRef, contentRef, copyRef, measure },
  );
  /* eslint-enable react-hooks/refs */
}
export type { MarqueeOptions } from './marquee.machine';
export type { MarqueeApi, MarqueeCopyProps } from './marquee.connect';
