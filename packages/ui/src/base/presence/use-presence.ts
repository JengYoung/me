'use client';

import { useMachine } from '../_shared/react/index';
import { useEffect, useLayoutEffect, useState } from 'react';
import { presenceMachine, presenceState } from './presence.machine';
import type { PresenceOptions } from './presence.machine';
import { connectPresence } from './presence.connect';
import { observeMotion } from './presence.dom';

const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

export function usePresence(options: PresenceOptions) {
  const maxDuration = options.maxDuration ?? 10_000;
  if (!Number.isFinite(maxDuration) || maxDuration < 0 || maxDuration > 2_147_483_647)
    throw new Error('Presence maxDuration must be between 0 and 2,147,483,647 milliseconds.');
  const { state, send } = useMachine(presenceMachine, { props: options });
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const phase = presenceState(state.value, options);
  const generation = state.context.generation;

  useCommitEffect(() => {
    if (phase !== state.value || (phase !== 'entering' && phase !== 'exiting')) return;
    const complete = () => send({ type: 'COMPLETE', generation });
    if (element) return observeMotion(element, maxDuration, complete);
    // A ref attaches before the next commit. A missing ref must not wait forever either.
    const timer = setTimeout(complete, 0);
    return () => clearTimeout(timer);
  }, [element, phase, state.value, generation, maxDuration, send]);

  return connectPresence(state.value, options, setElement);
}

export type { PresenceApi } from './presence.connect';
export type { PresenceOptions, PresenceState } from './presence.machine';
