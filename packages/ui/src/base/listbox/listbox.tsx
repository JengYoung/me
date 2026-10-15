'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useListbox } from "./use-listbox";
import type { ListboxApi, ListboxOptions } from "./use-listbox";
const Context = createContext<ListboxApi | null>(null);
export function useListboxContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Listbox parts must be rendered inside Listbox.Root.');
  return api;
}
export type ListboxRootProps = Omit<PartProps<'div'>, keyof ListboxOptions | 'defaultValue'> & ListboxOptions;
export function ListboxRoot({
  items,
  value,
  defaultValue,
  onValueChange,
  activeValue,
  defaultActiveValue,
  onActiveValueChange,
  multiple,
  selectionFollowsFocus,
  orientation,
  dir,
  loop,
  disabled,
  virtualFocus,
  id,
  ...props
}: ListboxRootProps) {
  const api = useListbox({
    items,
    value,
    defaultValue,
    onValueChange,
    activeValue,
    defaultActiveValue,
    onActiveValueChange,
    multiple,
    selectionFollowsFocus,
    orientation,
    dir,
    loop,
    disabled,
    virtualFocus,
    id,
  });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export function ListboxOption({ value, ...props }: PartProps<'div'> & { value: string }) {
  return <div {...useListboxContext().getOptionProps(value, props)} />;
}
export function ListboxGroup({ value, ...props }: PartProps<'div'> & { value: string }) {
  return <div {...useListboxContext().getGroupProps(value, props)} />;
}
export function ListboxGroupLabel({ value, ...props }: PartProps<'div'> & { value: string }) {
  return <div {...useListboxContext().getGroupLabelProps(value, props)} />;
}
export const Listbox = { Root: ListboxRoot, Option: ListboxOption, Group: ListboxGroup, GroupLabel: ListboxGroupLabel };
