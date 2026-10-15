'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDirection, useStableId } from "../_shared/react/index";
import { useDisclosure } from "../disclosure/index";
import { connectSidebar } from "./sidebar.connect";
const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
export interface SidebarShortcut {
  key?: string;
  modifier?: 'mod' | 'ctrl' | 'meta';
  allowInInputs?: boolean;
}
export interface SidebarOptions {
  id?: string;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  dir?: 'ltr' | 'rtl';
  shortcut?: boolean | SidebarShortcut;
}
export function useSidebar(options: SidebarOptions = {}) {
  const id = useStableId('iris-sidebar', options.id);
  const dir = useDirection(options.dir);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const disclosure = useDisclosure({
    id,
    open: options.expanded,
    defaultOpen: options.defaultExpanded ?? true,
    onOpenChange: options.onExpandedChange,
  });
  const latest = useRef(options);
  useCommitEffect(() => {
    latest.current = options;
  });
  const { open: expanded, setOpen: setExpanded } = disclosure;
  const toggle = useCallback(() => setExpanded((value) => !value), [setExpanded]);
  useCommitEffect(() => {
    if (!expanded && content?.contains(content.ownerDocument.activeElement)) trigger?.focus({ preventScroll: true });
  }, [expanded, content, trigger]);
  const shortcut = options.shortcut;
  const enabled = !!shortcut;
  useEffect(() => {
    if (!enabled || !trigger) return;
    const document = trigger.ownerDocument;
    const listener = (event: KeyboardEvent) => {
      const setting = latest.current.shortcut;
      if (
        !setting ||
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        event.altKey ||
        trigger.disabled ||
        trigger.closest('[inert]')
      )
        return;
      const config = setting === true ? {} : setting;
      const modifier = config.modifier ?? 'mod';
      const matches =
        modifier === 'ctrl'
          ? event.ctrlKey && !event.metaKey
          : modifier === 'meta'
            ? event.metaKey && !event.ctrlKey
            : event.ctrlKey || event.metaKey;
      if (!matches || event.shiftKey || event.key.toLowerCase() !== (config.key ?? 'b').toLowerCase()) return;
      const target = event.target;
      if (
        !config.allowInInputs &&
        target instanceof document.defaultView!.Element &&
        target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')
      )
        return;
      event.preventDefault();
      toggle();
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [enabled, trigger, toggle]);
  return connectSidebar(disclosure, { id, dir, toggle }, { setTrigger, setContent });
}
export type { SidebarApi } from "./sidebar.connect";
