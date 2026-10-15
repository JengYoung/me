'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useField } from "../field/index";
import type { FieldOptions } from "../field/index";
import { mergeRefs, useFormReset, useMachine } from "../_shared/react/index";
import { normalizeOtp, otpInputMachine, otpValue } from "./otp-input.machine";
import type { OtpInputBehaviorOptions } from "./otp-input.machine";
import { connectOtpInput } from "./otp-input.connect";

export interface OtpInputOptions extends OtpInputBehaviorOptions, Omit<FieldOptions, 'label'> {
  name?: string;
  form?: string;
}
export function useOtpInput(options: OtpInputOptions = {}) {
  const [controlled] = useState(options.value !== undefined);
  if (controlled !== (options.value !== undefined)) throw new Error('OTP Input cannot switch control modes.');
  const length = options.length ?? 6;
  if (!Number.isSafeInteger(length) || length < 1) throw new Error('OTP Input length must be a positive integer.');
  const machine = useMachine(otpInputMachine, { props: options });
  const { state, send, getProps, getSnapshot } = machine;
  const field = useField(options);
  const input = useRef<HTMLInputElement | null>(null);
  const register = useCallback((node: HTMLInputElement | null) => {
    input.current = node;
    return () => {
      if (input.current === node) input.current = null;
    };
  }, []);
  const reset = useCallback(
    (node: HTMLInputElement) => {
      send({ type: 'RESET' });
      node.value = otpValue(getProps(), getSnapshot().context);
    },
    [send, getProps, getSnapshot],
  );
  const resetRef = useFormReset(options.form, reset);
  // Ref callbacks are invoked by React during commit, never during render.
  // oxlint-disable-next-line react/refs
  const ref = useMemo(() => mergeRefs(register, resetRef), [register, resetRef]);
  const select = useCallback(
    (node: HTMLInputElement) => {
      send({
        type: 'SELECT',
        start: Array.from(node.value.slice(0, node.selectionStart ?? 0)).length,
        end: Array.from(node.value.slice(0, node.selectionEnd ?? 0)).length,
      });
    },
    [send],
  );
  const change = useCallback(
    (node: HTMLInputElement, compositionEnd = false) => {
      const caret = normalizeOtp(node.value.slice(0, node.selectionStart ?? node.value.length), getProps()).length;
      send({ type: compositionEnd ? 'COMPOSITION_END' : 'INPUT', value: node.value });
      const snapshot = getSnapshot();
      if (snapshot.context.draft === null) {
        const accepted = otpValue(getProps(), snapshot.context);
        if (node.value !== accepted) {
          node.value = accepted;
          node.setSelectionRange(caret, caret);
        }
      }
      select(node);
    },
    [send, getProps, getSnapshot, select],
  );
  const setValue = useCallback((value: string) => send({ type: 'INPUT', value }), [send]);
  const focus = useCallback(
    (index?: number) => {
      if (getSnapshot().status !== 'active' || getProps().disabled || !input.current) return;
      input.current.focus();
      if (index !== undefined) {
        const offset = Array.from(input.current.value).slice(0, Math.max(0, index)).join('').length;
        input.current.setSelectionRange(offset, offset);
        select(input.current);
      }
    },
    [getProps, getSnapshot, select],
  );
  const activateSlot = useCallback(
    (index: number) => {
      const snapshot = getSnapshot();
      const props = getProps();
      const node = input.current;
      if (snapshot.status !== 'active' || snapshot.context.draft !== null || props.disabled || !node) return;
      node.focus();
      const characters = Array.from(node.value);
      const position = Math.min(index, (props.length ?? 6) - 1);
      const start = characters.slice(0, position).join('').length;
      node.setSelectionRange(start, start + (characters[position]?.length ?? 0));
      select(node);
    },
    [getProps, getSnapshot, select],
  );
  // Connect stores the ref and commands without reading DOM during render.
  // oxlint-disable-next-line react/refs
  return connectOtpInput(field, options, state, { ref, change, select, send, setValue, focus, activateSlot });
}
export type { OtpInputApi, OtpInputInputProps } from "./otp-input.connect";
