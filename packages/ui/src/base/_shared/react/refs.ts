import type { Ref, RefCallback } from 'react';

/** Preserve React 19 callback-ref cleanup as well as object refs. */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (value) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') return ref(value);
      if (ref) ref.current = value;
      return undefined;
    });
    if (value === null) return;
    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index];
        if (typeof cleanup === 'function') cleanup();
        else if (typeof ref === 'function') ref(null);
        else if (ref) ref.current = null;
      });
    };
  };
}
