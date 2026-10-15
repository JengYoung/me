'use client';
/* oxlint-disable jsx-a11y/label-has-associated-control -- The field getter supplies the tested htmlFor/control ID. */
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useForm } from "./use-form";
import type { FormApi, FormOptions } from "./use-form";
import { useFormField } from "./use-form-field";
import type { FormFieldApi, FormFieldOptions } from "./use-form-field";

const Context = createContext<FormApi | null>(null);
const FieldContext = createContext<FormFieldApi | null>(null);
export function useFormContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Form parts must be inside Form.Root.');
  return api;
}
function useFieldContext() {
  const api = useContext(FieldContext);
  if (!api) throw new Error('Form field parts must be inside Form.Field.');
  return api;
}
export function FormRoot({ options = {}, ...props }: { options?: FormOptions } & PartProps<'form'>) {
  const api = useForm(options);
  return (
    <Context value={api}>
      <form {...api.getRootProps(props)} />
    </Context>
  );
}
export function FormField({ children, ...options }: FormFieldOptions & { children?: ReactNode }) {
  const api = useFormField(useFormContext(), options);
  return <FieldContext value={api}>{children}</FieldContext>;
}
export function FormLabel(props: PartProps<'label'>) {
  return <label {...useFieldContext().getLabelProps(props)} />;
}
export function FormInput(props: PartProps<'input'>) {
  return <input {...useFieldContext().getInputProps(props)} />;
}
export function FormTextarea(props: PartProps<'textarea'>) {
  return <textarea {...useFieldContext().getTextareaProps(props)} />;
}
export function FormSelect(props: PartProps<'select'>) {
  return <select {...useFieldContext().getSelectProps(props)} />;
}
export function FormChoice({ value, ...props }: Omit<PartProps<'input'>, 'value'> & { value: string }) {
  return <input {...useFieldContext().getChoiceProps(value, props)} />;
}
export function FormDescription(props: PartProps<'span'>) {
  return <span {...useFieldContext().getDescriptionProps(props)} />;
}
export function FormError(props: PartProps<'span'>) {
  const field = useFieldContext();
  return <span {...field.getErrorProps({ children: field.error, ...props })} />;
}
export function FormSummary(props: PartProps<'div'>) {
  const form = useFormContext();
  return (
    <div {...form.getSummaryProps(props)}>
      {props.children ?? (
        <>
          {form.snapshot.formError}
          <ul>
            {Object.entries(form.snapshot.errors)
              .filter(([, error]) => error)
              .map(([name, error]) => (
                <li key={name}>
                  <a {...form.getErrorLinkProps(name)}>{error}</a>
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
}
export function FormSubmit(props: PartProps<'button'>) {
  return <button {...useFormContext().getSubmitProps(props)} />;
}
export function FormReset(props: PartProps<'button'>) {
  return <button {...useFormContext().getResetProps(props)} />;
}
export const Form = {
  Root: FormRoot,
  Field: FormField,
  Label: FormLabel,
  Input: FormInput,
  Textarea: FormTextarea,
  Select: FormSelect,
  Choice: FormChoice,
  Description: FormDescription,
  Error: FormError,
  Summary: FormSummary,
  Submit: FormSubmit,
  Reset: FormReset,
};
