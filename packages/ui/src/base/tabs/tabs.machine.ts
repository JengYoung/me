import {
  createMachine,
  firstEnabledValue,
  isItemEnabled,
  recoverValue,
  sameCollection,
  validateCollection,
} from "../_shared/core/index";
import type { CollectionItem, Direction, MachineArgs } from "../_shared/core/index";

export interface TabsOptions {
  items: readonly CollectionItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  activationMode?: 'automatic' | 'manual';
  orientation?: 'horizontal' | 'vertical';
  dir?: Direction;
  loop?: boolean;
  disabled?: boolean;
  id?: string;
}

export interface TabsSchema {
  state: 'idle' | 'focused';
  props: TabsOptions;
  context: { value: string | null; focusedValue: string | null; items: readonly CollectionItem[] };
  event:
    | { type: 'FOCUS'; value: string }
    | { type: 'SELECT'; value: string }
    | { type: 'NAVIGATE'; value: string }
    | { type: 'LEAVE' };
}

export const tabsValue = (props: TabsOptions, context: Readonly<TabsSchema['context']>) =>
  props.value !== undefined ? props.value : context.value;

function reconcile({ props, context, value }: MachineArgs<TabsSchema>) {
  const unchanged = sameCollection(context.items, props.items);
  const next =
    props.value !== undefined
      ? context.value
      : unchanged
        ? context.value
        : recoverValue(props.items, context.items, context.value);
  const selected = props.value !== undefined ? props.value : next;
  const focusedValue =
    value === 'focused' && isItemEnabled(props.items, context.focusedValue)
      ? context.focusedValue
      : isItemEnabled(props.items, selected)
        ? selected
        : recoverValue(props.items, context.items, context.focusedValue);
  return { value: next, focusedValue, items: unchanged ? context.items : props.items };
}

export const tabsMachine = createMachine<TabsSchema>({
  initial: 'idle',
  context: ({ props }) => {
    validateCollection(props.items);
    const selected =
      props.value !== undefined
        ? props.value
        : props.defaultValue === null
          ? null
          : isItemEnabled(props.items, props.defaultValue ?? null)
            ? props.defaultValue!
            : firstEnabledValue(props.items);
    return {
      value: props.value !== undefined ? null : selected,
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
      guard: ({ props, event }) => !props.disabled && isItemEnabled(props.items, event.value),
      target: 'focused',
      assign: ({ event }) => ({ focusedValue: event.value }),
    },
    SELECT: {
      guard: ({ props, context, event }) =>
        !props.disabled && isItemEnabled(props.items, event.value) && event.value !== tabsValue(props, context),
      assign: ({ props, context, event }) => ({ value: props.value !== undefined ? context.value : event.value }),
      actions: [({ props, event }) => props.onValueChange?.(event.value)],
    },
    NAVIGATE: {
      guard: ({ props, context, event }) =>
        props.activationMode !== 'manual' &&
        !props.disabled &&
        isItemEnabled(props.items, event.value) &&
        event.value !== tabsValue(props, context),
      assign: ({ props, context, event }) => ({ value: props.value !== undefined ? context.value : event.value }),
      actions: [({ props, event }) => props.onValueChange?.(event.value)],
    },
    LEAVE: {
      target: 'idle',
      assign: ({ props, context }) => ({
        focusedValue: isItemEnabled(props.items, tabsValue(props, context))
          ? tabsValue(props, context)
          : firstEnabledValue(props.items),
      }),
    },
  },
});
