import {
  createMachine,
  firstEnabledValue,
  isItemEnabled,
  recoverValue,
  sameCollection,
  validateCollection,
} from "../_shared/core/index";
import type { CollectionItem, Direction, MachineArgs } from "../_shared/core/index";

export interface RadioGroupOptions {
  items: readonly CollectionItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  disabled?: boolean;
  /** Delegate tab order/navigation to a containing toolbar; arrows do not select. */
  inToolbar?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  dir?: Direction;
  id?: string;
}

export interface RadioGroupSchema {
  state: 'idle' | 'focused';
  props: RadioGroupOptions;
  context: {
    value: string | null;
    defaultValue: string | null;
    focusedValue: string | null;
    items: readonly CollectionItem[];
  };
  event: { type: 'FOCUS'; value: string } | { type: 'SELECT'; value: string } | { type: 'LEAVE' } | { type: 'RESET' };
}

export const radioGroupValue = (props: RadioGroupOptions, context: Readonly<RadioGroupSchema['context']>) =>
  props.value !== undefined ? props.value : context.value;
const exists = (items: readonly CollectionItem[], value: string | null) =>
  items.some((item) => item.value === value) ? value : null;
function reconcile({ context, props, value }: MachineArgs<RadioGroupSchema>) {
  const next = props.value !== undefined ? context.value : exists(props.items, context.value);
  const selected = props.value !== undefined ? props.value : next;
  return {
    value: next,
    focusedValue:
      value === 'focused' && isItemEnabled(props.items, context.focusedValue)
        ? context.focusedValue
        : isItemEnabled(props.items, selected)
          ? selected
          : recoverValue(props.items, context.items, context.focusedValue),
    items: sameCollection(context.items, props.items) ? context.items : props.items,
  };
}

export const radioGroupMachine = createMachine<RadioGroupSchema>({
  initial: 'idle',
  context: ({ props }) => {
    validateCollection(props.items);
    const selected = props.value !== undefined ? props.value : exists(props.items, props.defaultValue ?? null);
    return {
      value: props.value !== undefined ? null : selected,
      defaultValue: props.defaultValue ?? null,
      focusedValue: isItemEnabled(props.items, selected) ? selected : firstEnabledValue(props.items),
      items: props.items,
    };
  },
  states: { idle: {}, focused: {} },
  onProps: [
    {
      guard: (args) => args.props.value === undefined && reconcile(args).value !== args.context.value,
      assign: reconcile,
      actions: [({ props, context }) => props.onValueChange?.(context.value)],
    },
    { assign: reconcile },
  ],
  on: {
    FOCUS: {
      target: 'focused',
      guard: ({ props, event }) => !props.disabled && isItemEnabled(props.items, event.value),
      assign: ({ event }) => ({ focusedValue: event.value }),
    },
    SELECT: {
      guard: ({ props, context, event }) =>
        !props.disabled && isItemEnabled(props.items, event.value) && event.value !== radioGroupValue(props, context),
      assign: ({ props, context, event }) => ({ value: props.value !== undefined ? context.value : event.value }),
      actions: [({ props, event }) => props.onValueChange?.(event.value)],
    },
    LEAVE: {
      target: 'idle',
      assign: ({ props, context }) => ({
        focusedValue: isItemEnabled(props.items, radioGroupValue(props, context))
          ? radioGroupValue(props, context)
          : firstEnabledValue(props.items),
      }),
    },
    RESET: {
      guard: ({ props, context }) => exists(props.items, context.defaultValue) !== radioGroupValue(props, context),
      assign: ({ props, context }) => ({
        value: props.value !== undefined ? context.value : exists(props.items, context.defaultValue),
      }),
      actions: [({ props, context }) => props.onValueChange?.(exists(props.items, context.defaultValue))],
    },
  },
});
