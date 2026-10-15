'use client';

import { useField } from '../field/index';
import type { FieldOptions } from '../field/index';
import { mergeRefs, useFormReset } from '../_shared/react/index';
import { useCallback, useMemo, useRef, useState } from 'react';
import { connectTextField } from './text-field.connect';

export type TextFieldType = 'text' | 'search' | 'email' | 'tel' | 'url' | 'password';
export interface TextFieldOptions extends Omit<FieldOptions, 'label'> {
  type?: TextFieldType;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  form?: string;
}

/** The DOM owns uncontrolled text. No mirrored value or text-editing state machine. */
export function useTextField(options: TextFieldOptions = {}) {
  const [initial] = useState(() => ({ controlled: options.value !== undefined, defaultValue: options.defaultValue }));
  if (initial.controlled !== (options.value !== undefined)) throw new Error('Text Field cannot switch control modes.');
  if (!['text', 'search', 'email', 'tel', 'url', 'password'].includes(options.type ?? 'text'))
    throw new Error('Text Field supports text, search, email, tel, url and password inputs.');
  const field = useField(options);
  const node = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const register = useCallback((control: HTMLInputElement | HTMLTextAreaElement | null) => {
    node.current = control;
    return () => {
      if (node.current === control) node.current = null;
    };
  }, []);
  const reset = useCallback(
    (control: HTMLInputElement | HTMLTextAreaElement) => {
      if (options.value !== undefined) control.value = options.value;
    },
    [options.value],
  );
  const resetRef = useFormReset(options.form, reset);
  // mergeRefs only creates a callback; ref reads/writes occur during React commit.
  // oxlint-disable-next-line react/refs
  const ref = useMemo(() => mergeRefs(register, resetRef), [register, resetRef]);
  const getValue = useCallback(() => node.current?.value, []);
  // connect stores refs and DOM commands without invoking them during render.
  // oxlint-disable-next-line react/refs
  return connectTextField(field, { ...options, defaultValue: initial.defaultValue }, ref, getValue);
}

export type { TextFieldApi, TextFieldInputProps, TextFieldTextareaProps } from './text-field.connect';
