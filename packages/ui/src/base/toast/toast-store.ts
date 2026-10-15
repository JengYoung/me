import { createActor } from "../_shared/core/index";
import type { Clock } from "../_shared/core/index";
import { toastMachine, toastRemaining } from "./toast.machine";
import type { ToastInput, ToastRecord, ToastSchema } from "./toast.machine";

export interface ToastStoreOptions {
  limit?: number;
  duration?: number;
  /** Fallback removal bound; Presence normally removes as soon as motion completes. */
  exitDuration?: number;
  clock?: Clock & { now: () => number };
}
function validateDuration(duration: number) {
  if (!Number.isFinite(duration) || duration < 0 || duration > 2_147_483_647)
    throw new Error('Toast duration must be between 0 and 2147483647 milliseconds.');
}
export function createToastStore(options: ToastStoreOptions = {}) {
  const limit = options.limit ?? 3;
  const duration = options.duration ?? 5000;
  const exitDuration = options.exitDuration ?? 1000;
  if (!Number.isInteger(limit) || limit < 1) throw new Error('Toast limit must be a positive integer.');
  validateDuration(duration);
  validateDuration(exitDuration);
  const clock = options.clock ?? {
    now: () => Date.now(),
    setTimeout: (callback: () => void, delay: number) => setTimeout(callback, delay),
    clearTimeout: (handle: unknown) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  };
  const actor = createActor(toastMachine, { props: { limit } });
  const serverSnapshot = actor.getInitialSnapshot().context.items;
  const serverAnnouncements = { polite: '', assertive: '' };
  let announcements = serverAnnouncements;
  let announced = new Map<string, string>();
  const timers = new Map<string, unknown>();
  const dismissListeners = new Set<(id?: string) => void>();
  let serial = 0;
  let attached = false;
  let disposed = false;
  function clearTimers() {
    timers.forEach((handle) => clock.clearTimeout(handle));
    timers.clear();
  }
  function dispatch(event: ToastSchema['event']) {
    if (disposed) return;
    actor.start();
    actor.send(event);
  }
  function schedule() {
    clearTimers();
    if (!attached || disposed) return;
    const next = new Map<string, string>();
    const additions = { polite: [] as string[], assertive: [] as string[] };
    for (const item of actor.getSnapshot().context.items) {
      if (item.status !== 'visible') continue;
      const message = [item.title, item.description].filter(Boolean).join('. ');
      const signature = JSON.stringify([item.priority, message]);
      next.set(item.id, signature);
      if (announced.get(item.id) !== signature) additions[item.priority].push(message);
    }
    announced = next;
    if (additions.polite.length || additions.assertive.length) {
      announcements = {
        polite: additions.polite.length ? [...new Set(additions.polite)].join('. ') : announcements.polite,
        assertive: additions.assertive.length ? [...new Set(additions.assertive)].join('. ') : announcements.assertive,
      };
    }
    for (const item of actor.getSnapshot().context.items) {
      if (item.status === 'closing')
        timers.set(
          item.id,
          clock.setTimeout(
            () => remove(item.id),
            Math.max(0, exitDuration - Math.max(0, clock.now() - (item.closedAt ?? clock.now()))),
          ),
        );
      else if (item.startedAt !== null)
        timers.set(
          item.id,
          clock.setTimeout(() => dismiss(item.id), toastRemaining(item, clock.now())),
        );
    }
  }
  const unsubscribeTimers = actor.subscribe(schedule);
  function dismiss(id?: string) {
    dismissListeners.forEach((listener) => listener(id));
    dispatch({ type: 'DISMISS', id, now: clock.now() });
  }
  function remove(id: string) {
    dispatch({ type: 'REMOVE', id, now: clock.now() });
  }
  function pause(reason = 'manual', id?: string) {
    dispatch({ type: 'PAUSE', reason, id, now: clock.now() });
  }
  function resume(reason = 'manual', id?: string) {
    dispatch({ type: 'RESUME', reason, id, now: clock.now() });
  }
  function update(id: string, patch: Partial<Omit<ToastInput, 'id'>>) {
    if (patch.duration !== undefined) validateDuration(patch.duration);
    dispatch({ type: 'UPDATE', id, patch, now: clock.now() });
  }
  return {
    exitDuration,
    add(input: ToastInput) {
      let generated = 'toast-' + ++serial;
      while (actor.getSnapshot().context.items.some((item) => item.id === generated)) generated = 'toast-' + ++serial;
      const id = input.id ?? generated;
      if (!id) throw new Error('Toast id must not be empty.');
      const lifetime = input.duration ?? duration;
      validateDuration(lifetime);
      const toast: ToastRecord = {
        ...input,
        id,
        duration: lifetime,
        priority: input.priority ?? 'polite',
        status: 'queued',
        remaining: lifetime,
        startedAt: null,
        closedAt: null,
        pauses: [],
      };
      dispatch({ type: 'ADD', toast, now: clock.now() });
      return id;
    },
    update,
    dismiss,
    remove,
    pause,
    resume,
    action(id: string) {
      const item = actor.getSnapshot().context.items.find((entry) => entry.id === id && entry.status === 'visible');
      if (!item?.action) return;
      try {
        item.action.onClick();
      } finally {
        dismiss(id);
      }
    },
    getRemaining(id: string) {
      const item = actor.getSnapshot().context.items.find((entry) => entry.id === id);
      return item ? toastRemaining(item, clock.now()) : 0;
    },
    getSnapshot: () => actor.getSnapshot().context.items,
    getServerSnapshot: () => serverSnapshot,
    getAnnouncements: () => announcements,
    getServerAnnouncements: () => serverAnnouncements,
    subscribe: (listener: () => void) => actor.subscribe(listener),
    onDismiss(listener: (id?: string) => void) {
      dismissListeners.add(listener);
      return () => {
        dismissListeners.delete(listener);
      };
    },
    /** One rendering viewport per store. Subscribers and producers can be numerous. */
    attach() {
      if (disposed) throw new Error('Cannot attach a disposed Toast store.');
      if (attached) throw new Error('A Toast store can have only one viewport.');
      attached = true;
      dispatch({ type: 'ATTACH', now: clock.now() });
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        attached = false;
        clearTimers();
        dispatch({ type: 'DETACH', now: clock.now() });
      };
    },
    dispose() {
      disposed = true;
      attached = false;
      clearTimers();
      dismissListeners.clear();
      unsubscribeTimers();
      actor.stop();
    },
  };
}
export type ToastStore = ReturnType<typeof createToastStore>;
export type { ToastInput, ToastRecord } from "./toast.machine";
