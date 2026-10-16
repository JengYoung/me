import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import { buttonPressed } from './button.machine';
import type { ButtonOptions, ButtonSchema } from './button.machine';

export function connectButton(service: MachineApi<ButtonSchema>, options: ButtonOptions) {
  const pressed = buttonPressed(options, service.state);
  return {
    pressed,
    press: () => service.send({ type: 'ACTIVATE' }),
    setPressed: (next: boolean) => service.send({ type: 'SET', pressed: next }),
    getButtonProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      const { 'aria-pressed': _pressed, ...user } = props;
      const disabled = !!options.disabled || !!props.disabled;
      return mergeProps<'button'>(user, {
        type: props.type ?? 'button',
        disabled,
        'aria-pressed': options.toggle ? pressed : undefined,
        'data-scope': 'button',
        'data-part': 'root',
        'data-state': options.toggle ? (pressed ? 'on' : 'off') : undefined,
        'data-disabled': disabled || undefined,
        onClick: () => {
          if (!disabled) service.send({ type: 'ACTIVATE' });
        },
      });
    },
  };
}
export type ButtonApi = ReturnType<typeof connectButton>;
