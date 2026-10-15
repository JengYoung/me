import { createMachine, isItemEnabled } from "../_shared/core/index";
import type { Direction, TextCollectionItem } from "../_shared/core/index";

export interface ComboboxOptions {
  items: readonly TextCollectionItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: 'editable' | 'select-only';
  autocomplete?: 'list' | 'none';
  disabled?: boolean;
  required?: boolean;
  dir?: Direction;
  id?: string;
}
export interface ComboboxSchema {
  state: 'closed' | 'open';
  props: ComboboxOptions;
  context: { value: string | null; inputValue: string; filtering: boolean };
  event:
    | { type: 'OPEN'; open: boolean }
    | { type: 'INPUT'; value: string }
    | { type: 'SET_INPUT'; value: string }
    | { type: 'SET_VALUE'; value: string | null }
    | { type: 'SELECT'; value: string };
}
export const comboboxValue = (props: ComboboxOptions, context: Readonly<ComboboxSchema['context']>) =>
  props.value !== undefined ? props.value : context.value;
export const comboboxInput = (props: ComboboxOptions, context: Readonly<ComboboxSchema['context']>) =>
  props.inputValue ?? context.inputValue;
export const comboboxMachine = createMachine<ComboboxSchema>({
  initial: ({ props }) => ((props.open ?? props.defaultOpen ?? false) ? 'open' : 'closed'),
  context: ({ props }) => ({
    value: props.value === undefined ? (props.defaultValue ?? null) : null,
    inputValue:
      props.inputValue === undefined
        ? (props.defaultInputValue ??
          props.items.find((item) => item.value === (props.value ?? props.defaultValue))?.label ??
          '')
        : '',
    filtering: false,
  }),
  states: { closed: {}, open: {} },
  onProps: [
    { guard: ({ props }) => props.open === true, target: 'open' },
    { guard: ({ props }) => props.open === false, target: 'closed' },
  ],
  on: {
    OPEN: [
      {
        guard: ({ props, value, event }) =>
          !props.disabled && props.open !== undefined && event.open !== (props.open ?? value === 'open'),
        actions: [({ props, event }) => props.onOpenChange?.(event.open)],
      },
      {
        guard: ({ props, value, event }) =>
          !props.disabled && props.open === undefined && event.open && value !== 'open',
        target: 'open',
        actions: [({ props }) => props.onOpenChange?.(true)],
      },
      {
        guard: ({ props, value, event }) => props.open === undefined && !event.open && value !== 'closed',
        target: 'closed',
        actions: [({ props }) => props.onOpenChange?.(false)],
      },
    ],
    INPUT: {
      guard: ({ props }) => !props.disabled && props.mode !== 'select-only',
      assign: () => ({ filtering: true }),
      actions: [
        ({ event, send }) => {
          send({ type: 'SET_INPUT', value: event.value });
          send({ type: 'SET_VALUE', value: null });
          send({ type: 'OPEN', open: true });
        },
      ],
    },
    SET_INPUT: {
      guard: ({ props, context, event }) => !props.disabled && comboboxInput(props, context) !== event.value,
      assign: ({ props, context, event }) => ({
        inputValue: props.inputValue === undefined ? event.value : context.inputValue,
      }),
      actions: [({ props, event }) => props.onInputValueChange?.(event.value)],
    },
    SET_VALUE: {
      guard: ({ props, context, event }) =>
        !props.disabled &&
        (event.value === null || isItemEnabled(props.items, event.value)) &&
        comboboxValue(props, context) !== event.value,
      assign: ({ props, context, event }) => ({ value: props.value === undefined ? event.value : context.value }),
      actions: [({ props, event }) => props.onValueChange?.(event.value)],
    },
    SELECT: {
      guard: ({ props, event }) => !props.disabled && isItemEnabled(props.items, event.value),
      assign: () => ({ filtering: false }),
      actions: [
        ({ props, event, send }) => {
          send({ type: 'SET_VALUE', value: event.value });
          send({ type: 'SET_INPUT', value: props.items.find((item) => item.value === event.value)!.label });
          send({ type: 'OPEN', open: false });
        },
      ],
    },
  },
});
