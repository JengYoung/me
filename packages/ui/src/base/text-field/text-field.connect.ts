import type { FieldApi } from "../field/index";
import { mergeProps } from "../_shared/react/index";
import type { PartProps } from "../_shared/react/index";
import type { RefCallback } from 'react';
import type { TextFieldOptions } from "./use-text-field";

type Owned = 'value' | 'defaultValue' | 'name' | 'form' | 'id' | 'type';
export type TextFieldInputProps = Omit<PartProps<'input'>, Owned>;
export type TextFieldTextareaProps = Omit<PartProps<'textarea'>, Owned>;

export function connectTextField(
  field: FieldApi,
  options: TextFieldOptions,
  ref: RefCallback<HTMLInputElement | HTMLTextAreaElement>,
  getValue: () => string | undefined,
) {
  const data = (part: string) => ({ 'data-scope': 'text-field', 'data-part': part });
  return {
    ids: field.ids,
    getValue,
    getRootProps(user: PartProps<'div'> = {}) {
      return mergeProps<'div'>(field.getRootProps(user), data('root'));
    },
    getLabelProps(user: PartProps<'label'> = {}) {
      return mergeProps<'label'>(field.getLabelProps(user), data('label'));
    },
    getDescriptionProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(field.getDescriptionProps(user), data('description'));
    },
    getErrorProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(field.getErrorProps(user), data('error'));
    },
    getInputProps(user: TextFieldInputProps = {}): PartProps<'input'> {
      const props = field.getControlProps(user);
      delete props.value;
      delete props.defaultValue;
      props.name = options.name;
      props.form = options.form;
      return mergeProps<'input'>(props, {
        ...data('input'),
        type: options.type ?? 'text',
        ref,
        ...(options.value === undefined ? { defaultValue: options.defaultValue } : { value: options.value }),
        onChange(event) {
          if (!event.currentTarget.disabled && !event.currentTarget.readOnly)
            options.onValueChange?.(event.currentTarget.value);
        },
      });
    },
    getTextareaProps(user: TextFieldTextareaProps = {}): PartProps<'textarea'> {
      const props = field.getTextareaProps(user);
      delete props.value;
      delete props.defaultValue;
      props.name = options.name;
      props.form = options.form;
      return mergeProps<'textarea'>(props, {
        ...data('textarea'),
        ref,
        ...(options.value === undefined ? { defaultValue: options.defaultValue } : { value: options.value }),
        onChange(event) {
          if (!event.currentTarget.disabled && !event.currentTarget.readOnly)
            options.onValueChange?.(event.currentTarget.value);
        },
      });
    },
  };
}
export type TextFieldApi = ReturnType<typeof connectTextField>;
