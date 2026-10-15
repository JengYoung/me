'use client';
import { useMachine } from '../_shared/react/index';
import { timerMachine, validateTimer } from './timer.machine';
import type { TimerOptions } from './timer.machine';
import { connectTimer } from './timer.connect';

export function useTimer(options: TimerOptions = {}) {
  validateTimer(options);
  return connectTimer(useMachine(timerMachine, { props: { ...options, now: Date.now } }), options);
}
export type { TimerOptions, TimerState, TimerAction } from './timer.machine';
export type { TimerApi } from './timer.connect';
