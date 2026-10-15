import { clampNumber, createMachine, numberRange } from "../_shared/core/index";
import type { MachineArgs, NumberRangeOptions } from "../_shared/core/index";

export interface SpinbuttonOptions extends NumberRangeOptions {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  getValueText?: (value: number) => string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  name?: string;
  form?: string;
  id?: string;
}
export interface SpinbuttonSchema {
  state: 'idle' | 'editing' | 'invalid' | 'composing';
  props: SpinbuttonOptions;
  context: {
    value: number | null;
    defaultValue: number | null;
    draft: string | null;
    draftBase: number | null;
    requested: number | null;
    notify: boolean;
  };
  event:
    | { type: 'EDIT'; text: string }
    | { type: 'COMPOSITION_START' }
    | { type: 'COMPOSITION_END'; text: string }
    | { type: 'COMMIT' }
    | { type: 'CANCEL' }
    | { type: 'SET'; value: number | null }
    | { type: 'STEP'; direction: 1 | -1; large?: boolean }
    | { type: 'RESET' };
}
export function spinbuttonRange(props: SpinbuttonOptions) {
  return numberRange({
    ...props,
    min: props.min ?? -Number.MAX_SAFE_INTEGER,
    max: props.max ?? Number.MAX_SAFE_INTEGER,
  });
}
export function parseSpinbutton(text: string): number | null | undefined {
  if (!text.trim()) return null;
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text.trim())) return undefined;
  const value = Number(text);
  return Number.isFinite(value) ? value : undefined;
}
export function normalizeSpinbutton(value: number | null, props: SpinbuttonOptions): number | null {
  if (value === null) return null;
  const { min, max, step } = spinbuttonRange(props);
  const bounded = clampNumber(Number.isFinite(value) ? value : 0, min, max);
  if (bounded === min || bounded === max) return bounded;
  const origin = props.min ?? 0;
  return clampNumber(Number((origin + Math.round((bounded - origin) / step) * step).toPrecision(15)), min, max);
}
export const spinbuttonValue = (props: SpinbuttonOptions, context: SpinbuttonSchema['context']) =>
  normalizeSpinbutton(props.value === undefined ? context.value : props.value, props);
export function spinbuttonText(props: SpinbuttonOptions, context: SpinbuttonSchema['context']) {
  const value = spinbuttonValue(props, context);
  return context.draft !== null && context.draftBase === value ? context.draft : value === null ? '' : String(value);
}
export function invalidSpinbutton(text: string, props: SpinbuttonOptions) {
  const value = parseSpinbutton(text);
  return value === undefined || (value === null ? !!props.required : value !== normalizeSpinbutton(value, props));
}
const editable = ({ props }: MachineArgs<SpinbuttonSchema>) => !props.disabled && !props.readOnly;
function request(props: SpinbuttonOptions, context: SpinbuttonSchema['context'], value: number | null) {
  const next = normalizeSpinbutton(value, props);
  return {
    value: props.value === undefined ? next : context.value,
    draft: null,
    requested: next,
    notify: next !== spinbuttonValue(props, context),
  };
}
const notify = ({ props, context }: MachineArgs<SpinbuttonSchema>) => {
  if (context.notify) props.onValueChange?.(context.requested);
};

export const spinbuttonMachine = createMachine<SpinbuttonSchema>({
  initial: 'idle',
  context: ({ props }) => {
    const value = normalizeSpinbutton(props.defaultValue ?? null, props);
    return { value, defaultValue: value, draft: null, draftBase: null, requested: null, notify: false };
  },
  states: { idle: {}, editing: {}, invalid: {}, composing: {} },
  onProps: {
    guard: ({ props, context }) =>
      !!props.disabled ||
      !!props.readOnly ||
      (context.draft !== null && context.draftBase !== spinbuttonValue(props, context)),
    target: 'idle',
    assign: () => ({ draft: null }),
  },
  on: {
    EDIT: [
      {
        guard: (args) => editable(args) && args.value === 'composing',
        assign: ({ props, context, event }) => ({ draft: event.text, draftBase: spinbuttonValue(props, context) }),
      },
      {
        guard: (args) => editable(args) && invalidSpinbutton(args.event.text, args.props),
        target: 'invalid',
        assign: ({ props, context, event }) => ({ draft: event.text, draftBase: spinbuttonValue(props, context) }),
      },
      {
        guard: editable,
        target: 'editing',
        assign: ({ props, context, event }) => ({ draft: event.text, draftBase: spinbuttonValue(props, context) }),
      },
    ],
    COMPOSITION_START: { guard: editable, target: 'composing' },
    COMPOSITION_END: [
      {
        guard: (args) => editable(args) && invalidSpinbutton(args.event.text, args.props),
        target: 'invalid',
        assign: ({ props, context, event }) => ({ draft: event.text, draftBase: spinbuttonValue(props, context) }),
      },
      {
        guard: editable,
        target: 'editing',
        assign: ({ props, context, event }) => ({ draft: event.text, draftBase: spinbuttonValue(props, context) }),
      },
    ],
    COMMIT: [
      {
        guard: (args) =>
          editable(args) &&
          args.value !== 'composing' &&
          parseSpinbutton(spinbuttonText(args.props, args.context)) === undefined,
        target: 'invalid',
      },
      {
        guard: (args) => editable(args) && args.value !== 'composing',
        target: 'idle',
        assign: ({ props, context }) =>
          request(props, context, parseSpinbutton(spinbuttonText(props, context)) ?? null),
        actions: [notify],
      },
    ],
    CANCEL: { target: 'idle', assign: () => ({ draft: null }) },
    SET: {
      guard: (args) => editable(args) && (args.event.value === null || Number.isFinite(args.event.value)),
      target: 'idle',
      assign: ({ props, context, event }) => request(props, context, event.value),
      actions: [notify],
    },
    STEP: {
      guard: (args) => editable(args) && args.value !== 'composing',
      target: 'idle',
      assign: ({ props, context, event }) => {
        const range = spinbuttonRange(props);
        const value =
          parseSpinbutton(spinbuttonText(props, context)) ??
          spinbuttonValue(props, context) ??
          clampNumber(0, range.min, range.max);
        return request(props, context, value + event.direction * (event.large ? range.pageStep : range.step));
      },
      actions: [notify],
    },
    RESET: {
      target: 'idle',
      assign: ({ props, context }) => request(props, context, context.defaultValue),
      actions: [notify],
    },
  },
});
