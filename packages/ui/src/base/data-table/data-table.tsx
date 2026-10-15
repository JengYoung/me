'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useDataTable } from './use-data-table';
import type { DataTableApi, DataTableOptions } from './use-data-table';
type PartsApi = Pick<
  DataTableApi,
  | 'getTableProps'
  | 'getCaptionProps'
  | 'getHeadProps'
  | 'getBodyProps'
  | 'getHeaderProps'
  | 'getRowProps'
  | 'getCellProps'
  | 'getSortProps'
  | 'getGridProps'
  | 'getGridHeaderRowProps'
  | 'getGridHeaderProps'
  | 'getGridRowProps'
  | 'getGridCellProps'
  | 'getStatusProps'
  | 'getPreviousProps'
  | 'getNextProps'
>;
const Context = createContext<PartsApi | null>(null);
function useParts() {
  const api = useContext(Context);
  if (!api) throw new Error('Data Table parts require DataTable.Root.');
  return api;
}
export function DataTableRoot<Row>({
  options,
  children,
}: {
  options: DataTableOptions<Row>;
  children: ReactNode | ((api: DataTableApi<Row>) => ReactNode);
}) {
  const api = useDataTable(options);
  return <Context value={api}>{typeof children === 'function' ? children(api) : children}</Context>;
}
export function DataTableTable(props: PartProps<'table'>) {
  return <table {...useParts().getTableProps(props)} />;
}
export function DataTableCaption(props: PartProps<'caption'>) {
  return <caption {...useParts().getCaptionProps(props)} />;
}
export function DataTableHead(props: PartProps<'thead'>) {
  return <thead {...useParts().getHeadProps(props)} />;
}
export function DataTableBody(props: PartProps<'tbody'>) {
  return <tbody {...useParts().getBodyProps(props)} />;
}
export function DataTableHeader({ column, ...props }: { column: string } & PartProps<'th'>) {
  return <th {...useParts().getHeaderProps(column, props)} />;
}
export function DataTableRow({ row, ...props }: { row: string } & PartProps<'tr'>) {
  return <tr {...useParts().getRowProps(row, props)} />;
}
export function DataTableCell({ row, column, ...props }: { row: string; column: string } & PartProps<'td'>) {
  return <td {...useParts().getCellProps(row, column, props)} />;
}
export function DataTableSort({ column, ...props }: { column: string } & PartProps<'button'>) {
  return <button {...useParts().getSortProps(column, props)} />;
}
export function DataTableGrid(props: PartProps<'div'>) {
  return <div {...useParts().getGridProps(props)} />;
}
export function DataTableGridHeaderRow(props: PartProps<'div'>) {
  return <div {...useParts().getGridHeaderRowProps(props)} />;
}
export function DataTableGridHeader({ column, ...props }: { column: string } & PartProps<'div'>) {
  return <div {...useParts().getGridHeaderProps(column, props)} />;
}
export function DataTableGridRow({ row, ...props }: { row: string } & PartProps<'div'>) {
  return <div {...useParts().getGridRowProps(row, props)} />;
}
export function DataTableGridCell({ row, column, ...props }: { row: string; column: string } & PartProps<'div'>) {
  return <div {...useParts().getGridCellProps(row, column, props)} />;
}
export function DataTableStatus(props: PartProps<'div'>) {
  return <div {...useParts().getStatusProps(props)} />;
}
export function DataTablePrevious(props: PartProps<'button'>) {
  return <button {...useParts().getPreviousProps(props)} />;
}
export function DataTableNext(props: PartProps<'button'>) {
  return <button {...useParts().getNextProps(props)} />;
}
export const DataTable = {
  Root: DataTableRoot,
  Table: DataTableTable,
  Caption: DataTableCaption,
  Head: DataTableHead,
  Body: DataTableBody,
  Header: DataTableHeader,
  Row: DataTableRow,
  Cell: DataTableCell,
  Sort: DataTableSort,
  Grid: DataTableGrid,
  GridHeaderRow: DataTableGridHeaderRow,
  GridHeader: DataTableGridHeader,
  GridRow: DataTableGridRow,
  GridCell: DataTableGridCell,
  Status: DataTableStatus,
  Previous: DataTablePrevious,
  Next: DataTableNext,
};
