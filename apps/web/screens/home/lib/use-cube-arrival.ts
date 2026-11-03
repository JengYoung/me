'use client';

import { useEffect, useRef } from 'react';

/** 출현만 관찰하고, 프레임별 이동과 회전은 CSS가 처리합니다. */
export function useCubeArrival() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || typeof IntersectionObserver === 'undefined') return;
    let visible = false;
    const updatePlaying = () => {
      host.dataset.visible = String(visible && !document.hidden);
    };
    const revealOnFocus = () => {
      host.dataset.entered = 'true';
      // 포커스를 떠나도 출현 애니메이션이 다시 시작되지 않게 유지합니다.
      host.dataset.immediate = 'true';
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        visible = entry.isIntersecting;
        if (visible && entry.intersectionRatio >= 0.45 && host.dataset.entered !== 'true') {
          const grid = host.closest('main')?.querySelector<HTMLElement>('[data-grid-pulse]');
          const cell = grid ? Number.parseFloat(getComputedStyle(grid).getPropertyValue('--grid-cell-x')) || 24 : 24;
          const { top, width } = entry.boundingClientRect;
          // 작은 파편과 같은 크기로 화면 하단 더미에서 출발합니다. 프레임마다 측정하지 않습니다.
          host.style.setProperty('--cube-enter-scale', String(Math.min(1, cell / Math.max(1, width))));
          host.style.setProperty('--cube-rise-y', `${Math.max(0, window.innerHeight - cell / 2 - top - width / 2)}px`);
          host.dataset.entered = 'true';
        }
        updatePlaying();
      },
      { threshold: 0.45, rootMargin: '0px 0px -64px 0px' },
    );

    host.dataset.observed = 'true';
    observer.observe(host);
    host.addEventListener('focusin', revealOnFocus);
    document.addEventListener('visibilitychange', updatePlaying);
    return () => {
      observer.disconnect();
      host.removeEventListener('focusin', revealOnFocus);
      document.removeEventListener('visibilitychange', updatePlaying);
      delete host.dataset.observed;
      delete host.dataset.entered;
      delete host.dataset.visible;
      delete host.dataset.immediate;
      host.style.removeProperty('--cube-enter-scale');
      host.style.removeProperty('--cube-rise-y');
    };
  }, []);

  return ref;
}
