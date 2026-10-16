'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDirectionContext, useMachine, useStableId } from '../_shared/react/index';
import { menuMachine, menuOpen } from './menu.machine';
import type { MenuStateOptions } from './menu.machine';
import { menuPath, validateMenu } from './menu.model';
import { connectMenu } from './menu.connect';
const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
export interface MenuOptions extends MenuStateOptions {
  returnFocus?: () => HTMLElement | null;
}
export type MenubarOptions = Omit<MenuOptions, 'kind' | 'open' | 'defaultOpen' | 'onOpenChange'>;
export function useMenu(options: MenuOptions) {
  validateMenu(options.items);
  const id = useStableId('iris-menu', options.id);
  const inherited = useDirectionContext();
  const dir = options.dir ?? inherited;
  const [controlled] = useState([options.open !== undefined, options.checkedValues !== undefined]);
  const root = useRef<HTMLDivElement | null>(null);
  const service = useMachine(menuMachine, {
    props: {
      ...options,
      dir,
      onClose: (reason) => {
        options.onClose?.(reason);
        if (reason === 'tab') {
          if (options.kind === 'menubar') {
            const top = menuPath(options.items, service.getSnapshot().context.activeValue)[0];
            if (top) root.current?.ownerDocument.getElementById(`${id}-item-${encodeURIComponent(top.value)}`)?.focus();
          } else options.returnFocus?.()?.focus();
        }
      },
    },
  });
  const { send } = service;
  const open = menuOpen(options, service.state.context);
  const returnFocus = options.returnFocus;
  const wasOpen = useRef(false);
  const focusedVersion = useRef(-1);
  const lastFocused = useRef<Element | null>(null);
  useCommitEffect(() => {
    const element = root.current;
    if (!element) return;
    const document = element.ownerDocument;
    const lostFocus =
      lastFocused.current !== null && !lastFocused.current.isConnected && document.activeElement === document.body;
    const ownsFocus = element.contains(document.activeElement) || lostFocus;
    const changed = focusedVersion.current !== service.state.context.focusVersion;
    if (
      open &&
      ((options.kind !== 'menubar' && !wasOpen.current) ||
        (changed && service.state.context.focusVersion > 0 && (!service.state.context.recoverFocus || ownsFocus)))
    ) {
      const target = service.state.context.activeValue;
      if (target) element.ownerDocument.getElementById(`${id}-item-${encodeURIComponent(target)}`)?.focus();
      else element.focus();
    } else if (!open && wasOpen.current && !['outside', 'tab'].includes(service.state.context.closeReason))
      options.returnFocus?.()?.focus();
    wasOpen.current = open;
    focusedVersion.current = service.state.context.focusVersion;
    if (element.contains(document.activeElement)) lastFocused.current = document.activeElement;
    else if (!lostFocus || !open || changed) lastFocused.current = null;
  });
  useEffect(() => {
    if (!open || !root.current) return;
    const element = root.current;
    const outside = (event: PointerEvent) => {
      if (
        !event.defaultPrevented &&
        !event.composedPath().includes(element) &&
        !event.composedPath().includes(returnFocus?.() as EventTarget)
      )
        send({ type: 'CLOSE', reason: 'outside' });
    };
    element.ownerDocument.addEventListener('pointerdown', outside);
    return () => element.ownerDocument.removeEventListener('pointerdown', outside);
  }, [open, send, returnFocus]);
  if (controlled[0] !== (options.open !== undefined) || controlled[1] !== (options.checkedValues !== undefined))
    throw new Error('Menu cannot switch control modes.');
  // connect uses refs only after commit, from events.
  // oxlint-disable-next-line react/refs
  return connectMenu(service, { ...options, dir, id }, root);
}
export function useMenubar(options: MenubarOptions) {
  return useMenu({ ...options, kind: 'menubar' });
}
export type { MenuApi, MenubarApi } from './menu.connect';
export type { MenuItem } from './menu.model';
export type { MenuCloseReason } from './menu.machine';
