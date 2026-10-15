'use client';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { mergeProps, useStableId } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';
import { usePresence } from '../presence/index';
import { connectToast } from './toast.connect';
import type { ToastStore } from './toast-store';
const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

/** Read-only subscription; a viewport owns the active timer lifetime. */
export function useToastStore(store: ToastStore) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
export function useToast(store: ToastStore, toastId: string) {
  const items = useToastStore(store);
  const item = items.find((entry) => entry.id === toastId);
  const id = useStableId('iris-toast');
  const presence = usePresence({
    present: item?.status === 'visible',
    maxDuration: store.exitDuration,
    onExitComplete: () => store.remove(toastId),
  });
  return connectToast(store, item, id, presence);
}
export function useToastViewport(store: ToastStore) {
  const items = useToastStore(store);
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const messages = useSyncExternalStore(store.subscribe, store.getAnnouncements, store.getServerAnnouncements);

  useCommitEffect(() => {
    if (!element) return;
    const detach = store.attach();
    const doc = element.ownerDocument;
    const onVisibility = () => {
      if (doc.hidden) store.pause('dom:document');
      else store.resume('dom:document');
    };
    const onWindowBlur = () => store.pause('dom:window');
    const onWindowFocus = () => store.resume('dom:window');
    const restore = (id?: string) => {
      const roots = [...element.querySelectorAll<HTMLElement>('[data-scope="toast"][data-part="root"]')];
      const focused = roots.find((root) => root.contains(doc.activeElement));
      if (!focused || (id && focused.dataset.toastId !== id)) return;
      const next = roots.find((root) => root !== focused && root.dataset.state === 'visible' && !!id);
      const target = next ?? (returnFocus.current?.isConnected ? returnFocus.current : element);
      target.focus({ preventScroll: true });
      if (focused.contains(doc.activeElement)) element.focus({ preventScroll: true });
    };
    const unsubscribe = store.onDismiss(restore);
    onVisibility();
    doc.addEventListener('visibilitychange', onVisibility);
    doc.defaultView?.addEventListener('blur', onWindowBlur);
    doc.defaultView?.addEventListener('focus', onWindowFocus);
    return () => {
      unsubscribe();
      detach();
      doc.removeEventListener('visibilitychange', onVisibility);
      doc.defaultView?.removeEventListener('blur', onWindowBlur);
      doc.defaultView?.removeEventListener('focus', onWindowFocus);
    };
  }, [element, store]);

  return {
    toasts: items.filter((item) => item.status !== 'queued'),
    queued: items.filter((item) => item.status === 'queued'),
    getViewportProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        ref: setElement,
        role: 'region',
        'aria-label': user['aria-label'] ?? 'Notifications',
        tabIndex: -1,
        'data-scope': 'toast',
        'data-part': 'viewport',
        onPointerEnter: () => store.pause('dom:pointer'),
        onPointerLeave: () => store.resume('dom:pointer'),
        onFocusCapture: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            returnFocus.current = event.relatedTarget as HTMLElement | null;
          store.pause('dom:focus');
        },
        onBlurCapture: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) store.resume('dom:focus');
        },
      });
    },
    getAnnouncerProps(priority: 'polite' | 'assertive', user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, {
        role: priority === 'assertive' ? 'alert' : 'status',
        'aria-live': priority,
        'aria-atomic': true,
        'data-scope': 'toast',
        'data-part': 'announcer',
        children: messages[priority],
      });
    },
  };
}
export type ToastViewportApi = ReturnType<typeof useToastViewport>;
export type { ToastApi } from './toast.connect';
