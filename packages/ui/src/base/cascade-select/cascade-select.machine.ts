import { createMachine, flattenTree, isTreeBranch } from "../_shared/core/index";
import type { Direction, MachineArgs, TreeNode } from "../_shared/core/index";

export interface CascadeSelectMachineOptions {
  nodes: readonly TreeNode[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  expandedPath?: readonly string[];
  defaultExpandedPath?: readonly string[];
  onExpandedPathChange?: (path: string[]) => void;
  selectionMode?: 'single' | 'multiple';
  allowParentSelection?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  dir?: Direction;
  name?: string;
  form?: string;
}
export const sameCascadeValues = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((value, i) => value === b[i]);
/** Reuse Tree View's node contract, extending disabled to a whole branch. */
export function cascadeNodes(nodes: readonly TreeNode[]): TreeNode[] {
  flattenTree(nodes);
  const visit = (siblings: readonly TreeNode[], disabled = false): TreeNode[] =>
    siblings.map((node) => ({
      ...node,
      disabled: disabled || node.disabled,
      ...(node.children ? { children: visit(node.children, disabled || node.disabled) } : {}),
    }));
  return visit(nodes);
}
export function cascadePath(nodes: readonly TreeNode[], value: string): string[] {
  const entries = flattenTree(nodes);
  const result: string[] = [];
  let entry = entries.find((item) => item.node.value === value);
  while (entry) {
    result.unshift(entry.node.value);
    const parent = entry.parent;
    entry = entries.find((item) => item.node.value === parent);
  }
  return result;
}
export function normalizeCascadeValue(props: CascadeSelectMachineOptions, values: readonly string[]) {
  const entries = flattenTree(cascadeNodes(props.nodes));
  const next = [...new Set(values)].filter((value) =>
    entries.some(
      (entry) =>
        entry.node.value === value && !entry.node.disabled && (props.allowParentSelection || !isTreeBranch(entry.node)),
    ),
  );
  return props.selectionMode === 'multiple' ? next : next.slice(0, 1);
}
export function normalizeCascadePath(props: CascadeSelectMachineOptions, values: readonly string[]) {
  const entries = flattenTree(cascadeNodes(props.nodes));
  const result: string[] = [];
  let parent: string | null = null;
  for (const value of values) {
    const entry = entries.find(
      (item) => item.node.value === value && item.parent === parent && !item.node.disabled && isTreeBranch(item.node),
    );
    if (!entry) break;
    result.push(value);
    parent = value;
  }
  return result;
}
export interface CascadeSelectSchema {
  state: 'idle';
  props: CascadeSelectMachineOptions;
  context: {
    value: readonly string[];
    path: readonly string[];
    initial: readonly string[];
    initialPath: readonly string[];
    requested: string[];
    requestedPath: string[];
    notify: boolean;
    notifyPath: boolean;
  };
  event:
    | { type: 'SELECT'; values: readonly string[] }
    | { type: 'EXPAND'; path: readonly string[] }
    | { type: 'RESET' };
}
export const cascadeValue = (props: CascadeSelectMachineOptions, context: CascadeSelectSchema['context']) =>
  normalizeCascadeValue(props, props.value ?? context.value);
export const cascadeExpanded = (props: CascadeSelectMachineOptions, context: CascadeSelectSchema['context']) =>
  normalizeCascadePath(props, props.expandedPath ?? context.path);
function requestValue(
  props: CascadeSelectMachineOptions,
  context: CascadeSelectSchema['context'],
  values: readonly string[],
) {
  const next = normalizeCascadeValue(props, values);
  return {
    value: props.value === undefined ? next : context.value,
    requested: next,
    notify: !sameCascadeValues(cascadeValue(props, context), next),
  };
}
function requestPath(
  props: CascadeSelectMachineOptions,
  context: CascadeSelectSchema['context'],
  path: readonly string[],
) {
  const next = normalizeCascadePath(props, path);
  return {
    path: props.expandedPath === undefined ? next : context.path,
    requestedPath: next,
    notifyPath: !sameCascadeValues(cascadeExpanded(props, context), next),
  };
}
const notify = ({ props, context }: MachineArgs<CascadeSelectSchema>) => {
  if (context.notify) props.onValueChange?.([...context.requested]);
};
const notifyPath = ({ props, context }: MachineArgs<CascadeSelectSchema>) => {
  if (context.notifyPath) props.onExpandedPathChange?.([...context.requestedPath]);
};
export const cascadeSelectMachine = createMachine<CascadeSelectSchema>({
  initial: 'idle',
  states: { idle: {} },
  context: ({ props }) => {
    const initial = normalizeCascadeValue(props, props.defaultValue ?? []);
    const selected = normalizeCascadeValue(props, props.value ?? initial);
    const inferred = selected[0] ? cascadePath(props.nodes, selected[0]).slice(0, -1) : [];
    const path = normalizeCascadePath(props, props.defaultExpandedPath ?? inferred);
    return {
      value: props.value === undefined ? initial : [],
      path: props.expandedPath === undefined ? path : [],
      initial,
      initialPath: path,
      requested: [],
      requestedPath: [],
      notify: false,
      notifyPath: false,
    };
  },
  onProps: {
    guard: ({ props, context }) =>
      (props.value === undefined && !sameCascadeValues(context.value, cascadeValue(props, context))) ||
      (props.expandedPath === undefined && !sameCascadeValues(context.path, cascadeExpanded(props, context))),
    assign: ({ props, context }) => {
      const value = cascadeValue(props, context);
      const path = cascadeExpanded(props, context);
      return {
        value: props.value === undefined ? value : context.value,
        path: props.expandedPath === undefined ? path : context.path,
        requested: value,
        requestedPath: path,
        notify: props.value === undefined && !sameCascadeValues(context.value, value),
        notifyPath: props.expandedPath === undefined && !sameCascadeValues(context.path, path),
      };
    },
    actions: [notify, notifyPath],
  },
  on: {
    SELECT: {
      guard: ({ props }) => !props.disabled && !props.readOnly,
      assign: ({ props, context, event }) => requestValue(props, context, event.values),
      actions: [notify],
    },
    EXPAND: {
      guard: ({ props }) => !props.disabled,
      assign: ({ props, context, event }) => requestPath(props, context, event.path),
      actions: [notifyPath],
    },
    RESET: {
      assign: ({ props, context }) => ({
        ...requestValue(props, context, context.initial),
        ...requestPath(props, context, context.initialPath),
      }),
      actions: [notify, notifyPath],
    },
  },
});
