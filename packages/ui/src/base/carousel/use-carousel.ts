'use client';
import { useMachine, useStableId } from '../_shared/react/index';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { carouselMachine, validateCarousel } from './carousel.machine';
import type { CarouselOptions } from './carousel.machine';
import { connectCarousel } from './carousel.connect';
const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
export function useCarousel(options: CarouselOptions) {
  validateCarousel(options);
  const id = useStableId('iris-carousel', options.id);
  const [controlled] = useState(options.value !== undefined);
  const service = useMachine(carouselMachine, { props: options });
  const { send } = service;
  const root = useRef<HTMLDivElement | null>(null);
  const focused = useRef<{ element: HTMLElement; slide: HTMLElement } | null>(null);
  const rotationIntent = useRef<boolean | null>(null);
  useCommitEffect(() => {
    const previous = focused.current;
    const element = root.current;
    if (!previous || !element || (!previous.slide.hidden && element.contains(previous.slide))) return;
    focused.current = null;
    const active = element.ownerDocument.activeElement;
    if (previous.slide.contains(active) || (!previous.element.isConnected && active === element.ownerDocument.body)) {
      const target = element.querySelector<HTMLButtonElement>(
        '[data-part="rotation"]:not(:disabled),[data-part="previous"]:not(:disabled),[data-part="next"]:not(:disabled)',
      );
      (target ?? element).focus();
    }
  });
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () =>
      send({ type: 'ENVIRONMENT', reduced: media?.matches ?? false, hidden: document.visibilityState === 'hidden' });
    update();
    media?.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      media?.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [send]);
  if (controlled !== (options.value !== undefined)) throw new Error('Carousel cannot switch control modes.');
  // Refs are only read by committed DOM handlers and the layout effect.
  // eslint-disable-next-line react-hooks/refs
  return connectCarousel(service, { ...options, id }, root, focused, rotationIntent);
}
export type { CarouselOptions, CarouselSlide } from './carousel.machine';
export type { CarouselApi } from './carousel.connect';
