'use client';

import { useRef } from 'react';
import { useDialog } from '../dialog/index';
import type { DialogOptions } from '../dialog/index';
import { connectAlertDialog } from './alert-dialog.connect';

export interface AlertDialogOptions extends Omit<DialogOptions, 'closeOnOutside' | 'describedBy'> {
  /** Message description is required: defaults to the Description part's ID. */
  describedBy?: string;
}

export function useAlertDialog(options: AlertDialogOptions = {}) {
  const cancel = useRef<HTMLButtonElement | null>(null);
  // Stored as a focus getter; useModalFocus only invokes it after commit.
  /* oxlint-disable react/refs */
  const dialog = useDialog({
    ...options,
    closeOnOutside: false,
    initialFocus: () => options.initialFocus?.() ?? cancel.current,
  });
  /* oxlint-enable react/refs */
  // connect only passes the object ref through the Cancel prop getter.
  // oxlint-disable-next-line react/refs
  return connectAlertDialog(dialog, cancel);
}

export type { AlertDialogApi } from './alert-dialog.connect';
export type {
  DialogChangeDetails as AlertDialogChangeDetails,
  DialogChangeReason as AlertDialogChangeReason,
} from '../dialog/index';
