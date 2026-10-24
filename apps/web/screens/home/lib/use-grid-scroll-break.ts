'use client';

import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/**
 * 이 화면에 진입하면 맨 위에서 시작하고, 문서가 실제로 아래로 움직일 때 한 번만
 * break합니다. 안내 버튼도 같은 동작을 실행합니다. 준비 전과 애니메이션 동안
 * 위치를 0으로 유지하고, released 이후에는 기본 스크롤을 사용합니다.
 */
export function useGridScrollBreak(released = false, ready = true) {
  const [broken, setBroken] = useState(false);
  const triggered = useRef(false);
  const readyRef = useRef(ready);
  const enhanced = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const locked = enhanced && (!ready || (broken && !released));

  useLayoutEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  const breakGrid = useCallback(() => {
    if (!readyRef.current || triggered.current) return;
    triggered.current = true;
    setBroken(true);
  }, []);

  useLayoutEffect(() => {
    const restoration = window.history.scrollRestoration;
    // 새로고침/뒤로 가기의 자동 위치 복원으로 입장 즉시 파동이 시작되지 않게 합니다.
    // 다른 페이지로 나가면 이전 설정을 돌려주므로 이 화면 밖의 스크롤 정책은 유지됩니다.
    window.history.scrollRestoration = 'manual';
    const startAtTop = () => {
      triggered.current = false;
      setBroken(false);
      // CSS scroll-behavior와 관계없이 첫 화면을 즉시 맞춥니다.
      window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
      window.addEventListener('scroll', onScroll, { passive: true });
    };
    const onScroll = () => {
      // 상단의 탄성 스크롤과 내부 스크롤 영역은 시작 조건이 아닙니다.
      // 이후 스크롤에서는 상태/Canvas를 갱신하지 않아 정지한 파편을 다시 그리지 않습니다.
      if (window.scrollY <= 0 || !readyRef.current) return;
      window.removeEventListener('scroll', onScroll);
      breakGrid();
    };

    startAtTop();
    // bfcache는 React를 다시 마운트하지 않으므로 복귀할 때도 시작 상태를 맞춥니다.
    window.addEventListener('pageshow', startAtTop);
    return () => {
      window.history.scrollRestoration = restoration;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pageshow', startAtTop);
    };
  }, [breakGrid]);

  useLayoutEffect(() => {
    if (!locked) return;

    const keepAtTop = () => {
      // 사용자 입력은 화면의 overflow 잠금이 처리합니다. 첫 스크롤과
      // 포커스 이동 등 프로그램에 의한 스크롤도 같은 원점에 맞춥니다.
      if (window.scrollY !== 0) window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
    };
    keepAtTop();
    window.addEventListener('scroll', keepAtTop, { passive: true });
    return () => window.removeEventListener('scroll', keepAtTop);
  }, [locked]);

  return { broken, breakGrid, locked };
}
