'use client';
import { flattenTree, recoverTreeValue } from '../_shared/core/index';
import type { TreeNode } from '../_shared/core/index';
import { useMachine, useStableId } from '../_shared/react/index';
import { useGrid } from '../grid/index';
import type { GridOptions, GridCell } from '../grid/index';
import { useState } from 'react';
import { treeGridMachine, treeGridExpanded, treeGridSelected } from './treegrid.machine';
import type { TreeGridStateOptions } from './treegrid.machine';
import { connectTreeGrid } from './treegrid.connect';

export interface TreeGridNode extends TreeNode {
  readonly cells: readonly GridCell[];
  readonly children?: readonly TreeGridNode[];
}
export interface TreeGridOptions extends Omit<GridOptions, 'rows' | 'getFocusFallback'>, TreeGridStateOptions {
  nodes: readonly TreeGridNode[];
}
export function useTreeGrid(options: TreeGridOptions) {
  const id = useStableId('iris-treegrid', options.id);
  const [controlled] = useState([options.expandedValues !== undefined, options.selectedRows !== undefined]);
  const service = useMachine(treeGridMachine, { props: options });
  const expandedValues = treeGridExpanded(options, service.state.context);
  const entries = flattenTree(options.nodes, expandedValues);
  const rows = entries
    .filter((entry) => entry.visible)
    .map((entry) => {
      const node = entry.node as TreeGridNode;
      return { value: node.value, cells: node.cells, disabled: node.disabled, rowIndex: entries.indexOf(entry) + 1 };
    });
  const grid = useGrid({
    ...options,
    id,
    rows,
    rowCount: options.rowCount ?? entries.length,
    selectedRows: treeGridSelected(options, service.state.context),
    onSelectedRowsChange: (values) => {
      const props = service.getProps();
      const hidden =
        props.selectionMode === 'multiple'
          ? treeGridSelected(props, service.getSnapshot().context).filter(
              (value) => !rows.some((row) => row.value === value),
            )
          : [];
      service.send({ type: 'SELECT', values: [...hidden, ...values] });
    },
    getFocusFallback: (previous) => {
      const value = recoverTreeValue(entries, service.state.context.entries, previous.row);
      const row = rows.find((r) => r.value === value);
      const cell =
        row?.cells.find((c) => c.value === previous.column && !c.disabled) ?? row?.cells.find((c) => !c.disabled);
      return row && cell ? { row: row.value, column: cell.value } : null;
    },
  });
  if (
    controlled[0] !== (options.expandedValues !== undefined) ||
    controlled[1] !== (options.selectedRows !== undefined)
  )
    throw new Error('Treegrid cannot switch control modes.');
  return connectTreeGrid(service, grid, { ...options, id }, entries);
}
export type { TreeGridApi } from './treegrid.connect';
