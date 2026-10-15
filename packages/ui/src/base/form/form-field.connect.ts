import { mergeProps } from "../_shared/react/index";
import type { PartProps } from "../_shared/react/index";
import type { FieldApi } from "../field/index";
import type { RefCallback } from 'react';
import type { FormApi } from "./use-form";
import type { FormFieldOptions } from "./use-form-field";
import type { FormValue } from "./form.types";

export function connectFormField(
  form: FormApi,
  field: FieldApi,
  options: FormFieldOptions,
  ref: RefCallback<HTMLElement>,
) {
  const { name } = options;
  const value =
    (Object.hasOwn(form.snapshot.values, name) ? form.snapshot.values[name] : undefined) ?? options.defaultValue;
  const setValue = (next: FormValue) => form.adapter.setValue(name, next);
  const common = {
    name,
    form: form.id,
    ref,
    onBlur: () => form.adapter.touch(name),
    'data-scope': 'form',
    'data-part': 'control',
  };
  const disabled = field.disabled;
  const readOnly = field.readOnly;
  return {
    ...field,
    name,
    value,
    error: Object.hasOwn(form.snapshot.errors, name) ? form.snapshot.errors[name] : undefined,
    dirty: Object.hasOwn(form.snapshot.dirty, name) && !!form.snapshot.dirty[name],
    touched: Object.hasOwn(form.snapshot.touched, name) && !!form.snapshot.touched[name],
    validating: form.snapshot.validating.includes(name),
    setValue,
    getInputProps(user: PartProps<'input'> = {}): PartProps<'input'> {
      return mergeProps<'input'>(field.getControlProps(user), {
        ...common,
        disabled: disabled || !!user.disabled,
        readOnly: readOnly || !!user.readOnly,
        ...(options.kind === 'boolean'
          ? { type: 'checkbox', checked: value === true }
          : { value: typeof value === 'string' || typeof value === 'number' ? value : '' }),
        onChange(event) {
          if (!event.currentTarget.disabled && !event.currentTarget.readOnly)
            setValue(options.kind === 'boolean' ? event.currentTarget.checked : event.currentTarget.value);
        },
      });
    },
    getTextareaProps(user: PartProps<'textarea'> = {}): PartProps<'textarea'> {
      return mergeProps<'textarea'>(field.getTextareaProps(user), {
        ...common,
        value: typeof value === 'string' ? value : '',
        disabled: disabled || !!user.disabled,
        readOnly: readOnly || !!user.readOnly,
        onChange(event) {
          if (!event.currentTarget.disabled && !event.currentTarget.readOnly) setValue(event.currentTarget.value);
        },
      });
    },
    getSelectProps(user: PartProps<'select'> = {}): PartProps<'select'> {
      return mergeProps<'select'>(field.getSelectProps(user), {
        ...common,
        multiple: options.kind === 'multiple',
        value:
          options.kind === 'multiple' ? (Array.isArray(value) ? value : []) : typeof value === 'string' ? value : '',
        disabled: disabled || !!user.disabled,
        'aria-readonly': readOnly || undefined,
        onChange(event) {
          if (!event.currentTarget.disabled && !readOnly)
            setValue(
              options.kind === 'multiple'
                ? Array.from(event.currentTarget.selectedOptions, (item) => item.value)
                : event.currentTarget.value,
            );
        },
      });
    },
    getChoiceProps(choice: string, user: PartProps<'input'> = {}): PartProps<'input'> {
      const multiple = options.kind === 'multiple';
      return mergeProps<'input'>(field.getControlProps(user), {
        ...common,
        id: `${field.ids.control}-choice-${encodeURIComponent(choice)}`,
        type: multiple ? 'checkbox' : 'radio',
        value: choice,
        checked: multiple ? Array.isArray(value) && value.includes(choice) : value === choice,
        disabled: disabled || !!user.disabled,
        readOnly: readOnly || !!user.readOnly,
        onClick(event) {
          if (readOnly || user.readOnly) event.preventDefault();
        },
        onChange(event) {
          if (event.currentTarget.disabled || event.currentTarget.readOnly) return;
          const current = form.adapter.getSnapshot().values[name];
          setValue(
            multiple
              ? event.currentTarget.checked
                ? [...new Set([...(Array.isArray(current) ? current : []), choice])]
                : Array.isArray(current)
                  ? current.filter((item) => item !== choice)
                  : []
              : choice,
          );
        },
      });
    },
    getGroupProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return field.getCustomControlProps({ ...user, role: options.kind === 'single' ? 'radiogroup' : 'group' });
    },
  };
}
