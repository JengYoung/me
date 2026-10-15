'use client';

import { useField } from "../field/index";
import type { FieldOptions } from "../field/index";
import { mergeRefs, useFormReset } from "../_shared/react/index";
import { useCallback, useMemo, useRef, useState } from 'react';
import { connectNativeSelect } from "./native-select.connect";

export type NativeSelectOptions = Omit<FieldOptions, 'readOnly' | 'label'> & { name?: string; form?: string } & (
    | { multiple?: false; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
    | {
        multiple: true;
        value?: readonly string[];
        defaultValue?: readonly string[];
        onValueChange?: (value: string[]) => void;
      }
  );

export function useNativeSelect(
  options?: Extract<NativeSelectOptions, { multiple?: false }>,
): ReturnType<typeof connectNativeSelect>;
export function useNativeSelect(
  options: Extract<NativeSelectOptions, { multiple: true }>,
): ReturnType<typeof connectNativeSelect>;
export function useNativeSelect(options: NativeSelectOptions): ReturnType<typeof connectNativeSelect>;
export function useNativeSelect(options: NativeSelectOptions = {}) {
  const [initial] = useState(() => ({
    controlled: options.value !== undefined,
    multiple: !!options.multiple,
    defaultValue: Array.isArray(options.defaultValue) ? [...options.defaultValue] : options.defaultValue,
  }));
  if (initial.controlled !== (options.value !== undefined) || initial.multiple !== !!options.multiple)
    throw new Error('Native Select cannot switch control or selection modes. Remount with a different key.');
  if (
    options.value !== undefined &&
    (options.multiple ? !Array.isArray(options.value) : typeof options.value !== 'string')
  )
    throw new Error('Native Select needs a string for single selection and an array for multiple selection.');
  const field = useField(options);
  const node = useRef<HTMLSelectElement | null>(null);
  const register = useCallback((control: HTMLSelectElement | null) => {
    node.current = control;
    return () => {
      if (node.current === control) node.current = null;
    };
  }, []);
  const reset = useCallback(
    (control: HTMLSelectElement) => {
      if (options.value === undefined) return;
      if (options.multiple) {
        const selected = new Set(options.value);
        for (const option of control.options) option.selected = selected.has(option.value);
      } else control.value = options.value;
    },
    [options.multiple, options.value],
  );
  const resetRef = useFormReset(options.form, reset);
  // mergeRefs only creates a callback; ref reads/writes occur during React commit.
  // oxlint-disable-next-line react/refs
  const ref = useMemo(() => mergeRefs(register, resetRef), [register, resetRef]);
  const getValue = useCallback(() => {
    const control = node.current;
    return control
      ? control.multiple
        ? Array.from(control.selectedOptions, (option) => option.value)
        : control.value
      : undefined;
  }, []);
  // connect stores refs and DOM commands without invoking them during render.
  // oxlint-disable-next-line react/refs
  return connectNativeSelect(field, options, initial.defaultValue, ref, getValue);
}
export type { NativeSelectApi, NativeSelectControlProps } from "./native-select.connect";
