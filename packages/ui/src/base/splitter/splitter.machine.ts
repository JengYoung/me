import { createMachine, numberRange, snapNumber } from "../_shared/core/index";
import type { MachineArgs, NumberRangeOptions } from "../_shared/core/index";

export interface SplitterOptions extends Omit<NumberRangeOptions, 'pageStep'> {
  size?: number;
  defaultSize?: number;
  onSizeChange?: (size: number) => void;
  getValueText?: (size: number) => string;
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
  collapsible?: boolean;
  collapsedSize?: number;
  fixed?: boolean;
  disabled?: boolean;
  id?: string;
}
export interface SplitterSchema {
  state: 'idle' | 'dragging';
  props: SplitterOptions;
  context: { size: number; restoreSize: number; requested: number; notify: boolean };
  event: { type: 'SET'; size: number } | { type: 'TOGGLE' } | { type: 'START' } | { type: 'END' };
}
export function splitterRange(props: SplitterOptions) {
  const range = numberRange(props);
  const collapsedSize = props.collapsedSize ?? 0;
  if (
    range.min < 0 ||
    range.max > 100 ||
    !Number.isFinite(collapsedSize) ||
    collapsedSize < 0 ||
    collapsedSize > range.min ||
    (props.fixed && props.collapsible === false)
  )
    throw new Error(
      'Splitter uses percentages: 0 <= collapsedSize <= min <= max <= 100; fixed splitters must be collapsible.',
    );
  return { ...range, collapsedSize };
}
export function normalizeSplitter(size: number, props: SplitterOptions) {
  const { collapsedSize } = splitterRange(props);
  return props.collapsible !== false && size <= collapsedSize ? collapsedSize : snapNumber(size, props);
}
export const splitterSize = (props: SplitterOptions, context: SplitterSchema['context']) =>
  normalizeSplitter(props.size ?? context.size, props);
export const splitterCollapsed = (props: SplitterOptions, size: number) =>
  props.collapsible !== false && size === (props.collapsedSize ?? 0);
function request(props: SplitterOptions, context: SplitterSchema['context'], size: number) {
  const current = splitterSize(props, context);
  const next = normalizeSplitter(size, props);
  return {
    size: props.size === undefined ? next : context.size,
    requested: next,
    notify: next !== current,
    restoreSize: splitterCollapsed(props, next) && !splitterCollapsed(props, current) ? current : context.restoreSize,
  };
}
const notify = ({ props, context }: MachineArgs<SplitterSchema>) => {
  if (context.notify) props.onSizeChange?.(context.requested);
};
function rememberExternalSize({
  props,
  context,
  event,
}: MachineArgs<SplitterSchema, import("../_shared/core/index").PropsEvent<SplitterSchema>>) {
  return {
    restoreSize:
      props.size !== undefined &&
      event.previous.size !== undefined &&
      splitterCollapsed(props, props.size) &&
      !splitterCollapsed(event.previous, event.previous.size)
        ? event.previous.size
        : context.restoreSize,
  };
}
export const splitterMachine = createMachine<SplitterSchema>({
  initial: 'idle',
  context: ({ props }) => {
    const { min, max, collapsedSize } = splitterRange(props);
    const size = normalizeSplitter(props.defaultSize ?? 50, props);
    const restoreSize = splitterCollapsed(props, size)
      ? snapNumber(Math.max(min, (min + max) / 2, collapsedSize + (props.step ?? 1)), props)
      : size;
    return { size, restoreSize, requested: size, notify: false };
  },
  states: { idle: {}, dragging: {} },
  onProps: [
    { guard: ({ props }) => !!props.disabled || !!props.fixed, target: 'idle', assign: rememberExternalSize },
    { assign: rememberExternalSize },
  ],
  on: {
    START: { guard: ({ props }) => !props.disabled && !props.fixed, target: 'dragging' },
    END: { target: 'idle' },
    SET: {
      guard: ({ props, event }) => !props.disabled && !props.fixed && Number.isFinite(event.size),
      assign: ({ props, context, event }) => request(props, context, event.size),
      actions: [notify],
    },
    TOGGLE: {
      guard: ({ props }) => !props.disabled && props.collapsible !== false,
      target: 'idle',
      assign: ({ props, context }) =>
        request(
          props,
          context,
          splitterCollapsed(props, splitterSize(props, context))
            ? Math.max(context.restoreSize, props.min ?? 0, (props.collapsedSize ?? 0) + (props.step ?? 1))
            : (props.collapsedSize ?? 0),
        ),
      actions: [notify],
    },
  },
});
