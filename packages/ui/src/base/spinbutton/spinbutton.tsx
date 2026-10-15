'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useSpinbutton } from './use-spinbutton';
import type { SpinbuttonApi, SpinbuttonOptions } from './use-spinbutton';
const Context = createContext<SpinbuttonApi | null>(null);
function useSpinbuttonContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Spinbutton parts must be rendered inside Spinbutton.Root.');
  return api;
}
export type SpinbuttonRootProps = SpinbuttonOptions & { children?: ReactNode };
export function SpinbuttonRoot({ children, ...options }: SpinbuttonRootProps) {
  const api = useSpinbutton(options);
  return <Context value={api}>{children}</Context>;
}
export function SpinbuttonInput(props: PartProps<'input'>) {
  return <input {...useSpinbuttonContext().getInputProps(props)} />;
}
export function SpinbuttonLabel(props: PartProps<'label'>) {
  const { htmlFor, ...bound } = useSpinbuttonContext().getLabelProps(props);
  return <label htmlFor={htmlFor} {...bound} />;
}
export function SpinbuttonIncrement(props: PartProps<'button'>) {
  return <button {...useSpinbuttonContext().getIncrementProps(props)} />;
}
export function SpinbuttonDecrement(props: PartProps<'button'>) {
  return <button {...useSpinbuttonContext().getDecrementProps(props)} />;
}
export function SpinbuttonHiddenInput(props: PartProps<'input'>) {
  return <input {...useSpinbuttonContext().getHiddenInputProps(props)} />;
}
export type SpinbuttonValueProps = { children: (api: SpinbuttonApi) => ReactNode };
export function SpinbuttonValue({ children }: SpinbuttonValueProps) {
  return children(useSpinbuttonContext());
}
export const Spinbutton = {
  Root: SpinbuttonRoot,
  Input: SpinbuttonInput,
  Label: SpinbuttonLabel,
  Increment: SpinbuttonIncrement,
  Decrement: SpinbuttonDecrement,
  HiddenInput: SpinbuttonHiddenInput,
  Value: SpinbuttonValue,
};
