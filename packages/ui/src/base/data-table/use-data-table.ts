'use client';
import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { useStableId } from "../_shared/react/index";
import { useTable } from "../table/index";
import { useGrid } from "../grid/index";
import { usePagination } from "../pagination/index";
import { createDataTableAdapter } from "./client-adapter";
import { connectDataTable } from "./data-table.connect";
import type { DataTableAdapter, DataTableEngineOptions } from "./data-table.types";

export interface DataTableOptions<Row> extends DataTableEngineOptions<Row> {
  adapter?: DataTableAdapter<Row>;
  mode?: 'table' | 'grid';
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  dir?: 'ltr' | 'rtl';
  id?: string;
}
const useCommit = typeof document === 'undefined' ? useEffect : useLayoutEffect;
/** The engine owns all data state. Grid owns only focus and interaction mode. */
export function useDataTable<Row>(options: DataTableOptions<Row>) {
  const id = useStableId('iris-data-table', options.id);
  const headerId = `${id}-headers`;
  const [owner] = useState(() => ({
    adapter: options.adapter ?? createDataTableAdapter(options),
    supplied: options.adapter,
  }));
  if (owner.supplied !== options.adapter) throw new Error('Data Table adapter must be stable.');
  const { adapter } = owner;
  const snapshot = useSyncExternalStore(adapter.subscribe, adapter.getSnapshot, adapter.getSnapshot);
  useCommit(() => adapter.configure(options), [adapter, options]);
  const total = snapshot.rowCount === -1 ? -1 : snapshot.rowCount + 1;
  const table = useTable({ id, rowCount: total, columnCount: options.columns.length || undefined });
  const rows = [
    {
      value: headerId,
      rowIndex: 1,
      cells: snapshot.columns.map((column) => ({
        value: column.id,
        role: 'columnheader' as const,
        disabled: column.sortable === false,
        columnIndex: options.columns.indexOf(column) + 1,
      })),
    },
    ...snapshot.rows.map((row, index) => ({
      value: row.id,
      rowIndex: snapshot.state.pagination.pageIndex * snapshot.state.pagination.pageSize + index + 2,
      cells: snapshot.columns.map((column) => ({
        value: column.id,
        columnIndex: options.columns.indexOf(column) + 1,
      })),
    })),
  ];
  if (snapshot.rows.some((row) => row.id === headerId))
    throw new Error('A row ID collides with the Data Table header ID.');
  const grid = useGrid({
    id,
    rows: options.mode === 'grid' ? rows : [],
    rowCount: total,
    columnCount: options.columns.length,
    selectionMode: options.selectionMode ?? 'multiple',
    selectedRows: snapshot.state.selectedRows,
    onSelectedRowsChange(selected) {
      const latest = adapter.getSnapshot();
      const visible = new Set(latest.rows.map((row) => row.id));
      adapter.setSelectedRows([
        ...(options.selectionMode === 'single' ? [] : latest.state.selectedRows.filter((row) => !visible.has(row))),
        ...selected.filter((row) => row !== headerId),
      ]);
    },
    disabled: options.disabled,
    dir: options.dir,
    pageSize: snapshot.state.pagination.pageSize,
    getFocusFallback(previous) {
      const row =
        rows.find((item) => item.value === previous.row) ?? rows.find((item) => item.value !== headerId) ?? rows[0];
      const column =
        row?.cells.find((cell) => cell.value === previous.column && !('disabled' in cell && cell.disabled)) ??
        row?.cells.find((cell) => !('disabled' in cell && cell.disabled));
      return row && column ? { row: row.value, column: column.value } : null;
    },
  });
  const pagination = usePagination({
    count:
      snapshot.rowCount === -1
        ? (snapshot.state.pagination.pageIndex + 1) * snapshot.state.pagination.pageSize
        : snapshot.rowCount,
    page: snapshot.state.pagination.pageIndex + 1,
    pageSize: snapshot.state.pagination.pageSize,
    onPageChange: (page) => adapter.setPagination({ ...adapter.getSnapshot().state.pagination, pageIndex: page - 1 }),
    disabled: options.disabled,
  });
  return connectDataTable(snapshot, { ...options, id }, adapter, table, grid, pagination, headerId);
}
export type DataTableApi<Row = unknown> = ReturnType<typeof useDataTable<Row>>;
