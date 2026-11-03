'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { createHeroBackground, HeroBackgroundPhase } from '../lib/hero-background-canvas';

// 완성된 클래스 문자열을 역할별로 묶습니다. Tailwind가 빌드할 때 모든 상태를
// 찾을 수 있고, 프레임마다 React나 클래스 문자열을 갱신할 필요도 없습니다.
const GRID_CLASS_NAME = [
  // 격자는 글자 뒤에 고정합니다. 블록 아래의 링크·버튼·스크롤 입력은 그대로 통과합니다.
  'pointer-events-none fixed inset-0 -z-1 overflow-hidden contain-strict',
  // 격자 간격은 Canvas가 측정한 가로·세로 배율을 사용하며 선 색은 기존 Semantic 토큰입니다.
  '[--grid-cell-x:var(--spacing-24px)] [--grid-cell-y:var(--spacing-24px)]',
  'bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)]',
  'bg-size-[var(--grid-cell-x)_var(--grid-cell-y)]',
  // Canvas 컨트롤러가 data-phase를 바꾸면 CSS만으로 낙하 레이어를 본문 앞으로 올립니다.
  'data-[phase=breaking]:z-1 data-[phase=breaking]:bg-none',
  'data-[phase=settled]:z-1 data-[phase=settled]:bg-none',
].join(' ');

export type GridBackgroundProps = {
  /** true면 중앙 파동으로 모두 채운 뒤 앞쪽 1/3·먼 쪽 2/3으로 낙하합니다. false면 원래 그리드로 복구됩니다. */
  broken?: boolean;
  /** 셀의 수명과 물리 시간을 함께 정지합니다. 재개해도 시간이 건너뛰지 않습니다. */
  playing?: boolean;
  /** 희망하는 최소 격자 간격. 큰 화면은 전체 셀 수 예산에 맞춰 자동으로 넓어집니다. */
  cell?: number;
  /** 프레임이 아닌 단계 전이만 알립니다. settled는 마지막 블록까지 정지한 상태입니다. */
  onPhaseChange?: (phase: HeroBackgroundPhase) => void;
};

export function GridBackground({ broken = false, playing = true, cell = 24, onPhaseChange }: GridBackgroundProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controller = useRef<ReturnType<typeof createHeroBackground>>(null);
  const latest = useRef({ broken, playing, onPhaseChange });
  const loading = useRef(true);
  const startLoading = useRef<(() => void) | null>(null);

  const synchronize = useCallback(() => {
    const { broken, playing, onPhaseChange } = latest.current;
    if (controller.current) {
      controller.current.setPlaying(playing);
      controller.current.setBroken(broken);
    } else if (loading.current) {
      // 첫 화면 직후의 입력은 로딩을 앞당기고, 완료되면 최신 상태로 이어집니다.
      if (broken) startLoading.current?.();
    } else {
      // 모듈 로드 실패나 Canvas 미지원이어도 소개와 스크롤을 잠가 두지 않습니다.
      const phase = broken ? 'settled' : 'pulse';
      if (hostRef.current) hostRef.current.dataset.phase = phase;
      onPhaseChange?.(phase);
    }
  }, []);

  useEffect(() => {
    latest.current = { broken, playing, onPhaseChange };
    synchronize();
  }, [broken, playing, onPhaseChange, synchronize]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    let disposed = false;
    let started = false;
    let frame = 0;
    let timedOut = false;
    loading.current = true;
    // 청크 요청이 끝나지 않는 환경에서도 소개 버튼과 탐색을 계속 제공한다.
    const deadline = window.setTimeout(() => {
      timedOut = true;
      loading.current = false;
      cancelAnimationFrame(frame);
      startLoading.current = null;
      synchronize();
    }, 5000);

    const start = () => {
      if (disposed || timedOut || started) return;
      started = true;
      cancelAnimationFrame(frame);
      startLoading.current = null;
      void import('../lib/hero-background-canvas')
        .then(({ createHeroBackground }) => {
          if (disposed || timedOut) return;
          controller.current = createHeroBackground(host, canvas, cell, (phase) =>
            latest.current.onPhaseChange?.(phase),
          );
          loading.current = false;
          window.clearTimeout(deadline);
          synchronize();
        })
        .catch(() => {
          if (disposed) return;
          window.clearTimeout(deadline);
          loading.current = false;
          synchronize();
        });
    };
    startLoading.current = start;

    // CSS 격자와 문구가 한 프레임 표시된 뒤 Canvas 코드를 요청합니다.
    if (latest.current.broken) start();
    else frame = requestAnimationFrame(() => (frame = requestAnimationFrame(start)));

    // 로딩 중 이탈하거나 StrictMode가 재실행돼도 이전 요청이 Canvas를 만들지 않습니다.
    return () => {
      disposed = true;
      window.clearTimeout(deadline);
      cancelAnimationFrame(frame);
      startLoading.current = null;
      controller.current?.dispose();
      controller.current = null;
      loading.current = true;
    };
  }, [cell, synchronize]);

  return (
    <div ref={hostRef} className={GRID_CLASS_NAME} aria-hidden="true" data-grid-pulse>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
