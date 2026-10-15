import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { TimerAction, TimerOptions, TimerSchema } from "./timer.machine";

export function connectTimer(machine: MachineApi<TimerSchema>, options: TimerOptions) {
  const { state, send, getProps } = machine;
  const mode = options.mode ?? 'countdown';
  const elapsed = state.context.elapsed;
  const remaining = mode === 'countdown' ? Math.max(0, (options.duration ?? 60_000) - elapsed) : null;
  const value = remaining ?? elapsed;
  const seconds = mode === 'countdown' ? Math.ceil(value / 1000) : Math.floor(value / 1000);
  const parts = { hours: Math.floor(seconds / 3600), minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
  const formatted = [parts.hours, parts.minutes, parts.seconds].map((part) => String(part).padStart(2, '0')).join(':');
  const start = () => send({ type: 'START', now: getProps().now() });
  const pause = () => send({ type: 'PAUSE', now: getProps().now() });
  const resume = () => send({ type: 'RESUME', now: getProps().now() });
  const reset = () => send({ type: 'RESET' });
  const restart = () => send({ type: 'RESTART', now: getProps().now() });
  const actions = { start, pause, resume, reset, restart };
  return {
    state: state.value,
    mode,
    elapsed,
    remaining,
    value,
    parts,
    formatted,
    ...actions,
    getRootProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        'data-scope': 'timer',
        'data-part': 'root',
        'data-state': state.value,
        'data-mode': mode,
      });
    },
    getValueProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, {
        role: 'timer',
        'aria-live': 'off',
        'aria-atomic': true,
        'data-scope': 'timer',
        'data-part': 'value',
        children: user.children ?? formatted,
      });
    },
    getControlProps(action: TimerAction, user: PartProps<'button'> = {}): PartProps<'button'> {
      const disabled =
        action === 'start'
          ? state.value !== 'idle'
          : action === 'pause'
            ? state.value !== 'running'
            : action === 'resume'
              ? state.value !== 'paused'
              : false;
      return mergeProps<'button'>(user, {
        type: 'button',
        disabled: disabled || user.disabled,
        'data-scope': 'timer',
        'data-part': 'control',
        'data-action': action,
        onClick: () => {
          if (!user.disabled) actions[action]();
        },
      });
    },
  };
}
export type TimerApi = ReturnType<typeof connectTimer>;
