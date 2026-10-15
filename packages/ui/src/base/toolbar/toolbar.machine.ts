import { createMachine, isItemEnabled, recoverValue, sameCollection, validateCollection } from "../_shared/core/index";
import type { CollectionItem, Direction } from "../_shared/core/index";

export interface ToolbarOptions {
  items: readonly CollectionItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  orientation?: 'horizontal' | 'vertical';
  dir?: Direction;
  loop?: boolean;
  disabled?: boolean;
  id?: string;
}
export interface ToolbarSchema {
  state: 'idle' | 'focused';
  context: { value: string | null; items: readonly CollectionItem[] };
  props: ToolbarOptions;
  event: { type: 'FOCUS'; value: string } | { type: 'LEAVE' };
}
export const toolbarValue = (props: ToolbarOptions, context: Readonly<ToolbarSchema['context']>) =>
  props.disabled
    ? null
    : recoverValue(props.items, context.items, props.value !== undefined ? props.value : context.value);
export const toolbarMachine = createMachine<ToolbarSchema>({
  initial: 'idle',
  context: ({ props }) => {
    validateCollection(props.items);
    return {
      value: props.value !== undefined ? null : recoverValue(props.items, [], props.defaultValue ?? null),
      items: props.items,
    };
  },
  states: { idle: {}, focused: {} },
  onProps: {
    assign: ({ props, context }) => ({
      value: props.value !== undefined ? context.value : recoverValue(props.items, context.items, context.value),
      items: sameCollection(context.items, props.items) ? context.items : props.items,
    }),
  },
  on: {
    FOCUS: {
      target: 'focused',
      guard: ({ props, event }) => !props.disabled && isItemEnabled(props.items, event.value),
      assign: ({ props, context, event }) => ({ value: props.value !== undefined ? context.value : event.value }),
      actions: [({ props, event }) => props.onValueChange?.(event.value)],
    },
    LEAVE: { target: 'idle' },
  },
});
