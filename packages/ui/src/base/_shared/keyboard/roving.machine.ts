import {
  createMachine,
  firstEnabledValue,
  isItemEnabled,
  recoverValue,
  sameCollection,
  validateCollection,
} from '../core/index';
import type { CollectionItem, Direction, Orientation } from '../core/index';

export interface RovingFocusOptions {
  items: readonly CollectionItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  onNavigate?: (value: string) => void;
  onLeave?: () => void;
  orientation?: Orientation;
  dir?: Direction;
  loop?: boolean;
  homeEnd?: boolean;
  disabled?: boolean;
  /** Disable composite arrow handling for structures such as Feed. */
  keyboard?: boolean;
  /** Track an item's focused descendants as its reading position. */
  focusWithin?: boolean;
}

interface RovingSchema {
  state: 'idle' | 'focused';
  props: RovingFocusOptions;
  context: { value: string | null; items: readonly CollectionItem[] };
  event: { type: 'FOCUS'; value: string } | { type: 'LEAVE' };
}

export const rovingMachine = createMachine<RovingSchema>({
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
    assign: ({ context, props }) => ({
      value: props.value !== undefined ? null : recoverValue(props.items, context.items, context.value),
      items: sameCollection(context.items, props.items) ? context.items : props.items,
    }),
  },
  on: {
    FOCUS: {
      guard: ({ props, event }) => !props.disabled && isItemEnabled(props.items, event.value),
      target: 'focused',
      assign: ({ context, props, event }) => ({ value: props.value !== undefined ? context.value : event.value }),
      actions: [({ props, event }) => props.onValueChange?.(event.value)],
    },
    LEAVE: { target: 'idle', actions: [({ props }) => props.onLeave?.()] },
  },
});

export function rovingValue(props: RovingFocusOptions, value: string | null): string | null {
  if (props.disabled) return null;
  const current = props.value !== undefined ? props.value : value;
  return isItemEnabled(props.items, current) ? current : firstEnabledValue(props.items);
}
