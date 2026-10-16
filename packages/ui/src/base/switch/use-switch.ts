'use client';

import { useMachine, useNativeCheckbox, useStableId } from '../_shared/react/index';
import { useCallback, useState } from 'react';
import { switchChecked, switchMachine } from './switch.machine';
import type { SwitchOptions } from './switch.machine';
import { connectSwitch } from './switch.connect';

export function useSwitch(options: SwitchOptions = {}) {
  const [controlled] = useState(options.checked !== undefined);
  const id = useStableId('iris-switch', options.id);
  const service = useMachine(switchMachine, { props: options });
  const { getProps, getSnapshot, send } = service;
  const getChecked = useCallback(() => switchChecked(getProps(), getSnapshot()), [getProps, getSnapshot]);
  const onReset = useCallback(() => send({ type: 'RESET' }), [send]);
  const inputRef = useNativeCheckbox({
    checked: switchChecked(options, service.state),
    form: options.form,
    getChecked,
    onReset,
  });
  if (controlled !== (options.checked !== undefined)) throw new Error('Switch cannot switch control modes.');
  return connectSwitch(service, { ...options, id }, inputRef);
}
export type { SwitchOptions } from './switch.machine';
export type { SwitchApi } from './switch.connect';
