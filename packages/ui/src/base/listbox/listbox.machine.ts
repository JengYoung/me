import {
  createMachine,
  getNavigationTarget,
  getTypeaheadTarget,
  isItemEnabled,
  recoverValue,
  sameCollection,
  validateCollection,
} from '../_shared/core/index';
import type { Direction, MachineArgs, NavigationIntent, TextCollectionItem } from '../_shared/core/index';

export type ListboxItem = TextCollectionItem;
export interface ListboxOptions {
  items: readonly ListboxItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  activeValue?: string | null;
  defaultActiveValue?: string | null;
  onActiveValueChange?: (value: string | null) => void;
  multiple?: boolean;
  selectionFollowsFocus?: boolean;
  orientation?: 'vertical' | 'horizontal';
  dir?: Direction;
  loop?: boolean;
  disabled?: boolean;
  /** Popup owners retain DOM focus and initialize the active option themselves. */
  virtualFocus?: boolean;
  id?: string;
}
export interface ListboxSchema {
  state: 'idle' | 'searching';
  props: ListboxOptions;
  context: { value: readonly string[]; activeValue: string | null; items: readonly ListboxItem[]; query: string };
  event:
    | { type: 'ACTIVE'; value: string | null }
    | { type: 'MOVE'; intent: NavigationIntent }
    | { type: 'TYPE'; character: string }
    | { type: 'CLEAR_SEARCH' }
    | { type: 'SELECT'; value: string }
    | { type: 'SET'; value: readonly string[] };
}
const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((v, i) => v === b[i]);
function normalize(props: ListboxOptions, values: readonly string[]) {
  const existing = [...new Set(values)].filter((v) => props.items.some((item) => item.value === v));
  return props.multiple ? existing : existing.slice(0, 1);
}
export const listboxValue = (props: ListboxOptions, context: Readonly<ListboxSchema['context']>) =>
  normalize(props, props.value ?? context.value);
export function listboxActive(props: ListboxOptions, context: Readonly<ListboxSchema['context']>) {
  const value = props.activeValue !== undefined ? props.activeValue : context.activeValue;
  return props.disabled || value === null ? null : recoverValue(props.items, context.items, value);
}
type Args = MachineArgs<ListboxSchema, ListboxSchema['event']>;
function requestedActive({ props, context, event }: Args) {
  const current = listboxActive(props, context);
  if (event.type === 'ACTIVE') return event.value;
  if (event.type === 'MOVE')
    return getNavigationTarget(props.items, current, event.intent, props.loop ?? false) ?? current;
  if (event.type === 'TYPE')
    return getTypeaheadTarget(props.items, current, context.query + event.character) ?? current;
  return current;
}
function requestedSelection({ props, context, event }: Args) {
  if (event.type === 'SET') return normalize(props, event.value);
  const current = listboxValue(props, context);
  if (event.type !== 'SELECT') return current;
  return props.multiple
    ? current.includes(event.value)
      ? current.filter((v) => v !== event.value)
      : [...current, event.value]
    : [event.value];
}
export const listboxMachine = createMachine<ListboxSchema>({
  initial: 'idle',
  context: ({ props }) => {
    validateCollection(props.items);
    const selected = normalize(props, props.value ?? props.defaultValue ?? []);
    return {
      value: props.value === undefined ? selected : [],
      activeValue:
        props.activeValue !== undefined
          ? null
          : props.defaultActiveValue !== undefined
            ? props.defaultActiveValue
            : props.virtualFocus
              ? null
              : recoverValue(props.items, [], selected[0] ?? null),
      items: props.items,
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
    assign: ({ props, context }) => ({
      value:
        props.value === undefined && !same(context.value, normalize(props, context.value))
          ? normalize(props, context.value)
          : context.value,
      activeValue:
        props.activeValue !== undefined || context.activeValue === null
          ? context.activeValue
          : recoverValue(props.items, context.items, context.activeValue),
      items: sameCollection(context.items, props.items) ? context.items : props.items,
    }),
  },
  on: {
    ACTIVE: {
      guard: ({ props, context, event }) =>
        !props.disabled &&
        event.value !== listboxActive(props, context) &&
        (event.value === null || isItemEnabled(props.items, event.value)),
      assign: ({ props, context, event }) => ({
        activeValue: props.activeValue === undefined ? event.value : context.activeValue,
      }),
      actions: [
        ({ props, event, send }) => {
          props.onActiveValueChange?.(event.value);
          if (event.value !== null && props.selectionFollowsFocus && !props.multiple)
            send({ type: 'SET', value: [event.value] });
        },
      ],
    },
    MOVE: {
      guard: ({ props }) => !props.disabled,
      actions: [(args) => args.send({ type: 'ACTIVE', value: requestedActive(args) })],
    },
    TYPE: {
      target: 'searching',
      reenter: true,
      guard: ({ props }) => !props.disabled,
      assign: ({ context, event }) => ({ query: context.query + event.character }),
      actions: [
        ({ props, context, send }) => {
          const next = getTypeaheadTarget(props.items, listboxActive(props, context), context.query);
          if (next !== null) send({ type: 'ACTIVE', value: next });
        },
      ],
    },
    CLEAR_SEARCH: { target: 'idle', assign: () => ({ query: '' }) },
    SELECT: {
      guard: (args) =>
        !args.props.disabled &&
        isItemEnabled(args.props.items, args.event.value) &&
        !same(listboxValue(args.props, args.context), requestedSelection(args)),
      assign: (args) => ({ value: args.props.value === undefined ? requestedSelection(args) : args.context.value }),
      actions: [
        (args) =>
          args.props.onValueChange?.(
            args.props.value === undefined ? [...args.context.value] : requestedSelection(args),
          ),
      ],
    },
    SET: {
      guard: (args) =>
        !args.props.disabled &&
        args.event.value.every((v) => isItemEnabled(args.props.items, v)) &&
        !same(listboxValue(args.props, args.context), requestedSelection(args)),
      assign: (args) => ({ value: args.props.value === undefined ? requestedSelection(args) : args.context.value }),
      actions: [
        (args) =>
          args.props.onValueChange?.(
            args.props.value === undefined ? [...args.context.value] : requestedSelection(args),
          ),
      ],
    },
  },
});
