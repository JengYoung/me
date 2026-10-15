import {
  createMachine,
  flattenTree,
  getTypeaheadTarget,
  isTreeBranch,
  recoverTreeValue,
  sameTreeEntries,
} from "../_shared/core/index";
import type { Direction, TreeEntry, TreeNode } from "../_shared/core/index";
export interface TreeViewOptions {
  nodes: readonly TreeNode[];
  expandedValues?: readonly string[];
  defaultExpandedValues?: readonly string[];
  onExpandedValuesChange?: (values: string[]) => void;
  selectedValues?: readonly string[];
  defaultSelectedValues?: readonly string[];
  onSelectedValuesChange?: (values: string[]) => void;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectionFollowsFocus?: boolean;
  defaultFocusedValue?: string;
  disabled?: boolean;
  dir?: Direction;
  id?: string;
}
export interface TreeViewSchema {
  state: 'idle' | 'searching';
  props: TreeViewOptions;
  context: {
    expanded: readonly string[];
    selected: readonly string[];
    focused: string | null;
    entries: readonly TreeEntry[];
    query: string;
  };
  event:
    | { type: 'EXPAND'; values: readonly string[] }
    | { type: 'SELECT'; values: readonly string[] }
    | { type: 'FOCUS'; value: string }
    | { type: 'TYPE'; character: string }
    | { type: 'CLEAR_SEARCH' };
}
const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((v, i) => v === b[i]);
export function normalizeExpanded(nodes: readonly TreeNode[], values: readonly string[]) {
  const branches = new Set(
    flattenTree(nodes)
      .filter((item) => isTreeBranch(item.node))
      .map((item) => item.node.value),
  );
  return [...new Set(values)].filter((v) => branches.has(v));
}
function normalizeSelected(props: TreeViewOptions, values: readonly string[]) {
  if (props.selectionMode === 'none') return [];
  const existing = new Set(flattenTree(props.nodes).map((entry) => entry.node.value));
  const next = [...new Set(values)].filter((v) => existing.has(v));
  return props.selectionMode === 'multiple' ? next : next.slice(0, 1);
}
export const treeExpanded = (props: TreeViewOptions, context: TreeViewSchema['context']) =>
  normalizeExpanded(props.nodes, props.expandedValues ?? context.expanded);
export const treeSelected = (props: TreeViewOptions, context: TreeViewSchema['context']) =>
  normalizeSelected(props, props.selectedValues ?? context.selected);
export const treeEntries = (props: TreeViewOptions, context: TreeViewSchema['context']) =>
  flattenTree(props.nodes, treeExpanded(props, context));
export const treeFocused = (props: TreeViewOptions, context: TreeViewSchema['context']) =>
  props.disabled ? null : recoverTreeValue(treeEntries(props, context), context.entries, context.focused);
export const treeViewMachine = createMachine<TreeViewSchema>({
  initial: 'idle',
  context: ({ props }) => {
    const expanded = normalizeExpanded(props.nodes, props.expandedValues ?? props.defaultExpandedValues ?? []);
    const selected = normalizeSelected(props, props.selectedValues ?? props.defaultSelectedValues ?? []);
    const entries = flattenTree(props.nodes, expanded);
    return {
      expanded: props.expandedValues === undefined ? expanded : [],
      selected: props.selectedValues === undefined ? selected : [],
      focused: recoverTreeValue(entries, [], props.defaultFocusedValue ?? selected[0] ?? null),
      entries,
      query: '',
    };
  },
  states: {
    idle: {},
    searching: {
      effects: [
        ({ schedule }) => {
          schedule({ type: 'CLEAR_SEARCH' }, 500);
        },
      ],
    },
  },
  onProps: {
    assign: ({ props, context }) => {
      const entries = treeEntries(props, context);
      const expanded = normalizeExpanded(props.nodes, context.expanded);
      const selected = normalizeSelected(props, context.selected);
      return {
        expanded: same(expanded, context.expanded) ? context.expanded : expanded,
        selected: same(selected, context.selected) ? context.selected : selected,
        entries: sameTreeEntries(entries, context.entries) ? context.entries : entries,
        focused: recoverTreeValue(entries, context.entries, context.focused),
      };
    },
  },
  on: {
    EXPAND: {
      guard: ({ props, context, event }) =>
        !props.disabled && !same(treeExpanded(props, context), normalizeExpanded(props.nodes, event.values)),
      assign: ({ props, context, event }) => ({
        expanded: props.expandedValues === undefined ? normalizeExpanded(props.nodes, event.values) : context.expanded,
      }),
      actions: [({ props, event }) => props.onExpandedValuesChange?.(normalizeExpanded(props.nodes, event.values))],
    },
    SELECT: {
      guard: ({ props, context, event }) =>
        !props.disabled &&
        event.values.every((value) =>
          flattenTree(props.nodes).some(
            (entry) =>
              entry.node.value === value && (!entry.node.disabled || treeSelected(props, context).includes(value)),
          ),
        ) &&
        !same(treeSelected(props, context), normalizeSelected(props, event.values)),
      assign: ({ props, context, event }) => ({
        selected: props.selectedValues === undefined ? normalizeSelected(props, event.values) : context.selected,
      }),
      actions: [({ props, event }) => props.onSelectedValuesChange?.(normalizeSelected(props, event.values))],
    },
    FOCUS: {
      guard: ({ props, context, event }) =>
        !props.disabled &&
        treeEntries(props, context).some(
          (entry) => entry.visible && !entry.node.disabled && entry.node.value === event.value,
        ),
      assign: ({ event }) => ({ focused: event.value }),
      actions: [
        ({ props, event, send }) => {
          if (props.selectionFollowsFocus && (props.selectionMode ?? 'single') === 'single')
            send({ type: 'SELECT', values: [event.value] });
        },
      ],
    },
    TYPE: {
      target: 'searching',
      reenter: true,
      guard: ({ props }) => !props.disabled,
      assign: ({ context, event }) => ({ query: context.query + event.character }),
    },
    CLEAR_SEARCH: { target: 'idle', assign: () => ({ query: '' }) },
  },
});
export function treeSearch(props: TreeViewOptions, context: TreeViewSchema['context']) {
  return getTypeaheadTarget(
    treeEntries(props, context)
      .filter((entry) => entry.visible)
      .map((entry) => entry.node),
    treeFocused(props, context),
    context.query,
  );
}
