'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useToggleGroup } from "./use-toggle-group";
import type { ToggleGroupApi, ToggleGroupOptions } from "./use-toggle-group";

const Context = createContext<ToggleGroupApi | null>(null);
function useToggleGroupContext() {
  const api = useContext(Context);
  if (!api) throw new Error('ToggleGroup parts must be rendered inside ToggleGroup.Root.');
  return api;
}
export type ToggleGroupRootProps = Omit<PartProps<'div'>, keyof ToggleGroupOptions | 'defaultValue'> &
  ToggleGroupOptions;
export function ToggleGroupRoot({
  items,
  value,
  defaultValue,
  onValueChange,
  multiple,
  allowEmpty,
  disabled,
  orientation,
  dir,
  loop,
  rovingFocus,
  id,
  ...props
}: ToggleGroupRootProps) {
  const api = useToggleGroup({
    items,
    value,
    defaultValue,
    onValueChange,
    multiple,
    allowEmpty,
    disabled,
    orientation,
    dir,
    loop,
    rovingFocus,
    id,
  });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export type ToggleGroupItemProps = Omit<PartProps<'button'>, 'value'> & { value: string };
export function ToggleGroupItem({ value, ...props }: ToggleGroupItemProps) {
  return <button {...useToggleGroupContext().getItemProps(value, props)} />;
}
export const ToggleGroup = { Root: ToggleGroupRoot, Item: ToggleGroupItem };
