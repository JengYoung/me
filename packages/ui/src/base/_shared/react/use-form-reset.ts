'use client';

import { useCallback } from 'react';
import type { RefCallback } from 'react';

/** A single successful form control owns reset registration and pending-task cleanup. */
export function useFormReset<T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement = HTMLInputElement>(
  form: string | undefined,
  onReset: (control: T) => void,
): RefCallback<T> {
  return useCallback(
    (input) => {
      if (!input) return;
      const owner = input.form;
      const timers = new Set<ReturnType<typeof setTimeout>>();
      const reset = (event: Event) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          if (!event.defaultPrevented && input.form === owner && (!form || owner?.id === form)) onReset(input);
        }, 0);
        timers.add(timer);
      };
      owner?.addEventListener('reset', reset);
      return () => {
        owner?.removeEventListener('reset', reset);
        timers.forEach(clearTimeout);
      };
    },
    [form, onReset],
  );
}
