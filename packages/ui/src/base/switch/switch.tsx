'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useSwitch } from './use-switch';
import type { SwitchApi, SwitchOptions } from './use-switch';

const Context = createContext<SwitchApi | null>(null);
function useSwitchContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Switch parts must be rendered inside Switch.Root.');
  return api;
}
export type SwitchRootProps = SwitchOptions & { children?: ReactNode };
export function SwitchRoot({ children, ...options }: SwitchRootProps) {
  const api = useSwitch(options);
  return <Context value={api}>{children}</Context>;
}
export function SwitchInput(props: PartProps<'input'>) {
  return <input {...useSwitchContext().getInputProps(props)} />;
}
export function SwitchLabel(props: PartProps<'label'>) {
  const { htmlFor, ...bound } = useSwitchContext().getLabelProps(props);
  return <label htmlFor={htmlFor} {...bound} />;
}
export function SwitchIndicator(props: PartProps<'span'>) {
  return <span {...useSwitchContext().getIndicatorProps(props)} />;
}
export const Switch = { Root: SwitchRoot, Input: SwitchInput, Label: SwitchLabel, Indicator: SwitchIndicator };
