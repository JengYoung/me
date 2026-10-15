'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useTextField } from "./use-text-field";
import type { TextFieldApi, TextFieldOptions, TextFieldInputProps, TextFieldTextareaProps } from "./use-text-field";

const Context = createContext<TextFieldApi | null>(null);
function useTextFieldContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Text Field parts must be rendered inside TextField.Root.');
  return api;
}
export function TextFieldRoot({ children, ...options }: TextFieldOptions & { children?: ReactNode }) {
  return <Context value={useTextField(options)}>{children}</Context>;
}
export function TextFieldInput(props: TextFieldInputProps) {
  return <input {...useTextFieldContext().getInputProps(props)} />;
}
export function TextFieldTextarea(props: TextFieldTextareaProps) {
  return <textarea {...useTextFieldContext().getTextareaProps(props)} />;
}
export function TextFieldLabel(props: PartProps<'label'>) {
  // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- The getter connects the label to the stable control ID.
  return <label {...useTextFieldContext().getLabelProps(props)} />;
}
export function TextFieldDescription(props: PartProps<'span'>) {
  return <span {...useTextFieldContext().getDescriptionProps(props)} />;
}
export function TextFieldError(props: PartProps<'span'>) {
  return <span {...useTextFieldContext().getErrorProps(props)} />;
}
export const TextField = {
  Root: TextFieldRoot,
  Input: TextFieldInput,
  Textarea: TextFieldTextarea,
  Label: TextFieldLabel,
  Description: TextFieldDescription,
  Error: TextFieldError,
};
