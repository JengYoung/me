'use client';
import { useEffect, useRef, useState } from 'react';
import { useDirectionContext, useMachine, useStableId } from "../_shared/react/index";
import { useListbox } from "../listbox/index";
import { comboboxInput, comboboxMachine } from "./combobox.machine";
import type { ComboboxOptions } from "./combobox.machine";
import { connectCombobox } from "./combobox.connect";

export function useCombobox(options: ComboboxOptions) {
  const id = useStableId('iris-combobox', options.id);
  const inherited = useDirectionContext();
  const [controlled] = useState([
    options.value !== undefined,
    options.inputValue !== undefined,
    options.open !== undefined,
  ]);
  const service = useMachine(comboboxMachine, { props: options });
  const query = comboboxInput(options, service.state.context);
  const items =
    options.mode !== 'select-only' && options.autocomplete !== 'none' && service.state.context.filtering
      ? options.items.filter((item) => item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
      : options.items;
  const root = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const composing = useRef(false);
  const listbox = useListbox({
    id: `${id}-listbox`,
    items,
    virtualFocus: true,
    value: [],
    disabled: options.disabled,
    onValueChange: (values) => {
      if (values[0]) {
        service.send({ type: 'SELECT', value: values[0] });
        (options.mode === 'select-only' ? trigger.current : input.current)?.focus();
      }
    },
  });
  const { send } = service;
  const open = !options.disabled && (options.open ?? service.state.value === 'open');
  useEffect(() => {
    if (!open || !root.current) return;
    const element = root.current;
    const outside = (event: PointerEvent) => {
      if (!event.defaultPrevented && !event.composedPath().includes(element)) send({ type: 'OPEN', open: false });
    };
    element.ownerDocument.addEventListener('pointerdown', outside);
    return () => element.ownerDocument.removeEventListener('pointerdown', outside);
  }, [open, send]);
  if (
    controlled.some(
      (mode, index) =>
        mode !== [options.value !== undefined, options.inputValue !== undefined, options.open !== undefined][index],
    )
  )
    throw new Error('Combobox cannot switch control modes.');
  // connect reads refs only in event handlers.
  /* oxlint-disable react/refs */
  return connectCombobox(
    service,
    listbox,
    { ...options, items, id, dir: options.dir ?? inherited },
    { root, input, trigger, composing },
  );
  /* oxlint-enable react/refs */
}
export type { ComboboxOptions } from "./combobox.machine";
export type { ComboboxApi } from "./combobox.connect";
