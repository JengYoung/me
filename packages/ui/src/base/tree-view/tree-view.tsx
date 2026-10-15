'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useTreeView } from "./use-tree-view";
import type { TreeViewApi, TreeViewOptions } from "./use-tree-view";
const Context = createContext<TreeViewApi | null>(null);
function useTreeViewContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Tree View parts must be rendered inside TreeView.Root.');
  return api;
}
export type TreeViewRootProps = PartProps<'div'> & TreeViewOptions;
export function TreeViewRoot({
  nodes,
  expandedValues,
  defaultExpandedValues,
  onExpandedValuesChange,
  selectedValues,
  defaultSelectedValues,
  onSelectedValuesChange,
  selectionMode,
  selectionFollowsFocus,
  defaultFocusedValue,
  disabled,
  dir,
  id,
  ...props
}: TreeViewRootProps) {
  const api = useTreeView({
    nodes,
    expandedValues,
    defaultExpandedValues,
    onExpandedValuesChange,
    selectedValues,
    defaultSelectedValues,
    onSelectedValuesChange,
    selectionMode,
    selectionFollowsFocus,
    defaultFocusedValue,
    disabled,
    dir,
    id,
  });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export type TreeViewItemProps = PartProps<'div'> & { value: string };
export function TreeViewItem({ value, ...props }: TreeViewItemProps) {
  return <div {...useTreeViewContext().getItemProps(value, props)} />;
}
export function TreeViewGroup({ value, ...props }: TreeViewItemProps) {
  return <div {...useTreeViewContext().getGroupProps(value, props)} />;
}
export type TreeViewExpanderProps = PartProps<'button'> & { value: string };
export function TreeViewExpander({ value, ...props }: TreeViewExpanderProps) {
  return <button {...useTreeViewContext().getExpanderProps(value, props)} />;
}
export const TreeView = { Root: TreeViewRoot, Item: TreeViewItem, Group: TreeViewGroup, Expander: TreeViewExpander };
