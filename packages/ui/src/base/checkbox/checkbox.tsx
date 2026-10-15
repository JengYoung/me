'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useCheckbox } from "./use-checkbox";
import type { CheckboxApi, CheckboxOptions } from "./use-checkbox";

const Context = createContext<CheckboxApi | null>(null);
function useCheckboxContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Checkbox parts must be rendered inside Checkbox.Root.');
  return api;
}
export type CheckboxRootProps = CheckboxOptions & { children?: ReactNode };
export function CheckboxRoot({ children, ...options }: CheckboxRootProps) {
  const api = useCheckbox(options);
  return <Context value={api}>{children}</Context>;
}
export function CheckboxInput(props: PartProps<'input'>) {
  return <input {...useCheckboxContext().getInputProps(props)} />;
}
export function CheckboxLabel(props: PartProps<'label'>) {
  const { htmlFor, ...bound } = useCheckboxContext().getLabelProps(props);
  return <label htmlFor={htmlFor} {...bound} />;
}
export function CheckboxIndicator(props: PartProps<'span'>) {
  return <span {...useCheckboxContext().getIndicatorProps(props)} />;
}
export const Checkbox = {
  Root: CheckboxRoot,
  Input: CheckboxInput,
  Label: CheckboxLabel,
  Indicator: CheckboxIndicator,
};
