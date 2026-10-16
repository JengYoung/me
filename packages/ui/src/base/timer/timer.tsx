'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useTimer } from './use-timer';
import type { TimerApi, TimerAction, TimerOptions } from './use-timer';

const Context = createContext<TimerApi | null>(null);
function useTimerContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Timer parts must be rendered inside Timer.Root.');
  return api;
}
export type TimerRootProps = TimerOptions & PartProps<'div'>;
export function TimerRoot({ mode, duration, interval, autoStart, onComplete, ...props }: TimerRootProps) {
  const api = useTimer({ mode, duration, interval, autoStart, onComplete });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export function TimerValue(props: PartProps<'span'>) {
  return <span {...useTimerContext().getValueProps(props)} />;
}
export type TimerControlProps = PartProps<'button'> & { action: TimerAction };
export function TimerControl({ action, ...props }: TimerControlProps) {
  return <button {...useTimerContext().getControlProps(action, props)} />;
}
export const Timer = { Root: TimerRoot, Value: TimerValue, Control: TimerControl };
