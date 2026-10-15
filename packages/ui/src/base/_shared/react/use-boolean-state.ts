'use client';

import { useCallback, useState } from 'react';
import { booleanMachine } from './boolean.machine';
import type { BooleanStateOptions } from './boolean.machine';
import { useMachine } from './machine-hook';

export type { BooleanStateOptions } from './boolean.machine';

export interface BooleanStateApi {
  readonly value: boolean;
  setValue(next: boolean | ((previous: boolean) => boolean)): void;
}

export function useBooleanState(options: BooleanStateOptions): BooleanStateApi {
  const [controlled] = useState(options.value !== undefined);
  const { state, send, getSnapshot, getProps } = useMachine(booleanMachine, { props: options });
  const setValue = useCallback(
    (next: boolean | ((previous: boolean) => boolean)) => {
      const snapshot = getSnapshot();
      if (snapshot.status !== 'active') return;
      const previous = getProps().value ?? snapshot.value === 'on';
      send({ type: 'SET', value: typeof next === 'function' ? next(previous) : next });
    },
    [send, getSnapshot, getProps],
  );
  if (controlled !== (options.value !== undefined)) {
    throw new Error('Iris controls cannot switch between controlled and uncontrolled mode.');
  }
  return { value: options.value ?? state.value === 'on', setValue };
}
