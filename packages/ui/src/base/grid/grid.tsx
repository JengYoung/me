'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useGrid } from "./use-grid";
import type { GridApi, GridOptions } from "./use-grid";
const Context = createContext<GridApi | null>(null);
function useGridContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Grid parts must be rendered inside Grid.Root.');
  return api;
}
export type GridRootProps = Omit<PartProps<'div'>, 'defaultValue'> & GridOptions;
export function GridRoot({
  rows,
  defaultFocusedCell,
  getFocusFallback,
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
  ...props
}: GridRootProps) {
  const api = useGrid({
    rows,
    defaultFocusedCell,
    getFocusFallback,
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
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export type GridRowProps = PartProps<'div'> & { value: string };
export function GridRow({ value, ...props }: GridRowProps) {
  return <div {...useGridContext().getRowProps(value, props)} />;
}
export type GridCellProps = PartProps<'div'> & { row: string; column: string };
export function GridCell({ row, column, ...props }: GridCellProps) {
  return <div {...useGridContext().getCellProps(row, column, props)} />;
}
export type GridInputProps = PartProps<'input'> & { row: string; column: string };
export function GridInput({ row, column, ...props }: GridInputProps) {
  return <input {...useGridContext().getControlProps<'input'>(row, column, props)} />;
}
export type GridButtonProps = PartProps<'button'> & { row: string; column: string };
export function GridButton({ row, column, ...props }: GridButtonProps) {
  return (
    <button
      {...useGridContext().getControlProps<'button'>(row, column, { ...props, type: props.type ?? 'button' }, 'button')}
    />
  );
}
export const Grid = { Root: GridRoot, Row: GridRow, Cell: GridCell, Input: GridInput, Button: GridButton };
