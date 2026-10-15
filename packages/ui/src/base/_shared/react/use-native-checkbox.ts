'use client';

import { useCallback } from 'react';
import type { RefCallback } from 'react';

/** Owns only native input synchronization and form reset lifetime, never selection state. */
export function useNativeCheckbox(options: {
  checked: boolean | 'mixed';
  form?: string;
  getChecked(): boolean | 'mixed';
  onReset(): void;
}): RefCallback<HTMLInputElement> {
  const { checked, form, getChecked, onReset } = options;
  return useCallback(
    (input) => {
      if (!input) return;
      input.indeterminate = checked === 'mixed';
      const owner = input.form;
      const pending = new Set<ReturnType<typeof setTimeout>>();
      const reset = (event: Event) => {
        // Wait for delegated onReset, cancellation and the browser's default reset action.
        const timer = setTimeout(() => {
          pending.delete(timer);
          if (event.defaultPrevented || input.form !== owner || (form && input.form?.id !== form)) return;
          onReset();
          const next = getChecked();
          input.checked = next === true;
          input.indeterminate = next === 'mixed';
        }, 0);
        pending.add(timer);
      };
      owner?.addEventListener('reset', reset);
      return () => {
        owner?.removeEventListener('reset', reset);
        pending.forEach(clearTimeout);
        pending.clear();
      };
    },
    // form changes must detach from the previous form even if checked is unchanged.
    [checked, form, getChecked, onReset],
  );
}
