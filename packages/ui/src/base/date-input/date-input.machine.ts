import { createMachine } from "../_shared/core/index";
import type { Direction, MachineArgs } from "../_shared/core/index";
import {
  dateSegmentRange,
  dateUnits,
  dateValidity,
  emptyDateParts,
  normalizeDateDigits,
  parseDate,
  pasteDate,
  serializeDate,
} from "./date-value";
import type { DateParts, DateSegmentType, DateValueOptions } from "./date-value";

export interface DateInputMachineOptions extends DateValueOptions {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  dir?: Direction;
  name?: string;
  form?: string;
  segmentLabels?: Partial<Record<DateSegmentType, string>>;
}
export interface DateInputSchema {
  state: 'idle' | 'editing';
  props: DateInputMachineOptions;
  context: {
    value: string | null;
    initial: string | null;
    draft: DateParts | null;
    base: string | null;
    requested: string | null;
    notify: boolean;
    rejectedPaste: boolean;
  };
  event:
    | { type: 'EDIT'; segment: DateSegmentType; text: string }
    | { type: 'STEP'; segment: DateSegmentType; amount: number; edge?: 'min' | 'max' }
    | { type: 'PASTE'; text: string }
    | { type: 'SET'; value: string | null }
    | { type: 'COMMIT' }
    | { type: 'CANCEL' }
    | { type: 'RESET' };
}
export const dateInputValue = (props: DateInputMachineOptions, context: DateInputSchema['context']) =>
  props.value === undefined ? context.value : props.value;
export const dateInputParts = (props: DateInputMachineOptions, context: DateInputSchema['context']) =>
  context.draft && context.base === dateInputValue(props, context)
    ? context.draft
    : (parseDate(dateInputValue(props, context) ?? '', props.granularity) ?? emptyDateParts());
const editable = ({ props }: MachineArgs<DateInputSchema>) => !props.disabled && !props.readOnly;
function request(props: DateInputMachineOptions, context: DateInputSchema['context'], value: string | null) {
  return {
    value: props.value === undefined ? value : context.value,
    draft: null,
    requested: value,
    notify: value !== dateInputValue(props, context),
    rejectedPaste: false,
  };
}
function edit(props: DateInputMachineOptions, context: DateInputSchema['context'], parts: DateParts) {
  const validity = dateValidity(parts, props);
  if (validity === 'valid') return request(props, context, serializeDate(parts, props.granularity));
  if (validity === 'empty') return request(props, context, null);
  return { draft: parts, base: dateInputValue(props, context), notify: false, rejectedPaste: false };
}
const notify = ({ props, context }: MachineArgs<DateInputSchema>) => {
  if (context.notify) props.onValueChange?.(context.requested);
};
export const dateInputMachine = createMachine<DateInputSchema>({
  initial: 'idle',
  context: ({ props }) => ({
    value: props.defaultValue ?? null,
    initial: props.defaultValue ?? null,
    draft: null,
    base: null,
    requested: null,
    notify: false,
    rejectedPaste: false,
  }),
  states: { idle: {}, editing: {} },
  onProps: {
    guard: ({ props, context }) =>
      !!props.disabled ||
      !!props.readOnly ||
      (context.draft !== null && context.base !== dateInputValue(props, context)),
    target: 'idle',
    assign: () => ({ draft: null, rejectedPaste: false }),
  },
  on: {
    EDIT: {
      guard: (args) =>
        editable(args) &&
        dateUnits(args.props.granularity).includes(args.event.segment) &&
        /^\d*$/.test(normalizeDateDigits(args.event.text, args.props.locale)) &&
        args.event.text.length <= (args.event.segment === 'year' ? 4 : 2),
      target: 'editing',
      assign: ({ props, context, event }) => ({
        draft: { ...dateInputParts(props, context), [event.segment]: normalizeDateDigits(event.text, props.locale) },
        base: dateInputValue(props, context),
        notify: false,
        rejectedPaste: false,
      }),
    },
    STEP: {
      guard: editable,
      target: 'editing',
      assign: ({ props, context, event }) => {
        const parts = { ...dateInputParts(props, context) };
        const [min, max] = dateSegmentRange(event.segment, parts);
        parts[event.segment] = String(
          event.edge
            ? event.edge === 'min'
              ? min
              : max
            : Math.max(
                min,
                Math.min(
                  max,
                  parts[event.segment] ? Number(parts[event.segment]) + event.amount : event.amount > 0 ? min : max,
                ),
              ),
        );
        if ((event.segment === 'year' || event.segment === 'month') && parts.day)
          parts.day = String(Math.min(Number(parts.day), dateSegmentRange('day', parts)[1]));
        const value = serializeDate(parts, props.granularity);
        if (value && props.min && value < props.min) return request(props, context, props.min);
        if (value && props.max && value > props.max) return request(props, context, props.max);
        return edit(props, context, parts);
      },
      actions: [notify],
    },
    PASTE: {
      guard: editable,
      target: 'editing',
      assign: ({ props, context, event }) => {
        const parts = pasteDate(event.text, props);
        return parts ? edit(props, context, parts) : { rejectedPaste: true, notify: false };
      },
      actions: [notify],
    },
    SET: {
      guard: (args) =>
        editable(args) && (args.event.value === null || !!parseDate(args.event.value, args.props.granularity)),
      target: 'idle',
      assign: ({ props, context, event }) => request(props, context, event.value),
      actions: [notify],
    },
    COMMIT: {
      guard: editable,
      target: 'idle',
      assign: ({ props, context }) => edit(props, context, dateInputParts(props, context)),
      actions: [notify],
    },
    CANCEL: { target: 'idle', assign: () => ({ draft: null, rejectedPaste: false }) },
    RESET: {
      target: 'idle',
      assign: ({ props, context }) => request(props, context, context.initial),
      actions: [notify],
    },
  },
});
