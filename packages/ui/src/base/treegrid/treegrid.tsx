'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useTreeGrid } from './use-treegrid';
import type { TreeGridApi, TreeGridOptions } from './use-treegrid';
const Context = createContext<TreeGridApi | null>(null);
function useTreeGridContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Treegrid parts must be rendered inside TreeGrid.Root.');
  return api;
}
export type TreeGridRootProps = Omit<PartProps<'div'>, 'children'> &
  TreeGridOptions & { children?: ReactNode | ((api: TreeGridApi) => ReactNode) };
export function TreeGridRoot({
  nodes,
  expandedValues,
  defaultExpandedValues,
  onExpandedValuesChange,
  defaultFocusedCell,
  selectionMode,
  selectedRows,
  defaultSelectedRows,
  onSelectedRowsChange,
  rowCount,
  columnCount,
  pageSize,
  dir,
  disabled,
  id,
  children,
  ...props
}: TreeGridRootProps) {
  const api = useTreeGrid({
    nodes,
    expandedValues,
    defaultExpandedValues,
    onExpandedValuesChange,
    defaultFocusedCell,
    selectionMode,
    selectedRows,
    defaultSelectedRows,
    onSelectedRowsChange,
    rowCount,
    columnCount,
    pageSize,
    dir,
    disabled,
    id,
  });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)}>{typeof children === 'function' ? children(api) : children}</div>
    </Context>
  );
}
export type TreeGridRowProps = PartProps<'div'> & { value: string };
export function TreeGridRow({ value, ...props }: TreeGridRowProps) {
  return <div {...useTreeGridContext().getRowProps(value, props)} />;
}
export type TreeGridCellProps = PartProps<'div'> & { row: string; column: string };
export function TreeGridCell({ row, column, ...props }: TreeGridCellProps) {
  return <div {...useTreeGridContext().getCellProps(row, column, props)} />;
}
export type TreeGridInputProps = PartProps<'input'> & { row: string; column: string };
export function TreeGridInput({ row, column, ...props }: TreeGridInputProps) {
  return <input {...useTreeGridContext().getControlProps<'input'>(row, column, props)} />;
}
export type TreeGridExpanderProps = PartProps<'button'> & { value: string };
export function TreeGridExpander({ value, ...props }: TreeGridExpanderProps) {
  return <button {...useTreeGridContext().getExpanderProps(value, props)} />;
}
export const TreeGrid = {
  Root: TreeGridRoot,
  Row: TreeGridRow,
  Cell: TreeGridCell,
  Input: TreeGridInput,
  Expander: TreeGridExpander,
};
