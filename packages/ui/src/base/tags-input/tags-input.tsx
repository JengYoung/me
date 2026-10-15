'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import type { TextFieldInputProps } from "../text-field/index";
import { useTagsInput } from "./use-tags-input";
import type { TagsInputApi, TagsInputOptions } from "./use-tags-input";
const Context = createContext<TagsInputApi | null>(null);
function useTagsInputContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Tags Input parts must be rendered inside TagsInput.Root.');
  return api;
}
export function TagsInputRoot({
  children,
  rootProps,
  ...options
}: TagsInputOptions & { children?: ReactNode | ((api: TagsInputApi) => ReactNode); rootProps?: PartProps<'div'> }) {
  const api = useTagsInput(options);
  return (
    <Context value={api}>
      <div {...api.getRootProps(rootProps)}>{typeof children === 'function' ? children(api) : children}</div>
    </Context>
  );
}
export function TagsInputInput(props: TextFieldInputProps) {
  return <input {...useTagsInputContext().getInputProps(props)} />;
}
export function TagsInputItem({ value, ...props }: PartProps<'div'> & { value: string }) {
  return <div {...useTagsInputContext().getItemProps(value, props)} />;
}
export function TagsInputRemove({ value, ...props }: PartProps<'button'> & { value: string }) {
  return <button {...useTagsInputContext().getRemoveProps(value, props)} />;
}
export function TagsInputLabel(props: PartProps<'label'>) {
  // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Getter provides htmlFor.
  return <label {...useTagsInputContext().getLabelProps(props)} />;
}
export function TagsInputDescription(props: PartProps<'span'>) {
  return <span {...useTagsInputContext().getDescriptionProps(props)} />;
}
export function TagsInputError({ children, ...props }: PartProps<'span'>) {
  const api = useTagsInputContext();
  return <span {...api.getErrorProps(props)}>{children ?? api.message}</span>;
}
export function TagsInputStatus({ children, ...props }: PartProps<'span'>) {
  const api = useTagsInputContext();
  return <span {...api.getStatusProps(props)}>{children ?? api.message}</span>;
}
export function TagsInputHiddenInputs() {
  const api = useTagsInputContext();
  return (
    <>
      {api.value.map((value) => (
        <input key={value} {...api.getHiddenInputProps(value)} />
      ))}
    </>
  );
}
export const TagsInput = {
  Root: TagsInputRoot,
  Input: TagsInputInput,
  Item: TagsInputItem,
  Remove: TagsInputRemove,
  Label: TagsInputLabel,
  Description: TagsInputDescription,
  Error: TagsInputError,
  Status: TagsInputStatus,
  HiddenInputs: TagsInputHiddenInputs,
};
