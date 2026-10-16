'use client';

import { useBooleanState, useStableId } from '../_shared/react/index';
import { connectDisclosure } from './disclosure.connect';

export type { DisclosureApi } from './disclosure.connect';

export interface DisclosureOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function useDisclosure(options: DisclosureOptions = {}) {
  const id = useStableId('iris-disclosure', options.id);
  const state = useBooleanState({
    value: options.open,
    defaultValue: options.defaultOpen,
    onValueChange: options.onOpenChange,
  });
  return connectDisclosure(state, { id, disabled: options.disabled });
}
