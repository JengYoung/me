import { createMachine } from '../_shared/core/index';
import type { MachineArgs } from '../_shared/core/index';

export interface TagsInputRejection {
  value: string;
  reason: 'empty' | 'duplicate' | 'max' | 'invalid';
}
export interface TagsInputBehaviorOptions {
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  maxTags?: number;
  validate?: (value: string) => boolean;
  onInvalid?: (detail: TagsInputRejection) => void;
  getErrorMessage?: (detail: TagsInputRejection) => string;
  disabled?: boolean;
  readOnly?: boolean;
}
export interface TagsInputSchema {
  state: 'ready';
  props: TagsInputBehaviorOptions;
  context: {
    value: readonly string[] | null;
    input: string | null;
    defaultValue: readonly string[];
    defaultInput: string;
    active: string | null;
    editing: string | null;
    composing: boolean;
    error: TagsInputRejection | null;
    message: string;
    requested: string[];
    inputRequested: string;
    notifyValue: boolean;
    notifyInput: boolean;
    rejected: TagsInputRejection[];
  };
  event:
    | { type: 'INPUT'; value: string }
    | { type: 'ADD'; values: readonly string[] }
    | { type: 'REMOVE'; value: string }
    | { type: 'EDIT'; value: string }
    | { type: 'ACTIVE'; value: string | null }
    | { type: 'COMPOSITION'; active: boolean }
    | { type: 'COMMIT' }
    | { type: 'CANCEL' }
    | { type: 'RESET' };
}
export const tagsValue = (props: TagsInputBehaviorOptions, context: TagsInputSchema['context']) =>
  props.value ?? context.value ?? [];
export const tagsInput = (props: TagsInputBehaviorOptions, context: TagsInputSchema['context']) =>
  props.inputValue ?? context.input ?? '';
export function splitTags(value: string, delimiters: readonly string[]) {
  const separators = delimiters.filter(Boolean).map((delimiter) => delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return separators.length ? value.split(new RegExp(separators.join('|'), 'u')) : [value];
}
const editable = ({ props }: MachineArgs<TagsInputSchema>) => !props.disabled && !props.readOnly;
const same = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);
function request(
  props: TagsInputBehaviorOptions,
  context: TagsInputSchema['context'],
  values: readonly string[],
  input: string,
) {
  return {
    requested: [...values],
    inputRequested: input,
    value: props.value === undefined ? [...values] : null,
    input: props.inputValue === undefined ? input : null,
    notifyValue: !same(values, tagsValue(props, context)),
    notifyInput: input !== tagsInput(props, context),
  };
}
function rejection(
  value: string,
  values: readonly string[],
  props: TagsInputBehaviorOptions,
): TagsInputRejection | null {
  const reason = !value
    ? 'empty'
    : values.includes(value)
      ? 'duplicate'
      : values.length >= (props.maxTags ?? Infinity)
        ? 'max'
        : props.validate?.(value) === false
          ? 'invalid'
          : null;
  return reason ? { value, reason } : null;
}
function add(
  props: TagsInputBehaviorOptions,
  context: TagsInputSchema['context'],
  candidates: readonly string[],
  edit: boolean,
) {
  const original = tagsValue(props, context);
  const editing = edit ? context.editing : null;
  let values = [...original];
  const rejected: TagsInputRejection[] = [];
  let accepted = false;
  for (const candidate of candidates) {
    const value = candidate.trim();
    const rest = editing === null ? values : values.filter((tag) => tag !== editing);
    const invalid = rejection(value, rest, props);
    if (invalid) {
      rejected.push(invalid);
      continue;
    }
    values = editing === null ? [...values, value] : values.map((tag) => (tag === editing ? value : tag));
    accepted = true;
  }
  const error = rejected.at(-1) ?? null;
  return {
    ...request(props, context, values, accepted ? '' : tagsInput(props, context)),
    rejected,
    error,
    editing: accepted ? null : context.editing,
    active: null,
    message: error
      ? (props.getErrorMessage?.(error) ?? `${error.value || 'Tag'}: ${error.reason}`)
      : accepted
        ? `${values.at(-1) ?? ''}: ${editing === null ? 'added' : 'updated'}`
        : '',
  };
}
const notify = ({ props, context }: MachineArgs<TagsInputSchema>) => {
  if (context.notifyValue) props.onValueChange?.([...context.requested]);
  if (context.notifyInput) props.onInputValueChange?.(context.inputRequested);
  context.rejected.forEach((detail) => props.onInvalid?.(detail));
};
export const tagsInputMachine = createMachine<TagsInputSchema>({
  initial: 'ready',
  context: ({ props }) => ({
    value: props.value === undefined ? [...(props.defaultValue ?? [])] : null,
    input: props.inputValue === undefined ? (props.defaultInputValue ?? '') : null,
    defaultValue: [...(props.defaultValue ?? [])],
    defaultInput: props.defaultInputValue ?? '',
    active: null,
    editing: null,
    composing: false,
    error: null,
    message: '',
    requested: [],
    inputRequested: '',
    notifyValue: false,
    notifyInput: false,
    rejected: [],
  }),
  states: { ready: {} },
  onProps: {
    guard: ({ props, context }) =>
      (context.active !== null && !tagsValue(props, context).includes(context.active)) ||
      (context.editing !== null && !tagsValue(props, context).includes(context.editing)),
    assign: ({ props, context }) => ({
      active: context.active !== null && tagsValue(props, context).includes(context.active) ? context.active : null,
      editing: null,
      composing: false,
    }),
  },
  on: {
    INPUT: {
      guard: editable,
      assign: ({ props, context, event }) => ({
        ...request(props, context, tagsValue(props, context), event.value),
        error: null,
        rejected: [],
        message: '',
        active: null,
      }),
      actions: [notify],
    },
    ACTIVE: {
      guard: ({ props, context, event }) =>
        !props.disabled && (event.value === null || tagsValue(props, context).includes(event.value)),
      assign: ({ event }) => ({ active: event.value }),
    },
    COMPOSITION: { assign: ({ event }) => ({ composing: event.active }) },
    ADD: {
      guard: (args) => editable(args) && !args.context.composing && args.context.editing === null,
      assign: ({ props, context, event }) => add(props, context, event.values, false),
      actions: [notify],
    },
    COMMIT: {
      guard: (args) => editable(args) && !args.context.composing,
      assign: ({ props, context }) => add(props, context, [tagsInput(props, context)], true),
      actions: [notify],
    },
    REMOVE: {
      guard: (args) => editable(args) && tagsValue(args.props, args.context).includes(args.event.value),
      assign: ({ props, context, event }) => ({
        ...request(
          props,
          context,
          tagsValue(props, context).filter((value) => value !== event.value),
          tagsInput(props, context),
        ),
        active: context.active === event.value ? null : context.active,
        editing: context.editing === event.value ? null : context.editing,
        error: null,
        rejected: [],
        message: `${event.value}: removed`,
      }),
      actions: [notify],
    },
    EDIT: {
      guard: (args) =>
        editable(args) && !args.context.composing && tagsValue(args.props, args.context).includes(args.event.value),
      assign: ({ props, context, event }) => ({
        ...request(props, context, tagsValue(props, context), event.value),
        editing: event.value,
        active: null,
        error: null,
        rejected: [],
        message: '',
      }),
      actions: [notify],
    },
    CANCEL: {
      guard: editable,
      assign: ({ props, context }) => ({
        ...request(props, context, tagsValue(props, context), ''),
        editing: null,
        active: null,
        composing: false,
        error: null,
        rejected: [],
        message: '',
      }),
      actions: [notify],
    },
    RESET: {
      assign: ({ props, context }) => ({
        ...request(props, context, context.defaultValue, context.defaultInput),
        editing: null,
        active: null,
        composing: false,
        error: null,
        rejected: [],
        message: '',
      }),
      actions: [notify],
    },
  },
});
