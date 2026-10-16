'use client';
import { useMachine } from '../_shared/react/index';
import { clipboardMachine, validateClipboard } from './clipboard.machine';
import type { ClipboardOptions } from './clipboard.machine';
import { connectClipboard } from './clipboard.connect';
import { writeClipboard } from './clipboard.dom';

export function useClipboard(options: ClipboardOptions) {
  validateClipboard(options);
  return connectClipboard(useMachine(clipboardMachine, { props: { ...options, writeText: writeClipboard } }), options);
}
export type { ClipboardOptions, ClipboardState, ClipboardFailure } from './clipboard.machine';
export type { ClipboardApi } from './clipboard.connect';
