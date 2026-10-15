import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RefCallback } from 'react';
import { checkboxChecked } from "./checkbox.machine";
import type { CheckboxOptions, CheckboxSchema, CheckedState } from "./checkbox.machine";

export function connectCheckbox(
  service: MachineApi<CheckboxSchema>,
  options: CheckboxOptions & { id: string },
  inputRef: RefCallback<HTMLInputElement>,
) {
  const checked = checkboxChecked(options, service.state);
  const data = {
    'data-scope': 'checkbox',
    'data-state': checked === 'mixed' ? 'mixed' : checked ? 'checked' : 'unchecked',
    'data-disabled': options.disabled || undefined,
  } as const;
  return {
    checked,
    setChecked: (next: CheckedState) => service.send({ type: 'SET', checked: next }),
    toggle: () => service.send({ type: 'TOGGLE' }),
    getInputProps(props: PartProps<'input'> = {}): PartProps<'input'> {
      const { defaultChecked: _default, onChange, ...user } = props;
      return mergeProps<'input'>(user, {
        ...data,
        'data-part': 'input',
        id: options.id,
        ref: inputRef,
        type: 'checkbox',
        checked: checked === true,
        'aria-checked': checked,
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
            const next = checkboxChecked(service.getProps(), service.getSnapshot());
            event.currentTarget.checked = next === true;
            event.currentTarget.indeterminate = next === 'mixed';
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
export type CheckboxApi = ReturnType<typeof connectCheckbox>;
