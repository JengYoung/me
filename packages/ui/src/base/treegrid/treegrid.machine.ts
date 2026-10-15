import { createMachine, flattenTree, isTreeBranch, sameTreeEntries } from '../_shared/core/index';
import type { TreeNode, TreeEntry } from '../_shared/core/index';
export interface TreeGridStateOptions {
  nodes: readonly TreeNode[];
  expandedValues?: readonly string[];
  defaultExpandedValues?: readonly string[];
  onExpandedValuesChange?: (values: string[]) => void;
  disabled?: boolean;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedRows?: readonly string[];
  defaultSelectedRows?: readonly string[];
  onSelectedRowsChange?: (values: string[]) => void;
}
export interface TreeGridSchema {
  state: 'idle';
  props: TreeGridStateOptions;
  context: { expanded: readonly string[]; selected: readonly string[]; entries: readonly TreeEntry[] };
  event: { type: 'EXPAND'; values: readonly string[] } | { type: 'SELECT'; values: readonly string[] };
}
function normalize(nodes: readonly TreeNode[], values: readonly string[]) {
  const branches = new Set(
    flattenTree(nodes)
      .filter((entry) => isTreeBranch(entry.node))
      .map((entry) => entry.node.value),
  );
  return [...new Set(values)].filter((value) => branches.has(value));
}
export const treeGridExpanded = (props: TreeGridStateOptions, context: TreeGridSchema['context']) =>
  normalize(props.nodes, props.expandedValues ?? context.expanded);
function normalizeSelection(props: TreeGridStateOptions, values: readonly string[]) {
  if (!props.selectionMode || props.selectionMode === 'none') return [];
  const existing = new Set(flattenTree(props.nodes).map((entry) => entry.node.value));
  const selected = [...new Set(values)].filter((value) => existing.has(value));
  return props.selectionMode === 'single' ? selected.slice(0, 1) : selected;
}
export const treeGridSelected = (props: TreeGridStateOptions, context: TreeGridSchema['context']) =>
  normalizeSelection(props, props.selectedRows ?? context.selected);
export const treeGridMachine = createMachine<TreeGridSchema>({
  initial: 'idle',
  context: ({ props }) => {
    const expanded = normalize(props.nodes, props.expandedValues ?? props.defaultExpandedValues ?? []);
    return {
      expanded: props.expandedValues === undefined ? expanded : [],
      selected: props.selectedRows === undefined ? normalizeSelection(props, props.defaultSelectedRows ?? []) : [],
      entries: flattenTree(props.nodes, expanded),
    };
  },
  states: { idle: {} },
  onProps: {
    assign: ({ props, context }) => {
      const entries = flattenTree(props.nodes, treeGridExpanded(props, context));
      const expanded = normalize(props.nodes, context.expanded);
      const selected = normalizeSelection(props, context.selected);
      return {
        entries: sameTreeEntries(entries, context.entries) ? context.entries : entries,
        expanded:
          expanded.length === context.expanded.length && expanded.every((value, i) => value === context.expanded[i])
            ? context.expanded
            : expanded,
        selected:
          selected.length === context.selected.length && selected.every((value, i) => value === context.selected[i])
            ? context.selected
            : selected,
      };
    },
  },
  on: {
    EXPAND: {
      guard: ({ props, context, event }) => {
        if (props.disabled) return false;
        const next = normalize(props.nodes, event.values);
        const current = treeGridExpanded(props, context);
        return next.length !== current.length || next.some((value, i) => value !== current[i]);
      },
      assign: ({ props, context, event }) => ({
        expanded: props.expandedValues === undefined ? normalize(props.nodes, event.values) : context.expanded,
      }),
      actions: [({ props, event }) => props.onExpandedValuesChange?.(normalize(props.nodes, event.values))],
    },
    SELECT: {
      guard: ({ props, context, event }) => {
        if (props.disabled) return false;
        const entries = flattenTree(props.nodes);
        if (
          event.values.some(
            (value) =>
              !entries.some(
                (entry) =>
                  entry.node.value === value &&
                  (!entry.node.disabled || treeGridSelected(props, context).includes(value)),
              ),
          )
        )
          return false;
        const next = normalizeSelection(props, event.values);
        const current = treeGridSelected(props, context);
        return next.length !== current.length || next.some((value, i) => value !== current[i]);
      },
      assign: ({ props, context, event }) => ({
        selected: props.selectedRows === undefined ? normalizeSelection(props, event.values) : context.selected,
      }),
      actions: [({ props, event }) => props.onSelectedRowsChange?.(normalizeSelection(props, event.values))],
    },
  },
});
