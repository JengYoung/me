'use client';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { FieldOptions } from "../field/index";
import { useTextField } from "../text-field/index";
import { mergeRefs, useDirectionContext, useFormReset, useMachine } from "../_shared/react/index";
import type { Direction } from "../_shared/react/index";
import { tagsInputMachine, tagsInput, tagsValue } from "./tags-input.machine";
import type { TagsInputBehaviorOptions } from "./tags-input.machine";
import { connectTagsInput } from "./tags-input.connect";

export interface TagsInputOptions extends TagsInputBehaviorOptions, Omit<FieldOptions, 'label' | 'required'> {
  name?: string;
  form?: string;
  dir?: Direction;
  delimiters?: readonly string[];
  getRemoveLabel?: (value: string) => string;
}
export function useTagsInput(options: TagsInputOptions = {}) {
  const [controlled] = useState([options.value !== undefined, options.inputValue !== undefined]);
  if (controlled[0] !== (options.value !== undefined) || controlled[1] !== (options.inputValue !== undefined))
    throw new Error('Tags Input cannot switch control modes.');
  const values = options.value ?? options.defaultValue ?? [];
  if (values.some((value) => !value.trim()) || new Set(values).size !== values.length)
    throw new Error('Tags must be nonempty and unique.');
  if (options.maxTags !== undefined && (!Number.isSafeInteger(options.maxTags) || options.maxTags < 0))
    throw new Error('maxTags must be a nonnegative integer.');
  const inherited = useDirectionContext();
  const service = useMachine(tagsInputMachine, { props: options });
  const { send, getProps, getSnapshot } = service;
  const text = useTextField({
    ...options,
    name: undefined,
    value: tagsInput(options, service.state.context),
    defaultValue: undefined,
    invalid: !!options.invalid || service.state.context.error !== null,
    onValueChange: (value) => send({ type: 'INPUT', value }),
  });
  const input = useRef<HTMLInputElement | null>(null);
  const root = useRef<HTMLDivElement | null>(null);
  const items = useRef(new Map<string, HTMLDivElement>());
  const focusedItem = useRef<string | null>(null);
  const previousEditing = useRef<string | null>(null);
  const register = useCallback((node: HTMLInputElement | null) => {
    input.current = node;
    return () => {
      if (input.current === node) input.current = null;
    };
  }, []);
  const reset = useCallback(
    (node: HTMLInputElement) => {
      send({ type: 'RESET' });
      node.value = tagsInput(getProps(), getSnapshot().context);
    },
    [send, getProps, getSnapshot],
  );
  const resetRef = useFormReset(options.form, reset);
  // Ref composition creates callbacks; DOM access is deferred to commit.
  // oxlint-disable-next-line react/refs
  const ref = useMemo(() => mergeRefs(register, resetRef), [register, resetRef]);
  const focus = useCallback(
    (value: string | null = null) => {
      if (getSnapshot().status !== 'active' || getProps().disabled) return;
      const target = value === null ? input.current : items.current.get(value);
      target?.focus();
      if (target?.ownerDocument.activeElement === target) {
        focusedItem.current = value;
        send({ type: 'ACTIVE', value });
      }
    },
    [send, getProps, getSnapshot],
  );
  const removeValue = useCallback(
    (value: string) => {
      const props = getProps();
      if (props.disabled || props.readOnly) return;
      const before = tagsValue(props, getSnapshot().context);
      const index = before.indexOf(value);
      const node = items.current.get(value);
      const restore = !!node?.contains(node.ownerDocument.activeElement);
      send({ type: 'REMOVE', value });
      if (restore) {
        const after = tagsValue(getProps(), getSnapshot().context);
        focus(after.includes(value) ? value : (after[index] ?? after[index - 1] ?? null));
      }
    },
    [send, getProps, getSnapshot, focus],
  );
  const editValue = useCallback(
    (value: string) => {
      send({ type: 'EDIT', value });
      if (getSnapshot().context.editing === value) {
        focus();
        input.current?.select();
      }
    },
    [send, getSnapshot, focus],
  );
  const addValue = useCallback((value: string) => send({ type: 'ADD', values: [value] }), [send]);
  const setInputValue = useCallback((value: string) => send({ type: 'INPUT', value }), [send]);
  const commit = useCallback(() => send({ type: 'COMMIT' }), [send]);
  const cancel = useCallback(() => send({ type: 'CANCEL' }), [send]);
  useLayoutEffect(() => {
    const editing = service.state.context.editing;
    if (editing !== null && editing !== previousEditing.current && !options.disabled) input.current?.select();
    previousEditing.current = editing;
    const value = focusedItem.current;
    if (value !== null && !tagsValue(options, service.state.context).includes(value)) {
      const active = root.current?.ownerDocument.activeElement;
      if (active === root.current?.ownerDocument.body || (active && root.current?.contains(active))) focus();
      focusedItem.current = null;
    }
  });
  // Refs are read only by event handlers and commit callbacks in connect.
  /* oxlint-disable react/refs */
  return connectTagsInput(
    text,
    service,
    { ...options, dir: options.dir ?? inherited },
    { ref, root, items, focusedItem, focus, removeValue, editValue, addValue, setInputValue, commit, cancel },
  );
  /* oxlint-enable react/refs */
}
export type { TagsInputApi } from "./tags-input.connect";
export type { TagsInputRejection } from "./tags-input.machine";
