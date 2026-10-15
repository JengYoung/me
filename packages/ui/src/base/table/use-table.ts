'use client';
import { useStableId } from '../_shared/react/index';
import { connectTable } from './table.connect';
import type { TableOptions } from './table.connect';
export function useTable(options: TableOptions = {}) {
  return connectTable({ ...options, id: useStableId('iris-table', options.id) });
}
export type { TableApi, TableOptions } from './table.connect';
