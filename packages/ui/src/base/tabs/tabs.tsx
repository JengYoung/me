'use client';

import { createContext, useContext } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useTabs } from './use-tabs';
import type { TabsApi, TabsOptions } from './use-tabs';

const Context = createContext<TabsApi | null>(null);
function useTabsContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Tabs parts must be rendered inside Tabs.Root.');
  return api;
}
export type TabsRootProps = Omit<PartProps<'div'>, keyof TabsOptions | 'defaultValue'> & TabsOptions;
export function TabsRoot({
  items,
  value,
  defaultValue,
  onValueChange,
  activationMode,
  orientation,
  dir,
  loop,
  disabled,
  id,
  ...props
}: TabsRootProps) {
  const api = useTabs({
    items,
    value,
    defaultValue,
    onValueChange,
    activationMode,
    orientation,
    dir,
    loop,
    disabled,
    id,
  });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export function TabsList(props: PartProps<'div'>) {
  return <div {...useTabsContext().getListProps(props)} />;
}
export function TabsTrigger({ value, ...props }: Omit<PartProps<'button'>, 'value'> & { value: string }) {
  return <button {...useTabsContext().getTriggerProps(value, props)} />;
}
export function TabsContent({ value, ...props }: PartProps<'div'> & { value: string }) {
  return <div {...useTabsContext().getContentProps(value, props)} />;
}
export const Tabs = { Root: TabsRoot, List: TabsList, Trigger: TabsTrigger, Content: TabsContent };
