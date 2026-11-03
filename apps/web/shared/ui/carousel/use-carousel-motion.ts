'use client';

import { useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';

export type CarouselDirection = 'next' | 'previous';
type Navigation = { next: () => void; previous: () => void };

/** 시리즈 화면에서 쓰던 방향 전환과 연속 입력 처리를 같은 수명으로 공유한다. */
export function useCarouselMotion({
  value,
  onValueChange,
}: {
  value: string | null;
  onValueChange: (value: string) => void;
}) {
  const [motion, setMotion] = useState<CarouselDirection | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const direction = useRef<CarouselDirection>('next');
  const queuedDirection = useRef<CarouselDirection | null>(null);

  function select(nextValue: string | null, queueWhileMoving = true) {
    if (!nextValue || nextValue === value) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const moving = viewport.current
      ?.querySelector('[data-part="slide"]:not([hidden])')
      ?.getAnimations()
      .some((animation) => animation.playState === 'running' || animation.playState === 'paused');
    if (queueWhileMoving && !reduced && moving && motion === direction.current) {
      queuedDirection.current = direction.current;
      return;
    }
    queuedDirection.current = null;
    setMotion(reduced ? null : direction.current);
    onValueChange(nextValue);
  }

  function setDirection(next: CarouselDirection) {
    direction.current = next;
  }

  function move(next: CarouselDirection, navigation: Navigation) {
    setDirection(next);
    if (next === 'next') navigation.next();
    else navigation.previous();
  }

  function finish(navigation: Navigation) {
    const queued = queuedDirection.current;
    queuedDirection.current = null;
    if (queued) move(queued, navigation);
  }

  function slideEvents(active: boolean, navigation: Navigation): HTMLAttributes<HTMLDivElement> {
    return {
      onTransitionEnd(event) {
        if (event.target === event.currentTarget && event.propertyName === 'transform' && active) finish(navigation);
      },
      onTransitionCancel(event) {
        if (
          event.target === event.currentTarget &&
          event.nativeEvent.propertyName === 'transform' &&
          active &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        )
          finish(navigation);
      },
      onAnimationEnd(event) {
        if (event.target === event.currentTarget && active) finish(navigation);
      },
    };
  }

  return { viewport, motion, select, setDirection, move, slideEvents };
}
