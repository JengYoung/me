'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useDateInput } from "./use-date-input";
import type { DateInputApi, DateInputOptions } from "./use-date-input";
import type { DateSegmentType } from "./date-value";
const Context = createContext<DateInputApi | null>(null);
function useDateInputContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Date Input parts must be rendered inside DateInput.Root.');
  return api;
}
export type DateInputRootProps = DateInputOptions & { children?: ReactNode };
export function DateInputRoot({ children, ...options }: DateInputRootProps) {
  const api = useDateInput(options);
  return <Context value={api}>{children}</Context>;
}
export function DateInputGroup(props: PartProps<'div'>) {
  return <div {...useDateInputContext().getGroupProps(props)} />;
}
export function DateInputLabel(props: PartProps<'span'>) {
  return <span {...useDateInputContext().getLabelProps(props)} />;
}
export function DateInputDescription(props: PartProps<'span'>) {
  return <span {...useDateInputContext().getDescriptionProps(props)} />;
}
export function DateInputError(props: PartProps<'span'>) {
  return <span {...useDateInputContext().getErrorProps(props)} />;
}
export type DateInputSegmentProps = PartProps<'input'> & { segment: DateSegmentType };
export function DateInputSegment({ segment, ...props }: DateInputSegmentProps) {
  return <input {...useDateInputContext().getSegmentProps(segment, props)} />;
}
export function DateInputHiddenInput(props: PartProps<'input'>) {
  return <input {...useDateInputContext().getHiddenInputProps(props)} />;
}
export type DateInputValueProps = { children: (api: DateInputApi) => ReactNode };
export function DateInputValue({ children }: DateInputValueProps) {
  return children(useDateInputContext());
}
export const DateInput = {
  Root: DateInputRoot,
  Group: DateInputGroup,
  Label: DateInputLabel,
  Description: DateInputDescription,
  Error: DateInputError,
  Segment: DateInputSegment,
  HiddenInput: DateInputHiddenInput,
  Value: DateInputValue,
};
