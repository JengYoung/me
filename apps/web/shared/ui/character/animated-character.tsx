'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';
import { Character } from './character';
import type { CharacterProps } from './character';
import { createCharacterAnimation } from './character-animation';

export interface AnimatedCharacterProps extends Omit<CharacterProps, 'motionTransforms'> {
  playing?: boolean;
  speed?: number;
  loop?: boolean;
  replayKey?: number;
}

export const AnimatedCharacter = forwardRef<SVGSVGElement, AnimatedCharacterProps>(
  (
    { expression = 'neutral', showEffects = true, playing = true, speed = 1, loop = true, replayKey = 0, ...props },
    forwardedRef,
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const playback = useRef({ playing, speed });
    const syncPlayback = useRef<(() => void) | null>(null);

    useImperativeHandle(forwardedRef, () => svgRef.current!);

    useEffect(() => {
      playback.current = { playing, speed };
      syncPlayback.current?.();
    }, [playing, speed]);

    useEffect(() => {
      const svg = svgRef.current;
      if (!svg) return;
      const media = gsap.matchMedia();

      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          const animation = createCharacterAnimation(svg, expression, loop);
          let visible = typeof IntersectionObserver === 'undefined';
          const sync = () => {
            const { playing: requested, speed: requestedSpeed } = playback.current;
            const rate = Number.isFinite(requestedSpeed) ? Math.min(3, Math.max(0.1, requestedSpeed)) : 1;
            animation.timeline.timeScale(rate).paused(!requested || !visible || document.hidden);
          };
          const observer =
            typeof IntersectionObserver === 'undefined'
              ? undefined
              : new IntersectionObserver(([entry]) => {
                  visible = entry?.isIntersecting ?? false;
                  sync();
                });
          observer?.observe(svg);
          document.addEventListener('visibilitychange', sync);
          syncPlayback.current = sync;
          sync();

          return () => {
            observer?.disconnect();
            document.removeEventListener('visibilitychange', sync);
            syncPlayback.current = null;
            animation.dispose();
          };
        },
        svg,
      );

      return () => media.revert();
    }, [expression, showEffects, loop, replayKey]);

    return (
      <Character
        key={`${expression}-${showEffects}`}
        {...props}
        ref={svgRef}
        expression={expression}
        showEffects={showEffects}
      />
    );
  },
);

AnimatedCharacter.displayName = 'AnimatedCharacter';
