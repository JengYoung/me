'use client';

import { useEffect, useRef } from 'react';

/** Carousel의 재생 상태를 표시한다. 슬라이드 전환 타이머는 Carousel 한 곳에서만 소유한다. */
export function CarouselPlaybackProgress({
  value,
  running,
  duration,
  className,
  disabled = false,
}: {
  value: string | null;
  running: boolean;
  duration: number;
  className?: string;
  disabled?: boolean;
}) {
  const indicator = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation | null>(null);

  useEffect(
    () => () => {
      animation.current?.cancel();
      animation.current = null;
    },
    [value, duration],
  );

  useEffect(() => {
    if (disabled) {
      animation.current?.cancel();
      animation.current = null;
      return;
    }
    if (!running) {
      animation.current?.pause();
      return;
    }
    animation.current?.cancel();
    // Carousel은 재생 재개 시 현재 슬라이드의 interval을 새로 시작한다.
    animation.current =
      indicator.current?.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
        duration,
        easing: 'linear',
        fill: 'forwards',
      }) ?? null;
  }, [value, running, duration, disabled]);

  return <span ref={indicator} className={className} data-playback-progress data-running={running} />;
}
