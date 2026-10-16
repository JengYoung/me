'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import type { TextFieldInputProps, TextFieldTextareaProps } from '../text-field/index';
import { useEditable } from './use-editable';
import type { EditableApi, EditableOptions } from './use-editable';

const Context = createContext<EditableApi | null>(null);
function useEditableContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Editable parts must be rendered inside Editable.Root.');
  return api;
}
export function EditableRoot({
  children,
  rootProps,
  ...options
}: EditableOptions & { children?: ReactNode; rootProps?: PartProps<'div'> }) {
  const api = useEditable(options);
  return (
    <Context value={api}>
      <div {...api.getRootProps(rootProps)}>{children}</div>
    </Context>
  );
}
export function EditablePreview({ children, ...props }: PartProps<'span'>) {
  const api = useEditableContext();
  return <span {...api.getPreviewProps(props)}>{children ?? api.value}</span>;
}
export function EditableInput(props: TextFieldInputProps) {
  return <input {...useEditableContext().getInputProps(props)} />;
}
export function EditableTextarea(props: TextFieldTextareaProps) {
  return <textarea {...useEditableContext().getTextareaProps(props)} />;
}
export function EditableLabel(props: PartProps<'label'>) {
  // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- getLabelProps supplies htmlFor for the stable native control.
  return <label {...useEditableContext().getLabelProps(props)} />;
}
export function EditableDescription(props: PartProps<'span'>) {
  return <span {...useEditableContext().getDescriptionProps(props)} />;
}
export function EditableError(props: PartProps<'span'>) {
  return <span {...useEditableContext().getErrorProps(props)} />;
}
export function EditableEditTrigger(props: PartProps<'button'>) {
  return <button {...useEditableContext().getEditTriggerProps(props)} />;
}
export function EditableSubmitTrigger(props: PartProps<'button'>) {
  return <button {...useEditableContext().getSubmitTriggerProps(props)} />;
}
export function EditableCancelTrigger(props: PartProps<'button'>) {
  return <button {...useEditableContext().getCancelTriggerProps(props)} />;
}
export const Editable = {
  Root: EditableRoot,
  Preview: EditablePreview,
  Input: EditableInput,
  Textarea: EditableTextarea,
  Label: EditableLabel,
  Description: EditableDescription,
  Error: EditableError,
  EditTrigger: EditableEditTrigger,
  SubmitTrigger: EditableSubmitTrigger,
  CancelTrigger: EditableCancelTrigger,
};
