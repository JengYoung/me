'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import type { TextFieldInputProps } from '../text-field/index';
import { usePasswordInput } from './use-password-input';
import type { PasswordInputOptions, PasswordInputApi } from './use-password-input';

const Context = createContext<PasswordInputApi | null>(null);
function usePasswordInputContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Password Input parts must be rendered inside PasswordInput.Root.');
  return api;
}
export function PasswordInputRoot({ children, ...options }: PasswordInputOptions & { children?: ReactNode }) {
  return <Context value={usePasswordInput(options)}>{children}</Context>;
}
export function PasswordInputControl(props: TextFieldInputProps) {
  return <input {...usePasswordInputContext().getInputProps(props)} />;
}
export function PasswordInputToggle(props: PartProps<'button'>) {
  return <button {...usePasswordInputContext().getToggleProps(props)} />;
}
export function PasswordInputLabel(props: PartProps<'label'>) {
  // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- The getter supplies the native input/label association.
  return <label {...usePasswordInputContext().getLabelProps(props)} />;
}
export function PasswordInputDescription(props: PartProps<'span'>) {
  return <span {...usePasswordInputContext().getDescriptionProps(props)} />;
}
export function PasswordInputError(props: PartProps<'span'>) {
  return <span {...usePasswordInputContext().getErrorProps(props)} />;
}
export const PasswordInput = {
  Root: PasswordInputRoot,
  Input: PasswordInputControl,
  Toggle: PasswordInputToggle,
  Label: PasswordInputLabel,
  Description: PasswordInputDescription,
  Error: PasswordInputError,
};
