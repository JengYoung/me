'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useNativeSelect } from "./use-native-select";
import type { NativeSelectApi, NativeSelectOptions, NativeSelectControlProps } from "./use-native-select";

const Context = createContext<NativeSelectApi | null>(null);
function useNativeSelectContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Native Select parts must be rendered inside NativeSelect.Root.');
  return api;
}
export function NativeSelectRoot({ children, ...options }: NativeSelectOptions & { children?: ReactNode }) {
  return <Context value={useNativeSelect(options)}>{children}</Context>;
}
export function NativeSelectControl(props: NativeSelectControlProps) {
  return <select {...useNativeSelectContext().getSelectProps(props)} />;
}
export function NativeSelectOption(props: PartProps<'option'>) {
  return <option {...useNativeSelectContext().getOptionProps(props)} />;
}
export function NativeSelectOptgroup(props: PartProps<'optgroup'>) {
  return <optgroup {...useNativeSelectContext().getOptgroupProps(props)} />;
}
export function NativeSelectLabel(props: PartProps<'label'>) {
  // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- The getter connects the label to the stable select ID.
  return <label {...useNativeSelectContext().getLabelProps(props)} />;
}
export function NativeSelectDescription(props: PartProps<'span'>) {
  return <span {...useNativeSelectContext().getDescriptionProps(props)} />;
}
export function NativeSelectError(props: PartProps<'span'>) {
  return <span {...useNativeSelectContext().getErrorProps(props)} />;
}
export const NativeSelect = {
  Root: NativeSelectRoot,
  Select: NativeSelectControl,
  Option: NativeSelectOption,
  Optgroup: NativeSelectOptgroup,
  Label: NativeSelectLabel,
  Description: NativeSelectDescription,
  Error: NativeSelectError,
};
