import { createMachine } from '../_shared/core/index';

export interface ToastInput {
  id?: string;
  title: string;
  description?: string;
  priority?: 'polite' | 'assertive';
  /** Milliseconds; 0 is persistent. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}
export interface ToastRecord extends Omit<ToastInput, 'id' | 'duration' | 'priority'> {
  readonly id: string;
  readonly duration: number;
  readonly priority: 'polite' | 'assertive';
  readonly status: 'queued' | 'visible' | 'closing';
  readonly remaining: number;
  readonly startedAt: number | null;
  readonly closedAt: number | null;
  readonly pauses: readonly string[];
}
export interface ToastSchema {
  state: 'detached' | 'attached';
  props: { limit: number };
  context: { items: readonly ToastRecord[]; pauses: readonly string[] };
  event:
    | { type: 'ADD'; toast: ToastRecord; now: number }
    | { type: 'UPDATE'; id: string; patch: Partial<Omit<ToastInput, 'id'>>; now: number }
    | { type: 'DISMISS'; id?: string; now: number }
    | { type: 'REMOVE'; id: string; now: number }
    | { type: 'PAUSE'; id?: string; reason: string; now: number }
    | { type: 'RESUME'; id?: string; reason: string; now: number }
    | { type: 'ATTACH'; now: number }
    | { type: 'DETACH'; now: number };
}
export function toastRemaining(item: ToastRecord, now: number) {
  return item.startedAt === null ? item.remaining : Math.max(0, item.remaining - Math.max(0, now - item.startedAt));
}
/** Account elapsed time before every change and promote FIFO only after removal. */
function reconcile(
  items: readonly ToastRecord[],
  limit: number,
  active: boolean,
  pauses: readonly string[],
  now: number,
) {
  let available = Math.max(0, limit - items.filter((item) => item.status !== 'queued').length);
  return items.map((item): ToastRecord => {
    const remaining = toastRemaining(item, now);
    const status = item.status === 'queued' && available > 0 ? (available--, 'visible') : item.status;
    return {
      ...item,
      status,
      remaining,
      startedAt:
        active && status === 'visible' && !pauses.length && !item.pauses.length && item.duration > 0 ? now : null,
    };
  });
}
function reduce({
  value,
  context,
  props,
  event,
}: {
  value: ToastSchema['state'];
  context: Readonly<ToastSchema['context']>;
  props: ToastSchema['props'];
  event: ToastSchema['event'];
}) {
  let items: ToastRecord[] = context.items.map((item) => ({
    ...item,
    remaining: toastRemaining(item, event.now),
    startedAt: null,
  }));
  let pauses = context.pauses;
  switch (event.type) {
    case 'ADD': {
      const existing = items.findIndex((item) => item.id === event.toast.id);
      if (existing < 0) items.push(event.toast);
      else
        items[existing] = {
          ...event.toast,
          status: items[existing]!.status === 'queued' ? 'queued' : 'visible',
          pauses: items[existing]!.pauses,
        };
      break;
    }
    case 'UPDATE':
      items = items.map((item) =>
        item.id !== event.id
          ? item
          : {
              ...item,
              ...event.patch,
              duration: event.patch.duration ?? item.duration,
              priority: event.patch.priority ?? item.priority,
              remaining: event.patch.duration ?? item.remaining,
            },
      );
      break;
    case 'DISMISS':
      items = items
        .filter((item) => !((!event.id || item.id === event.id) && item.status === 'queued'))
        .map((item) =>
          !event.id || item.id === event.id
            ? { ...item, status: 'closing', closedAt: item.closedAt ?? event.now }
            : item,
        );
      break;
    case 'REMOVE':
      items = items.filter((item) => item.id !== event.id || item.status !== 'closing');
      break;
    case 'PAUSE':
    case 'RESUME': {
      const change = (reasons: readonly string[]) =>
        event.type === 'PAUSE'
          ? [...new Set([...reasons, event.reason])]
          : reasons.filter((reason) => reason !== event.reason);
      if (event.id)
        items = items.map((item) => (item.id === event.id ? { ...item, pauses: change(item.pauses) } : item));
      else pauses = change(pauses);
      break;
    }
    case 'DETACH':
      // DOM pointer/focus reasons belong to the detached viewport.
      items = items.map((item) => ({ ...item, pauses: item.pauses.filter((reason) => !reason.startsWith('dom:')) }));
      pauses = pauses.filter((reason) => !reason.startsWith('dom:'));
      break;
  }
  const active = event.type === 'ATTACH' || (value === 'attached' && event.type !== 'DETACH');
  return { items: reconcile(items, props.limit, active, pauses, event.now), pauses };
}
export const toastMachine = createMachine<ToastSchema>({
  initial: 'detached',
  context: () => ({ items: [], pauses: [] }),
  states: {
    detached: { on: { ATTACH: { target: 'attached', assign: reduce } } },
    attached: { on: { DETACH: { target: 'detached', assign: reduce } } },
  },
  on: {
    ADD: { assign: reduce },
    UPDATE: { assign: reduce },
    DISMISS: { assign: reduce },
    REMOVE: { assign: reduce },
    PAUSE: { assign: reduce },
    RESUME: { assign: reduce },
  },
});
