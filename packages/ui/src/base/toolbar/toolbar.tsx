'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useToolbar } from './use-toolbar';
import type { ToolbarApi, ToolbarOptions } from './use-toolbar';

const Context = createContext<ToolbarApi | null>(null);
/** For composing existing button/radio hooks and parts inside Toolbar.Root. */
export function useToolbarContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Toolbar parts must be rendered inside Toolbar.Root.');
  return api;
}
export type ToolbarRootProps = Omit<PartProps<'div'>, keyof ToolbarOptions | 'defaultValue'> & ToolbarOptions;
export function ToolbarRoot({
  items,
  value,
  defaultValue,
  onValueChange,
  orientation,
  dir,
  loop,
  disabled,
  id,
  ...props
}: ToolbarRootProps) {
  const api = useToolbar({ items, value, defaultValue, onValueChange, orientation, dir, loop, disabled, id });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export function ToolbarItem({ value, ...props }: Omit<PartProps<'button'>, 'value'> & { value: string }) {
  return <button {...useToolbarContext().getItemProps(value, { ...props, type: props.type ?? 'button' })} />;
}
export const Toolbar = { Root: ToolbarRoot, Item: ToolbarItem };
