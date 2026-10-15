import { mergeProps } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';
import type { FieldOptions } from './use-field';

function idRefs(...values: (string | undefined | false)[]): string | undefined {
  const ids = values.flatMap((value) => (value ? value.trim().split(/\s+/).filter(Boolean) : []));
  return [...new Set(ids)].join(' ') || undefined;
}

export function connectField(options: FieldOptions & { id: string }) {
  const ids = {
    control: options.id,
    label: options.ids?.label ?? `${options.id}-label`,
    description: options.ids?.description ?? `${options.id}-description`,
    error: options.ids?.error ?? `${options.id}-error`,
  };
  const data = (part: string) => ({
    'data-scope': 'field',
    'data-part': part,
    'data-disabled': options.disabled ? '' : undefined,
    'data-invalid': options.invalid ? '' : undefined,
    'data-required': options.required ? '' : undefined,
    'data-readonly': options.readOnly ? '' : undefined,
  });
  function controlAttributes(user: { 'aria-describedby'?: string }) {
    return {
      ...data('control'),
      id: ids.control,
      'aria-invalid': options.invalid,
      'aria-describedby': idRefs(
        user['aria-describedby'],
        options.description && ids.description,
        ...(options.descriptionIds ?? []),
        options.invalid && options.error && ids.error,
        ...(options.invalid ? (options.errorIds ?? []) : []),
      ),
    };
  }
  return {
    ids,
    required: !!options.required,
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    invalid: !!options.invalid,
    getRootProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, data('root'));
    },
    getControlProps(user: PartProps<'input'> = {}): PartProps<'input'> {
      return mergeProps<'input'>(user, {
        ...controlAttributes(user),
        required: options.required,
        disabled: options.disabled,
        readOnly: options.readOnly,
      });
    },
    getTextareaProps(user: PartProps<'textarea'> = {}): PartProps<'textarea'> {
      return mergeProps<'textarea'>(user, {
        ...controlAttributes(user),
        required: options.required,
        disabled: options.disabled,
        readOnly: options.readOnly,
      });
    },
    getSelectProps(user: PartProps<'select'> = {}): PartProps<'select'> {
      return mergeProps<'select'>(user, {
        ...controlAttributes(user),
        required: options.required,
        disabled: options.disabled,
      });
    },
    getCustomControlProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        ...controlAttributes(user),
        'aria-labelledby': idRefs(user['aria-labelledby'], options.label !== false && ids.label),
        'aria-required': options.required,
        'aria-disabled': options.disabled,
        'aria-readonly': options.readOnly,
      });
    },
    getLabelProps(user: PartProps<'label'> = {}): PartProps<'label'> {
      return mergeProps<'label'>(user, { ...data('label'), id: ids.label, htmlFor: ids.control });
    },
    getCustomLabelProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, { ...data('label'), id: ids.label });
    },
    getDescriptionProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, { ...data('description'), id: user.id ?? ids.description });
    },
    getErrorProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, { ...data('error'), id: user.id ?? ids.error, hidden: !options.invalid });
    },
  };
}

export type FieldApi = ReturnType<typeof connectField>;
