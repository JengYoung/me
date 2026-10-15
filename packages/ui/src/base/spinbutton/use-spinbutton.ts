'use client';
import { useFormReset, useMachine, useStableId } from "../_shared/react/index";
import { useCallback, useState } from 'react';
import { spinbuttonMachine, spinbuttonRange } from "./spinbutton.machine";
import type { SpinbuttonOptions } from "./spinbutton.machine";
import { connectSpinbutton } from "./spinbutton.connect";

export function useSpinbutton(options: SpinbuttonOptions = {}) {
  spinbuttonRange(options);
  const [controlled] = useState(options.value !== undefined);
  const id = useStableId('iris-spinbutton', options.id);
  const service = useMachine(spinbuttonMachine, { props: options });
  const { send } = service;
  const reset = useCallback(() => send({ type: 'RESET' }), [send]);
  const inputRef = useFormReset(options.form, reset);
  if (controlled !== (options.value !== undefined))
    throw new Error('Spinbutton cannot switch control modes. Use null for empty.');
  return connectSpinbutton(service, { ...options, id }, inputRef);
}
export type { SpinbuttonOptions } from "./spinbutton.machine";
export type { SpinbuttonApi } from "./spinbutton.connect";
