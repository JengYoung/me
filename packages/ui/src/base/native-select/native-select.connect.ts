import type { FieldApi } from "../field/index";
import { mergeProps } from "../_shared/react/index";
import type { PartProps } from "../_shared/react/index";
import type { Ref } from 'react';
import type { NativeSelectOptions } from "./use-native-select";

export type NativeSelectControlProps = Omit<
  PartProps<'select'>,
  'value' | 'defaultValue' | 'multiple' | 'name' | 'form' | 'id'
>;
export function connectNativeSelect(
  field: FieldApi,
  options: NativeSelectOptions,
  defaultValue: string | readonly string[] | undefined,
  ref: Ref<HTMLSelectElement>,
  getValue: () => string | string[] | undefined,
) {
  const data = (part: string) => ({ 'data-scope': 'native-select', 'data-part': part });
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
    getSelectProps(user: NativeSelectControlProps = {}): PartProps<'select'> {
      const props = field.getSelectProps(user);
      delete props.value;
      delete props.defaultValue;
      props.name = options.name;
      props.form = options.form;
      return mergeProps<'select'>(props, {
        ...data('select'),
        ref,
        multiple: !!options.multiple,
        ...(options.value === undefined ? { defaultValue } : { value: options.value }),
        onChange(event) {
          if (event.currentTarget.disabled) return;
          if (options.multiple)
            options.onValueChange?.(Array.from(event.currentTarget.selectedOptions, (option) => option.value));
          else options.onValueChange?.(event.currentTarget.value);
        },
      });
    },
    getOptionProps(user: PartProps<'option'> = {}): PartProps<'option'> {
      return mergeProps<'option'>(user, data('option'));
    },
    getOptgroupProps(user: PartProps<'optgroup'> = {}): PartProps<'optgroup'> {
      return mergeProps<'optgroup'>(user, data('optgroup'));
    },
  };
}
export type NativeSelectApi = ReturnType<typeof connectNativeSelect>;
