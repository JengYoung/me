'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useDirection } from '../react/index';
import { computePosition } from './position';
import type { PositionOptions } from './position';

const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
export interface UsePositionOptions extends PositionOptions {
  open: boolean;
  anchor: HTMLElement | null;
  content: HTMLElement | null;
  onAnchorHidden?: () => void;
}

export function usePosition(options: UsePositionOptions) {
  const dir = useDirection(options.dir);
  const latest = useRef(options);
  const [position, setPosition] = useState<ReturnType<typeof computePosition> | null>(null);
  useCommitEffect(() => {
    latest.current = options;
  });
  const update = useCallback(() => {
    const current = latest.current;
    if (!current.open || !current.anchor || !current.content) return;
    const { anchor, content } = current;
    const view = anchor.ownerDocument.defaultView!;
    const viewport = view.visualViewport;
    const next = computePosition(
      anchor.getBoundingClientRect(),
      content.getBoundingClientRect(),
      {
        x: viewport?.offsetLeft ?? 0,
        y: viewport?.offsetTop ?? 0,
        width: viewport?.width ?? view.innerWidth,
        height: viewport?.height ?? view.innerHeight,
      },
      { ...current, dir },
    );
    setPosition((previous) =>
      previous && Object.keys(next).every((key) => Reflect.get(previous, key) === Reflect.get(next, key))
        ? previous
        : next,
    );
  }, [dir]);
  const { open, anchor, content, placement, offset, collisionPadding } = options;
  useCommitEffect(() => {
    if (!open || !content) return;
    if (!anchor) {
      latest.current.onAnchorHidden?.();
      return;
    }
    const view = anchor.ownerDocument.defaultView!;
    let hidden = false;
    const check = () => {
      const missing =
        !anchor.isConnected ||
        !!anchor.closest('[hidden]') ||
        view.getComputedStyle(anchor).display === 'none' ||
        view.getComputedStyle(anchor).visibility === 'hidden';
      if (missing) {
        if (!hidden) latest.current.onAnchorHidden?.();
      } else update();
      hidden = missing;
    };
    check();
    const resize = view.ResizeObserver ? new view.ResizeObserver(check) : null;
    resize?.observe(anchor);
    resize?.observe(content);
    const mutations = new view.MutationObserver(check);
    mutations.observe(anchor.ownerDocument.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden', 'class', 'style', 'dir'],
    });
    view.addEventListener('resize', check);
    anchor.ownerDocument.addEventListener('scroll', check, true);
    view.visualViewport?.addEventListener('resize', check);
    view.visualViewport?.addEventListener('scroll', check);
    return () => {
      resize?.disconnect();
      mutations.disconnect();
      view.removeEventListener('resize', check);
      anchor.ownerDocument.removeEventListener('scroll', check, true);
      view.visualViewport?.removeEventListener('resize', check);
      view.visualViewport?.removeEventListener('scroll', check);
    };
  }, [open, anchor, content, placement, offset, collisionPadding, update]);
  for (const value of [offset, collisionPadding]) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0))
      throw new Error('Position distances must be finite and non-negative.');
  }
  const style: CSSProperties = {
    position: 'fixed',
    left: position?.x ?? 0,
    top: position?.y ?? 0,
    maxWidth: position?.availableWidth,
    maxHeight: position?.availableHeight,
  };
  return { ...position, placement: position?.placement ?? placement ?? 'bottom-start', style, update };
}
