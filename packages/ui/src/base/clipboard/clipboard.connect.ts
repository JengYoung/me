import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { ClipboardOptions, ClipboardSchema } from './clipboard.machine';

export function connectClipboard(machine: MachineApi<ClipboardSchema>, options: ClipboardOptions) {
  const { state, send } = machine;
  const copy = () => send({ type: 'COPY' });
  const reset = () => send({ type: 'RESET' });
  const feedback =
    state.value === 'success'
      ? (options.messages?.success ?? 'Copied to clipboard.')
      : state.value === 'error'
        ? (options.messages?.error ?? 'Could not copy.')
        : '';
  return {
    state: state.value,
    copied: state.value === 'success',
    copiedValue: state.context.copiedValue,
    error: state.context.error,
    feedback,
    copy,
    reset,
    getRootProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, { 'data-scope': 'clipboard', 'data-part': 'root', 'data-state': state.value });
    },
    getTriggerProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        type: 'button',
        disabled: options.disabled || user.disabled,
        'aria-busy': state.value === 'pending',
        'data-scope': 'clipboard',
        'data-part': 'trigger',
        'data-state': state.value,
        onClick: () => {
          if (!user.disabled) copy();
        },
      });
    },
    getFeedbackProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, {
        role: 'status',
        'aria-live': 'polite',
        'aria-atomic': true,
        'data-scope': 'clipboard',
        'data-part': 'feedback',
        'data-state': state.value,
        children: user.children ?? feedback,
      });
    },
  };
}
export type ClipboardApi = ReturnType<typeof connectClipboard>;
