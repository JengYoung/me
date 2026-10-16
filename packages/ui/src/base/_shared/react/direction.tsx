'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Direction } from '../core/index';

// Shared here so keyboard and independently installed UI use the same context.
const DirectionContext = createContext<Direction | undefined>(undefined);

export interface DirectionProviderProps {
  dir: Direction;
  children?: ReactNode;
}

/** Context only: bind the resolved direction to DOM boundaries, including portals. */
export function DirectionProvider({ dir, children }: DirectionProviderProps) {
  return <DirectionContext value={dir}>{children}</DirectionContext>;
}

/** Low-level adapter API: undefined preserves a widget's native DOM inheritance policy. */
export function useDirectionContext(): Direction | undefined {
  return useContext(DirectionContext);
}

export function useDirection(dir?: Direction): Direction {
  const inherited = useDirectionContext();
  return dir ?? inherited ?? 'ltr';
}
