'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useCombobox } from "./use-combobox";
import type { ComboboxApi, ComboboxOptions } from "./use-combobox";
const Context = createContext<ComboboxApi | null>(null);
export function useComboboxContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Combobox parts must be inside Combobox.Root.');
  return api;
}
export type ComboboxRootProps = Omit<PartProps<'div'>, keyof ComboboxOptions | 'defaultValue'> & ComboboxOptions;
export function ComboboxRoot({
  items,
  value,
  defaultValue,
  onValueChange,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  open,
  defaultOpen,
  onOpenChange,
  mode,
  autocomplete,
  disabled,
  required,
  dir,
  id,
  ...props
}: ComboboxRootProps) {
  const api = useCombobox({
    items,
    value,
    defaultValue,
    onValueChange,
    inputValue,
    defaultInputValue,
    onInputValueChange,
    open,
    defaultOpen,
    onOpenChange,
    mode,
    autocomplete,
    disabled,
    required,
    dir,
    id,
  });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export function ComboboxInput(props: PartProps<'input'>) {
  return <input {...useComboboxContext().getInputProps(props)} />;
}
export function ComboboxTrigger(props: PartProps<'button'>) {
  return <button {...useComboboxContext().getTriggerProps(props)} />;
}
export function ComboboxLabel(props: PartProps<'label'>) {
  // The getter supplies htmlFor and the matching stable control ID.
  // oxlint-disable-next-line jsx-a11y/label-has-associated-control
  return <label {...useComboboxContext().getLabelProps(props)} />;
}
export function ComboboxListbox(props: PartProps<'div'>) {
  return <div {...useComboboxContext().getListboxProps(props)} />;
}
export function ComboboxOption({ value, ...props }: PartProps<'div'> & { value: string }) {
  const api = useComboboxContext();
  return api.items.some((item) => item.value === value) ? <div {...api.getOptionProps(value, props)} /> : null;
}
export function ComboboxGroup({ value, ...props }: PartProps<'div'> & { value: string }) {
  return <div {...useComboboxContext().getGroupProps(value, props)} />;
}
export function ComboboxGroupLabel({ value, ...props }: PartProps<'div'> & { value: string }) {
  return <div {...useComboboxContext().getGroupLabelProps(value, props)} />;
}
export const Combobox = {
  Root: ComboboxRoot,
  Input: ComboboxInput,
  Trigger: ComboboxTrigger,
  Label: ComboboxLabel,
  Listbox: ComboboxListbox,
  Option: ComboboxOption,
  Group: ComboboxGroup,
  GroupLabel: ComboboxGroupLabel,
};
