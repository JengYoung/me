'use client';

import { useId } from 'react';

/** Always allocate a React ID, including when a caller supplies an explicit ID. */
export function useStableId(prefix: string, id?: string): string {
  const generatedId = useId();
  return id ?? `${prefix}-${generatedId}`;
}
