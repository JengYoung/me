'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import type { TextFieldInputProps } from "../text-field/index";
import { useCommand } from "./use-command";
import type { CommandApi, CommandOptions } from "./use-command";
const Context = createContext<CommandApi | null>(null);
function useCommandContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Command parts must be rendered inside Command.Root.');
  return api;
}
export function CommandRoot({
  children,
  rootProps,
  ...options
}: CommandOptions & { children?: ReactNode | ((api: CommandApi) => ReactNode); rootProps?: PartProps<'div'> }) {
  const api = useCommand(options);
  return (
    <Context value={api}>
      <div {...api.getRootProps(rootProps)}>{typeof children === 'function' ? children(api) : children}</div>
    </Context>
  );
}
export function CommandInput(props: TextFieldInputProps) {
  return <input {...useCommandContext().getInputProps(props)} />;
}
export function CommandList(props: PartProps<'div'>) {
  return <div {...useCommandContext().getListProps(props)} />;
}
export function CommandItem({ id, ...props }: Omit<PartProps<'div'>, 'id'> & { id: string }) {
  return <div {...useCommandContext().getItemProps(id, props)} />;
}
export function CommandGroup({ group, ...props }: PartProps<'div'> & { group: string }) {
  return <div {...useCommandContext().getGroupProps(group, props)} />;
}
export function CommandGroupLabel({ group, ...props }: PartProps<'div'> & { group: string }) {
  return <div {...useCommandContext().getGroupLabelProps(group, props)} />;
}
export function CommandEmpty(props: PartProps<'div'>) {
  return <div {...useCommandContext().getEmptyProps(props)} />;
}
export function CommandLabel(props: PartProps<'label'>) {
  // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- Getter supplies htmlFor.
  return <label {...useCommandContext().getLabelProps(props)} />;
}
export function CommandDescription(props: PartProps<'span'>) {
  return <span {...useCommandContext().getDescriptionProps(props)} />;
}
export function CommandError(props: PartProps<'span'>) {
  return <span {...useCommandContext().getErrorProps(props)} />;
}
export const Command = {
  Root: CommandRoot,
  Input: CommandInput,
  List: CommandList,
  Item: CommandItem,
  Group: CommandGroup,
  GroupLabel: CommandGroupLabel,
  Empty: CommandEmpty,
  Label: CommandLabel,
  Description: CommandDescription,
  Error: CommandError,
};
