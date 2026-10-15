import { createMachine, firstEnabledValue, isItemEnabled, validateCollection } from "../_shared/core/index";
import type { CollectionItem, Direction, MachineArgs } from "../_shared/core/index";

export interface ToggleGroupOptions {
  items: readonly CollectionItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  multiple?: boolean;
  allowEmpty?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  dir?: Direction;
  loop?: boolean;
  rovingFocus?: boolean;
  id?: string;
}
export interface ToggleGroupSchema {
  state: 'idle';
  context: { value: readonly string[] };
  props: ToggleGroupOptions;
  event: { type: 'TOGGLE'; value: string } | { type: 'SET'; value: readonly string[] };
}
export function normalizeToggleValue(props: ToggleGroupOptions, value: readonly string[]): string[] {
  const selected = [...new Set(value)].filter((key) => props.items.some((item) => item.value === key));
  return props.multiple ? selected : selected.slice(0, 1);
}
function recoverSelection(props: ToggleGroupOptions, value: readonly string[]) {
  const selected = normalizeToggleValue(props, value);
  const first = firstEnabledValue(props.items);
  return props.allowEmpty === false && selected.length === 0 && first !== null ? [first] : selected;
}
export const toggleGroupValue = (props: ToggleGroupOptions, context: Readonly<ToggleGroupSchema['context']>) =>
  normalizeToggleValue(props, props.value ?? context.value);
const same = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((value) => b.includes(value));
function requested({ props, context, event }: MachineArgs<ToggleGroupSchema, ToggleGroupSchema['event']>) {
  const current = toggleGroupValue(props, context);
  if (event.type === 'SET') return normalizeToggleValue(props, event.value);
  return current.includes(event.value)
    ? current.filter((value) => value !== event.value)
    : props.multiple
      ? [...current, event.value]
      : [event.value];
}
const change = {
  guard: (args: MachineArgs<ToggleGroupSchema, ToggleGroupSchema['event']>) => {
    const current = toggleGroupValue(args.props, args.context);
    const next = requested(args);
    const allowed =
      args.event.type === 'TOGGLE'
        ? isItemEnabled(args.props.items, args.event.value)
        : next.filter((key) => !current.includes(key)).every((key) => isItemEnabled(args.props.items, key));
    return (
      !args.props.disabled && !(args.props.allowEmpty === false && next.length === 0) && !same(current, next) && allowed
    );
  },
  assign: (args: MachineArgs<ToggleGroupSchema, ToggleGroupSchema['event']>) => ({
    value: args.props.value !== undefined ? args.context.value : requested(args),
  }),
  actions: [
    (args: MachineArgs<ToggleGroupSchema, ToggleGroupSchema['event']>) => {
      args.props.onValueChange?.(args.props.value !== undefined ? requested(args) : [...args.context.value]);
    },
  ],
};
export const toggleGroupMachine = createMachine<ToggleGroupSchema>({
  initial: 'idle',
  context: ({ props }) => {
    validateCollection(props.items);
    return { value: props.value !== undefined ? [] : recoverSelection(props, props.defaultValue ?? []) };
  },
  states: { idle: {} },
  onProps: {
    guard: ({ props, context }) =>
      props.value === undefined && !same(context.value, recoverSelection(props, context.value)),
    assign: ({ props, context }) => ({ value: recoverSelection(props, context.value) }),
    actions: [({ props, context }) => props.onValueChange?.([...context.value])],
  },
  on: { TOGGLE: change, SET: change },
});
