'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useCascadeSelect } from "./use-cascade-select";
import type { CascadeSelectApi, CascadeSelectOptions } from "./use-cascade-select";
const Context = createContext<CascadeSelectApi | null>(null);
function useCascadeContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Cascade Select parts must be inside CascadeSelect.Root.');
  return api;
}
export type CascadeSelectRootProps = CascadeSelectOptions & { children?: ReactNode };
export function CascadeSelectRoot({ children, ...options }: CascadeSelectRootProps) {
  const api = useCascadeSelect(options);
  return <Context value={api}>{children}</Context>;
}
export function CascadeSelectTree(props: PartProps<'div'>) {
  return <div {...useCascadeContext().getTreeProps(props)} />;
}
export function CascadeSelectLabel(props: PartProps<'span'>) {
  return <span {...useCascadeContext().getLabelProps(props)} />;
}
export function CascadeSelectDescription(props: PartProps<'span'>) {
  return <span {...useCascadeContext().getDescriptionProps(props)} />;
}
export function CascadeSelectError(props: PartProps<'span'>) {
  return <span {...useCascadeContext().getErrorProps(props)} />;
}
export type CascadeSelectItemProps = PartProps<'div'> & { value: string };
export function CascadeSelectItem({ value, ...props }: CascadeSelectItemProps) {
  return <div {...useCascadeContext().getItemProps(value, props)} />;
}
export function CascadeSelectGroup({ value, ...props }: CascadeSelectItemProps) {
  return <div {...useCascadeContext().getGroupProps(value, props)} />;
}
export type CascadeSelectExpanderProps = PartProps<'button'> & { value: string };
export function CascadeSelectExpander({ value, ...props }: CascadeSelectExpanderProps) {
  return <button {...useCascadeContext().getExpanderProps(value, props)} />;
}
export function CascadeSelectClear(props: PartProps<'button'>) {
  return <button {...useCascadeContext().getClearProps(props)} />;
}
export function CascadeSelectHiddenInput(props: PartProps<'input'>) {
  return <input {...useCascadeContext().getHiddenInputProps(props)} />;
}
export type CascadeSelectValueProps = { children: (api: CascadeSelectApi) => ReactNode };
export function CascadeSelectValue({ children }: CascadeSelectValueProps) {
  return children(useCascadeContext());
}
export const CascadeSelect = {
  Root: CascadeSelectRoot,
  Tree: CascadeSelectTree,
  Label: CascadeSelectLabel,
  Description: CascadeSelectDescription,
  Error: CascadeSelectError,
  Item: CascadeSelectItem,
  Group: CascadeSelectGroup,
  Expander: CascadeSelectExpander,
  Clear: CascadeSelectClear,
  HiddenInput: CascadeSelectHiddenInput,
  Value: CascadeSelectValue,
};
