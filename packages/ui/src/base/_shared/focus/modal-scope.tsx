'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

/** React ancestry remains meaningful when nested content is rendered into a portal. */
export interface ModalFocusScope {
  readonly parent: ModalFocusScope | null;
}
const Context = createContext<ModalFocusScope | null>(null);
export function useModalScope(): ModalFocusScope {
  const parent = useContext(Context);
  return useMemo(() => ({ parent }), [parent]);
}
export function ModalFocusProvider({ scope, children }: { scope: ModalFocusScope; children?: ReactNode }) {
  return <Context value={scope}>{children}</Context>;
}
