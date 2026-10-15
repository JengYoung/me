'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useTable } from "./use-table";
import type { TableApi, TableOptions } from "./use-table";
const Context = createContext<TableApi | null>(null);
function useTableContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Table parts must be rendered inside Table.Root.');
  return api;
}
export type TableRootProps = PartProps<'table'> & TableOptions;
export function TableRoot({ id, rowCount, columnCount, ...props }: TableRootProps) {
  const api = useTable({ id, rowCount, columnCount });
  return (
    <Context value={api}>
      <table {...api.getRootProps(props)} />
    </Context>
  );
}
export function TableCaption(props: PartProps<'caption'>) {
  return <caption {...useTableContext().getCaptionProps(props)} />;
}
export function TableHead(props: PartProps<'thead'>) {
  return <thead {...useTableContext().getHeadProps(props)} />;
}
export function TableBody(props: PartProps<'tbody'>) {
  return <tbody {...useTableContext().getBodyProps(props)} />;
}
export function TableFoot(props: PartProps<'tfoot'>) {
  return <tfoot {...useTableContext().getFootProps(props)} />;
}
export function TableRow(props: PartProps<'tr'>) {
  return <tr {...useTableContext().getRowProps(props)} />;
}
export function TableHeaderCell(props: PartProps<'th'>) {
  return <th {...useTableContext().getHeaderCellProps(props)} />;
}
export function TableCell(props: PartProps<'td'>) {
  return <td {...useTableContext().getCellProps(props)} />;
}
export const Table = {
  Root: TableRoot,
  Caption: TableCaption,
  Head: TableHead,
  Body: TableBody,
  Foot: TableFoot,
  Row: TableRow,
  HeaderCell: TableHeaderCell,
  Cell: TableCell,
};
