import { validateCollection } from "../_shared/core/index";
import type { CollectionItem, Direction } from "../_shared/core/index";

export interface GridCell {
  value: string;
  disabled?: boolean;
  role?: 'gridcell' | 'rowheader' | 'columnheader';
  columnIndex?: number;
}
export interface GridRow {
  value: string;
  cells: readonly GridCell[];
  disabled?: boolean;
  rowIndex?: number;
}
export interface GridPosition {
  row: string;
  column: string;
}
export interface GridOptions {
  rows: readonly GridRow[];
  defaultFocusedCell?: GridPosition;
  /** Pure recovery policy used when a focused cell disappears (e.g. a collapsed tree row). */
  getFocusFallback?: (previous: GridPosition) => GridPosition | null;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedRows?: readonly string[];
  defaultSelectedRows?: readonly string[];
  onSelectedRowsChange?: (value: string[]) => void;
  rowCount?: number;
  columnCount?: number;
  pageSize?: number;
  dir?: Direction;
  disabled?: boolean;
  id?: string;
}
export const cellKey = (row: string, column: string) => JSON.stringify([row, column]);
export function gridItems(rows: readonly GridRow[]): CollectionItem[] {
  return rows.flatMap((row) =>
    row.cells.map((cell) => ({ value: cellKey(row.value, cell.value), disabled: !!row.disabled || !!cell.disabled })),
  );
}
export function gridPosition(rows: readonly GridRow[], key: string | null): GridPosition | null {
  for (const row of rows)
    for (const cell of row.cells)
      if (cellKey(row.value, cell.value) === key) return { row: row.value, column: cell.value };
  return null;
}
export function validateGrid(options: GridOptions) {
  validateCollection(options.rows);
  for (const row of options.rows) {
    validateCollection(row.cells);
    for (const index of [row.rowIndex, ...row.cells.map((cell) => cell.columnIndex)])
      if (index !== undefined && (!Number.isInteger(index) || index < 1))
        throw new Error('Grid indices must be positive integers.');
  }
  for (const count of [options.rowCount, options.columnCount])
    if (count !== undefined && count !== -1 && (!Number.isInteger(count) || count < 0))
      throw new Error('Grid counts must be nonnegative integers or -1.');
  if (options.pageSize !== undefined && (!Number.isInteger(options.pageSize) || options.pageSize < 1))
    throw new Error('Grid pageSize must be a positive integer.');
}
export function sameValues(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
export function normalizeRows(options: GridOptions, value: readonly string[]) {
  if (!options.selectionMode || options.selectionMode === 'none') return [];
  const existing = [...new Set(value)].filter((v) => options.rows.some((row) => row.value === v));
  return options.selectionMode === 'single' ? existing.slice(0, 1) : existing;
}
