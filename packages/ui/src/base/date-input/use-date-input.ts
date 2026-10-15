'use client';
import { useField } from "../field/index";
import type { FieldOptions } from "../field/index";
import { useDirectionContext, useFormReset, useMachine, useStableId } from "../_shared/react/index";
import { useCallback, useState } from 'react';
import { dateInputMachine, dateInputParts } from "./date-input.machine";
import type { DateInputMachineOptions } from "./date-input.machine";
import { dateValidity, validateDateOptions } from "./date-value";
import { connectDateInput } from "./date-input.connect";

export type DateInputOptions = DateInputMachineOptions & FieldOptions;
export function useDateInput(options: DateInputOptions = {}) {
  validateDateOptions(options, [options.value, options.defaultValue]);
  const [initial] = useState({ controlled: options.value !== undefined, granularity: options.granularity ?? 'day' });
  const id = useStableId('iris-date-input', options.id);
  const inherited = useDirectionContext();
  const props = { ...options, dir: options.dir ?? inherited, id };
  const service = useMachine(dateInputMachine, { props });
  const validity = dateValidity(dateInputParts(props, service.state.context), props);
  const invalid =
    !!options.invalid ||
    service.state.context.rejectedPaste ||
    validity === 'invalid' ||
    validity === 'incomplete' ||
    (!!options.required && validity === 'empty');
  const field = useField({ ...options, id, invalid });
  const { send } = service;
  const reset = useCallback(() => send({ type: 'RESET' }), [send]);
  const resetRef = useFormReset(options.form, reset);
  if (initial.controlled !== (options.value !== undefined) || initial.granularity !== (options.granularity ?? 'day'))
    throw new Error('Date Input control mode and granularity must stay stable.');
  return connectDateInput(service, props, field, resetRef);
}
export type { DateInputApi, DateInputSegmentData } from "./date-input.connect";
