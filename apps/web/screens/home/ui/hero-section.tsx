'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { GridBackground, type GridBackgroundPhase } from '../../../shared/ui/grid-background';
import { useGridScrollBreak } from '../lib/use-grid-scroll-break';
import styles from './hero-section.module.css';

// 캐릭터와 GSAP은 블록이 깨져 소개가 나타날 때만 필요합니다.
const AnimatedCharacter = dynamic(
  () => import('../../../shared/ui/character').then((module) => module.AnimatedCharacter),
  {
    ssr: false,
  },
);

export function HeroSection({ children }: { children?: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settled, setSettled] = useState(false);
  const [docked, setDocked] = useState(false);
  const [transitionFinished, setTransitionFinished] = useState(false);
  const released = settled && transitionFinished;
  const { broken, breakGrid, locked } = useGridScrollBreak(released, ready);
  const hasMoved = useRef(false);
  const transitionRef = useRef<ViewTransition | null>(null);

  useEffect(
    () => () => {
      transitionRef.current?.skipTransition();
      transitionRef.current = null;
    },
    [],
  );

  const onPhaseChange = useCallback((phase: GridBackgroundPhase) => {
    if (phase === 'pulse') {
      // 첫 Canvas 프레임 또는 대체 화면이 준비된 뒤에만 입력을 받습니다.
      setReady(true);
      transitionRef.current?.skipTransition();
      transitionRef.current = null;
      hasMoved.current = false;
      setSettled(false);
      setDocked(false);
      setTransitionFinished(false);
      return;
    }
    if (phase === 'settled') setSettled(true);
    // 블록이 깨지는 순간 이동합니다. 모션 감소나 Canvas 미지원은 settled로 바로 옵니다.
    // 제목 이동도 입장마다 한 번만 실행합니다.
    if ((phase !== 'breaking' && phase !== 'settled') || hasMoved.current) return;
    hasMoved.current = true;

    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDocked(true);
      setTransitionFinished(true);
      return;
    }

    const transition = document.startViewTransition(() => {
      // 페이지 복귀나 언마운트로 취소된 이전 전환은 새 상태를 덮어쓰지 않습니다.
      if (transitionRef.current !== transition) return;
      flushSync(() => setDocked(true));
    });
    transitionRef.current = transition;

    const finishTransition = () => {
      if (transitionRef.current !== transition) return;
      transitionRef.current = null;
      setTransitionFinished(true);
    };
    // 전환이 생략되거나 중단돼도 DOM 변경과 스크롤 해제는 끝까지 처리합니다.
    void transition.ready.catch(() => {});
    void transition.finished.then(finishTransition, finishTransition);
  }, []);

  const positioned = broken && docked;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      data-scroll-locked={locked}
      className={`${styles.hero} relative isolate bg-bg-surface text-ink`}
    >
      <GridBackground broken={broken} onPhaseChange={onPhaseChange} />

      <section aria-label="인터랙티브 그리드" className="relative z-0 min-h-[calc(100svh-var(--spacing-64px))]">
        <div
          data-hero-copy
          data-position={positioned ? 'relative' : 'fixed'}
          className={`${styles.copy} flex min-h-[calc(100svh-var(--spacing-64px))] w-full flex-col ${positioned ? 'relative' : 'fixed inset-x-0 top-64px'}`}
        >
          <div
            className={`${styles.copyInner} flex w-full max-w-7xl flex-1 flex-col self-center gap-24px mobile:px-24px mobile:py-48px desktop:p-64px ${positioned ? 'justify-start text-center' : 'justify-center'}`}
          >
            <h1
              className={
                positioned
                  ? 'mobile:text-heading-5 desktop:text-heading-1'
                  : 'mobile:text-heading-3 desktop:text-heading-1'
              }
              data-grid-avoid
            >
              <span className={styles.headingLine}>
                <strong className="font-bold text-action-primary-bg">Break</strong>
              </span>
              <br />
              <span className={styles.headingLine}>the Brake</span>
            </h1>
            <div
              className={`${styles.intro} flex flex-col items-center gap-24px`}
              data-revealed={transitionFinished}
              data-positioned={positioned}
            >
              <div className={`${styles.description} flex w-full max-w-lg flex-col gap-12px break-keep`}>
                <p className="text-title-3 text-balance text-ink desktop:text-title-2">
                  안녕하세요, 개발자 <strong className="font-semibold">황재영</strong>입니다.
                </p>
                <div className="flex flex-col gap-8px text-body-2 text-ink-secondary">
                  <p className="text-balance">
                    프론트엔드 개발을 주로 하며, <br />
                    개발 과정의 불편함을 발견하고 개선하는 데 관심이 많습니다.
                  </p>
                  <p className="text-balance">작은 넛지로 더 나은 변화를 만드는 일을 즐깁니다.</p>
                </div>
              </div>
              <div className={`${styles.character} w-56 max-w-full desktop:w-64`}>
                {positioned ? (
                  <AnimatedCharacter
                    expression="neutral"
                    size={256}
                    playing={transitionFinished}
                    className="block h-auto w-full"
                    decorative
                  />
                ) : (
                  <Image
                    src="/characters/character/00-neutral.svg"
                    alt=""
                    width={256}
                    height={256}
                    className="block h-auto w-full"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {ready && !broken && (
        <div
          className={`${styles.scrollPrompt} fixed inset-x-0 z-10 flex flex-col items-center gap-12px px-24px text-center`}
        >
          <p id="hero-scroll-hint" className="rounded-full bg-bg-surface px-16px py-8px text-body-3 text-ink-secondary">
            스크롤하거나 아래 버튼을 눌러주세요
          </p>
          <button
            type="button"
            aria-label="소개 보기"
            aria-describedby="hero-scroll-hint"
            className="inline-flex size-48px items-center justify-center rounded-full border border-border bg-bg-surface text-ink hover:bg-bg-subtle active:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            onClick={breakGrid}
          >
            <ChevronDown className={styles.scrollChevron} size={24} aria-hidden="true" />
          </button>
        </div>
      )}
      {/* 실제 본문은 문서 흐름에 두고, 앞쪽 Canvas만 뷰포트에 고정합니다. */}
      <div className="relative z-0 min-h-svh">{children}</div>
    </main>
  );
}
