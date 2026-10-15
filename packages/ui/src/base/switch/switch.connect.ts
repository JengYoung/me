import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RefCallback } from 'react';
import { switchChecked } from "./switch.machine";
import type { SwitchOptions, SwitchSchema } from "./switch.machine";

export function connectSwitch(
  service: MachineApi<SwitchSchema>,
  options: SwitchOptions & { id: string },
  inputRef: RefCallback<HTMLInputElement>,
) {
  const checked = switchChecked(options, service.state);
  const data = {
    'data-scope': 'switch',
    'data-state': checked ? 'on' : 'off',
    'data-disabled': options.disabled || undefined,
  } as const;
  return {
    checked,
    setChecked: (next: boolean) => service.send({ type: 'SET', checked: next }),
    toggle: () => service.send({ type: 'TOGGLE' }),
    getInputProps(props: PartProps<'input'> = {}): PartProps<'input'> {
      const { defaultChecked: _default, 'aria-checked': _ariaChecked, onChange, ...user } = props;
      return mergeProps<'input'>(user, {
        ...data,
        'data-part': 'input',
        id: options.id,
        ref: inputRef,
        type: 'checkbox',
        role: 'switch',
        checked,
        disabled: options.disabled || props.disabled,
        required: options.required,
        name: options.name,
        value: options.value ?? 'on',
        form: options.form,
        onChange: (event) => {
          try {
            onChange?.(event);
            if (!event.defaultPrevented && !event.currentTarget.disabled) service.send({ type: 'TOGGLE' });
          } finally {
            event.currentTarget.checked = switchChecked(service.getProps(), service.getSnapshot());
          }
        },
      });
    },
    getLabelProps: (props: PartProps<'label'> = {}): PartProps<'label'> =>
      mergeProps<'label'>(props, { ...data, 'data-part': 'label', htmlFor: options.id }),
    getIndicatorProps: (props: PartProps<'span'> = {}): PartProps<'span'> =>
      mergeProps<'span'>(props, { ...data, 'data-part': 'indicator', 'aria-hidden': true }),
  };
}
export type SwitchApi = ReturnType<typeof connectSwitch>;
