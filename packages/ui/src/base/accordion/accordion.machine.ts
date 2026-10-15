import { createMachine, firstEnabledValue, isItemEnabled, validateCollection } from "../_shared/core/index";
import type { CollectionItem, Direction, MachineArgs } from "../_shared/core/index";

export interface AccordionOptions {
  items: readonly CollectionItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  multiple?: boolean;
  collapsible?: boolean;
  disabled?: boolean;
  loop?: boolean;
  dir?: Direction;
  id?: string;
}
export interface AccordionSchema {
  state: 'idle';
  context: { value: readonly string[] };
  props: AccordionOptions;
  event: { type: 'TOGGLE'; value: string } | { type: 'SET'; value: readonly string[] };
}
export function normalizeAccordionValue(props: AccordionOptions, value: readonly string[]): string[] {
  const existing = [...new Set(value)].filter((entry) => props.items.some((item) => item.value === entry));
  const selected = props.multiple ? existing : existing.slice(0, 1);
  if (props.collapsible === false && selected.length === 0) {
    const first = firstEnabledValue(props.items);
    return first === null ? [] : [first];
  }
  return selected;
}
export const accordionValue = (props: AccordionOptions, context: Readonly<AccordionSchema['context']>) =>
  normalizeAccordionValue(props, props.value ?? context.value);
const same = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((entry, index) => entry === b[index]);
function requested({ props, context, event }: MachineArgs<AccordionSchema, AccordionSchema['event']>) {
  const current = accordionValue(props, context);
  if (event.type === 'SET') return normalizeAccordionValue(props, event.value);
  if (current.includes(event.value))
    return props.collapsible === false && current.length === 1
      ? current
      : current.filter((entry) => entry !== event.value);
  return props.multiple ? [...current, event.value] : [event.value];
}
export const accordionMachine = createMachine<AccordionSchema>({
  initial: 'idle',
  context: ({ props }) => {
    validateCollection(props.items);
    return { value: props.value !== undefined ? [] : normalizeAccordionValue(props, props.defaultValue ?? []) };
  },
  states: { idle: {} },
  onProps: {
    guard: ({ props, context }) =>
      props.value === undefined && !same(context.value, normalizeAccordionValue(props, context.value)),
    assign: ({ props, context }) => ({ value: normalizeAccordionValue(props, context.value) }),
    actions: [({ props, context }) => props.onValueChange?.([...context.value])],
  },
  on: {
    TOGGLE: {
      guard: (args) =>
        !args.props.disabled &&
        isItemEnabled(args.props.items, args.event.value) &&
        !same(accordionValue(args.props, args.context), requested(args)),
      assign: (args) => ({ value: args.props.value !== undefined ? args.context.value : requested(args) }),
      actions: [
        ({ props, context, event }) => {
          // Uncontrolled assignment already applied; controlled changes remain a request.
          props.onValueChange?.(
            props.value !== undefined ? requested({ props, context, event, value: 'idle' }) : [...context.value],
          );
        },
      ],
    },
    SET: {
      guard: (args) => !args.props.disabled && !same(accordionValue(args.props, args.context), requested(args)),
      assign: (args) => ({ value: args.props.value !== undefined ? args.context.value : requested(args) }),
      actions: [
        ({ props, context, event }) =>
          props.onValueChange?.(
            props.value !== undefined ? normalizeAccordionValue(props, event.value) : [...context.value],
          ),
      ],
    },
  },
});
