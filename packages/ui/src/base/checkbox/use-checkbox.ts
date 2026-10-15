'use client';

import { useMachine, useNativeCheckbox, useStableId } from '../_shared/react/index';
import { useCallback, useState } from 'react';
import { checkboxChecked, checkboxMachine } from './checkbox.machine';
import type { CheckboxOptions } from './checkbox.machine';
import { connectCheckbox } from './checkbox.connect';

export function useCheckbox(options: CheckboxOptions = {}) {
  const [controlled] = useState(options.checked !== undefined);
  const id = useStableId('iris-checkbox', options.id);
  const service = useMachine(checkboxMachine, { props: options });
  const { getProps, getSnapshot, send } = service;
  const getChecked = useCallback(() => checkboxChecked(getProps(), getSnapshot()), [getProps, getSnapshot]);
  const onReset = useCallback(() => send({ type: 'RESET' }), [send]);
  const inputRef = useNativeCheckbox({
    checked: checkboxChecked(options, service.state),
    form: options.form,
    getChecked,
    onReset,
  });
  if (controlled !== (options.checked !== undefined)) throw new Error('Checkbox cannot switch control modes.');
  return connectCheckbox(service, { ...options, id }, inputRef);
}
export type { CheckboxOptions, CheckedState } from './checkbox.machine';
export type { CheckboxApi } from './checkbox.connect';
