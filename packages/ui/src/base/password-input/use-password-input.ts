'use client';

import { mergeRefs, useBooleanState, useFormReset } from "../_shared/react/index";
import { useTextField } from "../text-field/index";
import type { TextFieldOptions } from "../text-field/index";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { connectPasswordInput } from "./password-input.connect";

export interface PasswordInputOptions extends Omit<TextFieldOptions, 'type'> {
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  /** A stable toggle-button name. aria-pressed communicates visibility. */
  toggleLabel?: string;
}

export function usePasswordInput(options: PasswordInputOptions = {}) {
  const { value: visible, setValue } = useBooleanState({
    value: options.visible,
    defaultValue: options.defaultVisible,
    onValueChange: options.onVisibleChange,
  });
  const text = useTextField({ ...options, type: visible ? 'text' : 'password' });
  const node = useRef<HTMLInputElement | null>(null);
  const selection = useRef<{
    start: number;
    end: number;
    direction: 'forward' | 'backward' | 'none';
    value: string;
    visible: boolean;
  } | null>(null);
  const [defaultVisible] = useState(options.defaultVisible ?? false);
  const register = useCallback((input: HTMLInputElement | null) => {
    node.current = input;
    return () => {
      if (node.current === input) node.current = null;
    };
  }, []);
  const reset = useCallback(() => setValue(defaultVisible), [defaultVisible, setValue]);
  const resetRef = useFormReset(options.form, reset);
  // mergeRefs only creates a callback; ref reads/writes occur during React commit.
  // oxlint-disable-next-line react/refs
  const ref = useMemo(() => mergeRefs(register, resetRef), [register, resetRef]);
  const changeVisible = useCallback(
    (next: boolean | ((previous: boolean) => boolean)) => {
      setValue((previous) => {
        const value = typeof next === 'function' ? next(previous) : next;
        const input = node.current;
        if (
          value !== previous &&
          input &&
          input.ownerDocument.activeElement === input &&
          input.selectionStart !== null
        ) {
          selection.current = {
            start: input.selectionStart,
            end: input.selectionEnd ?? input.selectionStart,
            direction: input.selectionDirection ?? 'none',
            value: input.value,
            visible: value,
          };
        }
        return value;
      });
    },
    [setValue],
  );
  const show = useCallback(() => changeVisible(true), [changeVisible]);
  const hide = useCallback(() => changeVisible(false), [changeVisible]);
  const toggle = useCallback(() => changeVisible((previous) => !previous), [changeVisible]);
  useLayoutEffect(() => {
    const saved = selection.current;
    const input = node.current;
    const view = input?.ownerDocument.defaultView;
    if (!saved || !input || !view || saved.visible !== visible) {
      selection.current = null;
      return;
    }
    const restore = () => {
      if (
        selection.current === saved &&
        node.current === input &&
        input.value === saved.value &&
        input.ownerDocument.activeElement === input
      )
        input.setSelectionRange(saved.start, saved.end, saved.direction);
    };
    restore();
    // A browser can finish changing its native editor after the React commit.
    // Restore once more before painting, unless a new input/focus action supersedes it.
    const frame = view.requestAnimationFrame(() => {
      restore();
      if (selection.current === saved) selection.current = null;
    });
    return () => view.cancelAnimationFrame(frame);
  });
  // connect stores refs and DOM commands without invoking them during render.
  /* oxlint-disable react/refs */
  return connectPasswordInput(
    text,
    { ...options, visible },
    {
      ref,
      show,
      hide,
      toggle,
      preserveFocus: (event) => {
        if (event.button === 0 && node.current?.ownerDocument.activeElement === node.current) event.preventDefault();
      },
      clearSelection: () => {
        selection.current = null;
      },
    },
  );
  /* oxlint-enable react/refs */
}
export type { PasswordInputApi } from "./password-input.connect";
