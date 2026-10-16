'use client';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useField } from '../field/index';
import { connectFormField } from './form-field.connect';
import type { FormFieldRules } from './form.types';
import type { FormApi } from './use-form';

export interface FormFieldOptions extends FormFieldRules {
  name: string;
  kind?: 'text' | 'boolean' | 'single' | 'multiple';
  description?: boolean;
}
const useCommit = typeof document === 'undefined' ? useEffect : useLayoutEffect;
export function useFormField(form: FormApi, options: FormFieldOptions) {
  const { adapter, registerControl } = form;
  const { name } = options;
  const registration = useRef<ReturnType<typeof adapter.register> | null>(null);
  useCommit(() => {
    const field = adapter.register(name);
    registration.current = field;
    return () => {
      registration.current = null;
      field.unregister();
    };
  }, [adapter, name]);
  useCommit(() => registration.current?.update(options), [options]);
  const ref = useCallback(
    (node: HTMLElement | null) => (node ? registerControl(name, node) : undefined),
    [name, registerControl],
  );
  const rules = {
    ...adapter.getFieldRules(name),
    ...Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined)),
  };
  const error = Object.hasOwn(form.snapshot.errors, name) ? form.snapshot.errors[name] : undefined;
  const field = useField({
    id: `${form.id}-field-${encodeURIComponent(name)}`,
    description: options.description,
    error: true,
    invalid: !!error,
    required: rules.required,
    disabled: form.disabled || rules.disabled,
    readOnly: form.readOnly || rules.readOnly,
  });
  return connectFormField(form, field, { ...options, ...rules }, ref);
}
export type FormFieldApi = ReturnType<typeof useFormField>;
