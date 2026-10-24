'use client';

import { useRef } from 'react';
import type { HTMLAttributes } from 'react';
import type { CarouselDirection } from './use-carousel-motion';

/** 세로 페이지 스크롤은 보존하고, 가로 스와이프 뒤의 링크 클릭만 취소한다. */
export function useCarouselSwipe(onSwipe: (direction: CarouselDirection) => void): HTMLAttributes<HTMLElement> {
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  return {
    onPointerDown(event) {
      swiped.current = false;
      gesture.current =
        event.pointerType === 'touch' && event.isPrimary ? { x: event.clientX, y: event.clientY } : null;
    },
    onPointerCancel() {
      gesture.current = null;
    },
    onPointerUp(event) {
      const start = gesture.current;
      gesture.current = null;
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      swiped.current = true;
      onSwipe(dx < 0 ? 'next' : 'previous');
    },
    onClickCapture(event) {
      if (swiped.current && event.detail !== 0) {
        event.preventDefault();
        event.stopPropagation();
      }
      swiped.current = false;
    },
  };
}
