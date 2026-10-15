'use client';

import { createContext, useContext } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useRadioGroup } from './use-radio-group';
import type { RadioGroupApi, RadioGroupOptions } from './use-radio-group';

const Context = createContext<RadioGroupApi | null>(null);
export type RadioGroupRootProps = Omit<PartProps<'div'>, keyof RadioGroupOptions | 'defaultValue'> & RadioGroupOptions;
export function RadioGroupRoot({
  items,
  value,
  defaultValue,
  onValueChange,
  disabled,
  inToolbar,
  required,
  name,
  form,
  dir,
  id,
  ...props
}: RadioGroupRootProps) {
  const api = useRadioGroup({
    items,
    value,
    defaultValue,
    onValueChange,
    disabled,
    inToolbar,
    required,
    name,
    form,
    dir,
    id,
  });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export function RadioGroupItem({ value, ...props }: Omit<PartProps<'input'>, 'value'> & { value: string }) {
  const api = useContext(Context);
  if (!api) throw new Error('Radio Group items must be rendered inside RadioGroup.Root.');
  return <input {...api.getItemProps(value, props)} />;
}
export const RadioGroup = { Root: RadioGroupRoot, Item: RadioGroupItem };
