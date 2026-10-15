'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FieldOptions } from "../field/index";
import { useListbox } from "../listbox/index";
import { useTextField } from "../text-field/index";
import { useMachine, useStableId } from "../_shared/react/index";
import { commandItems, commandMachine, commandQuery } from "./command.machine";
import type { CommandBehaviorOptions } from "./command.machine";
import { connectCommand } from "./command.connect";

export interface CommandOptions extends CommandBehaviorOptions, Omit<FieldOptions, 'label' | 'required' | 'readOnly'> {}
export function useCommand(options: CommandOptions) {
  if (
    options.items.some((item) => !item.id || !item.label) ||
    new Set(options.items.map((item) => item.id)).size !== options.items.length
  )
    throw new Error('Command items require unique nonempty IDs and nonempty labels.');
  const [controlled] = useState(options.query !== undefined);
  if (controlled !== (options.query !== undefined)) throw new Error('Command cannot switch query control modes.');
  const id = useStableId('iris-command', options.id);
  const service = useMachine(commandMachine, { props: options });
  const { send, getProps, getSnapshot } = service;
  const query = commandQuery(options, service.state.context);
  const items = commandItems(options, query);
  const setQuery = useCallback((query: string) => send({ type: 'QUERY', query }), [send]);
  const clear = useCallback(() => send({ type: 'QUERY', query: '' }), [send]);
  const execute = useCallback((id: string) => send({ type: 'EXECUTE', id }), [send]);
  const input = useRef<HTMLInputElement | null>(null);
  const text = useTextField({ ...options, id: `${id}-input`, value: query, onValueChange: setQuery });
  const listbox = useListbox({
    id: `${id}-list`,
    items: items.map((item) => ({ ...item, value: item.id })),
    virtualFocus: true,
    value: [],
    loop: options.loop ?? true,
    disabled: options.disabled,
    defaultActiveValue: items.find((item) => !item.disabled)?.id ?? null,
    onValueChange: (values) => {
      if (values[0]) execute(values[0]);
    },
  });
  const focus = useCallback(() => {
    if (getSnapshot().status === 'active' && !getProps().disabled) input.current?.focus();
  }, [getProps, getSnapshot]);
  const shortcutKey = options.shortcut?.key;
  const shortcutModifier = options.shortcut?.modifier ?? 'mod';
  const allowInInput = options.shortcut?.allowInInput ?? false;
  useEffect(() => {
    const owner = input.current?.ownerDocument;
    if (!owner || !shortcutKey || options.disabled) return;
    const listener = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        event.keyCode === 229 ||
        event.altKey ||
        event.shiftKey ||
        getSnapshot().value === 'composing'
      )
        return;
      const modifier = shortcutModifier;
      const matches =
        modifier === 'meta'
          ? event.metaKey && !event.ctrlKey
          : modifier === 'ctrl'
            ? event.ctrlKey && !event.metaKey
            : event.metaKey !== event.ctrlKey;
      if (!matches || event.key.toLowerCase() !== shortcutKey.toLowerCase()) return;
      const target = event.target as Element | null;
      if (
        !allowInInput &&
        target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')
      )
        return;
      event.preventDefault();
      const current = getProps();
      if (current.onShortcut) current.onShortcut();
      else focus();
    };
    owner.addEventListener('keydown', listener);
    return () => owner.removeEventListener('keydown', listener);
  }, [shortcutKey, shortcutModifier, allowInInput, options.disabled, getProps, getSnapshot, focus]);
  // Connect reads refs only when events execute.
  // oxlint-disable-next-line react/refs
  return connectCommand(text, listbox, service, { ...options, id, items }, { input, setQuery, clear, execute, focus });
}
export type { CommandApi } from "./command.connect";
export type { CommandItemData, CommandShortcut } from "./command.machine";
