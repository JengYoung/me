/** Observe browser-owned motion without changing styles, playback, focus or visibility. */
export function observeMotion(element: HTMLElement, maxDuration: number, complete: () => void): () => void {
  const view = element.ownerDocument.defaultView;
  const media = view?.matchMedia?.('(prefers-reduced-motion: reduce)');
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const dispose = () => {
    disposed = true;
    clearTimeout(timer);
    media?.removeEventListener('change', onPreference);
  };
  const finish = () => {
    if (disposed) return;
    dispose();
    complete();
  };
  function onPreference(event: MediaQueryListEvent) {
    if (event.matches) finish();
  }
  if (media?.matches || maxDuration === 0 || !element.getAnimations) {
    finish();
    return dispose;
  }

  // getAnimations flushes pending style changes and includes CSS transitions and animations.
  // The explicit target check also excludes descendants and pseudo-elements.
  const animations = element.getAnimations().filter((animation) => {
    const effect = animation.effect as KeyframeEffect | null;
    return (
      effect?.target === element &&
      !effect.pseudoElement &&
      animation.playState !== 'finished' &&
      animation.playState !== 'idle'
    );
  });
  if (!animations.length) {
    finish();
    return dispose;
  }

  const remaining = animations.map((animation) => {
    const end = Number(animation.effect?.getComputedTiming().endTime);
    const current = Number(animation.currentTime ?? 0);
    const rate = animation.playbackRate;
    if (animation.playState === 'paused' || rate === 0 || !Number.isFinite(end) || !Number.isFinite(current))
      return maxDuration;
    return Math.max(0, (rate < 0 ? current : end - current) / Math.abs(rate));
  });
  timer = setTimeout(finish, Math.min(maxDuration, Math.max(...remaining) + 50));
  media?.addEventListener('change', onPreference);
  // Rejection means cancellation. All captured motions must finish or cancel before removal.
  void Promise.all(animations.map((animation) => animation.finished.catch(() => undefined))).then(finish);
  return dispose;
}
