'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useField } from "./use-field";
import type { FieldApi, FieldOptions } from "./use-field";

const Context = createContext<FieldApi | null>(null);
function useFieldContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Field parts must be rendered inside Field.Root.');
  return api;
}

export function FieldRoot({ children, ...options }: FieldOptions & { children?: ReactNode }) {
  return <Context value={useField(options)}>{children}</Context>;
}
export function FieldControl(props: PartProps<'input'>) {
  return <input {...useFieldContext().getControlProps(props)} />;
}
export function FieldTextarea(props: PartProps<'textarea'>) {
  return <textarea {...useFieldContext().getTextareaProps(props)} />;
}
export function FieldSelect(props: PartProps<'select'>) {
  return <select {...useFieldContext().getSelectProps(props)} />;
}
export function FieldCustomControl(props: PartProps<'div'>) {
  return <div {...useFieldContext().getCustomControlProps(props)} />;
}
export function FieldLabel(props: PartProps<'label'>) {
  // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- getLabelProps supplies the tested htmlFor/control ID pair.
  return <label {...useFieldContext().getLabelProps(props)} />;
}
export function FieldCustomLabel(props: PartProps<'span'>) {
  return <span {...useFieldContext().getCustomLabelProps(props)} />;
}
export function FieldDescription(props: PartProps<'span'>) {
  return <span {...useFieldContext().getDescriptionProps(props)} />;
}
export function FieldError(props: PartProps<'span'>) {
  return <span {...useFieldContext().getErrorProps(props)} />;
}

export const Field = {
  Root: FieldRoot,
  Control: FieldControl,
  Textarea: FieldTextarea,
  Select: FieldSelect,
  CustomControl: FieldCustomControl,
  Label: FieldLabel,
  CustomLabel: FieldCustomLabel,
  Description: FieldDescription,
  Error: FieldError,
};
