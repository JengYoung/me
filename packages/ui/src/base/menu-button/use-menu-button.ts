'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMachine, useStableId } from "../_shared/react/index";
import { useMenu } from "../menu-menubar/index";
import type { MenuOptions } from "../menu-menubar/index";
import { useButton } from "../button/index";
import { menuButtonMachine } from "./menu-button.machine";
import { connectMenuButton } from "./menu-button.connect";
const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
export type MenuButtonOptions = Omit<MenuOptions, 'kind' | 'returnFocus'>;
export function useMenuButton(options: MenuButtonOptions) {
  const id = useStableId('iris-menu-button', options.id);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [controlled] = useState(options.open !== undefined);
  const service = useMachine(menuButtonMachine, { props: options });
  const { send, getProps, getSnapshot } = service;
  const open = !options.disabled && (options.open ?? service.state.value === 'open');
  const setOpen = useCallback(
    (next: boolean, edge: 'first' | 'last' = 'first') => send({ type: 'OPEN', open: next, edge }),
    [send],
  );
  const returnFocus = useCallback(() => trigger.current, []);
  const menu = useMenu({ ...options, id: `${id}-menu`, open, onOpenChange: setOpen, returnFocus });
  const button = useButton({
    disabled: options.disabled,
    onPress: () => setOpen(!(getProps().open ?? getSnapshot().value === 'open')),
  });
  const previous = useRef(false);
  useCommitEffect(() => {
    if (open && !previous.current) {
      const target = service.state.context.edge === 'last' ? options.items.at(-1) : options.items[0];
      if (target) menu.focus(target.value);
    }
    previous.current = open;
  });
  if (controlled !== (options.open !== undefined)) throw new Error('MenuButton cannot switch control modes.');
  // connect stores the trigger ref without reading it during render.
  // oxlint-disable-next-line react/refs
  return connectMenuButton(menu, button, { id, open, setOpen, disabled: options.disabled, trigger });
}
export type { MenuButtonApi } from "./menu-button.connect";
