import { clampNumber, createMachine, numberRange, snapNumber } from "../_shared/core/index";
import type { NumberRangeOptions } from "../_shared/core/index";

export interface RangeSliderOptions extends NumberRangeOptions {
  value?: readonly number[];
  defaultValue?: readonly number[];
  onValueChange?: (value: number[]) => void;
  getValueText?: (value: number, index: number) => string;
  allowCross?: boolean;
  minStepsBetweenThumbs?: number;
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
  disabled?: boolean;
  name?: string;
  form?: string;
  id?: string;
}
export interface RangeSliderSchema {
  state: 'idle' | 'dragging';
  props: RangeSliderOptions;
  context: { value: readonly number[]; defaultValue: readonly number[]; activeIndex: number };
  event:
    | { type: 'SET'; index: number; value: number }
    | { type: 'START'; index: number }
    | { type: 'END' }
    | { type: 'RESET' };
}
const precise = (value: number) => Number(value.toPrecision(15));
export function normalizeRangeValues(values: readonly number[], props: RangeSliderOptions): number[] {
  const { min, max, step } = numberRange(props);
  const steps = props.minStepsBetweenThumbs ?? 0;
  if (
    values.length < 2 ||
    !values.every(Number.isFinite) ||
    !Number.isInteger(steps) ||
    steps < 0 ||
    (props.allowCross && steps > 0) ||
    precise(steps * step * (values.length - 1)) > precise(max - min)
  )
    throw new Error(
      'RangeSlider needs at least two finite values and a feasible nonnegative gap (zero when crossing).',
    );
  const result: number[] = [];
  values.forEach((value, index) => {
    const lower = index === 0 ? min : precise(result[index - 1]! + steps * step);
    const upper = precise(max - (values.length - index - 1) * steps * step);
    result.push(props.allowCross ? snapNumber(value, props) : clampNumber(snapNumber(value, props), lower, upper));
  });
  return result;
}
export const rangeSliderValues = (props: RangeSliderOptions, context: RangeSliderSchema['context']) =>
  normalizeRangeValues(props.value ?? context.value, props);
export function thumbBounds(values: readonly number[], index: number, props: RangeSliderOptions) {
  if (!Number.isInteger(index) || index < 0 || index >= values.length)
    throw new Error('Unknown RangeSlider thumb index.');
  const { min, max, step } = numberRange(props);
  const gap = step * (props.minStepsBetweenThumbs ?? 0);
  return {
    min: props.allowCross || index === 0 ? min : precise(values[index - 1]! + gap),
    max: props.allowCross || index === values.length - 1 ? max : precise(values[index + 1]! - gap),
  };
}
function requested(props: RangeSliderOptions, context: RangeSliderSchema['context'], index: number, value: number) {
  const values = rangeSliderValues(props, context);
  const bounds = thumbBounds(values, index, props);
  values[index] = clampNumber(snapNumber(value, props), bounds.min, bounds.max);
  return values;
}
const same = (a: readonly number[], b: readonly number[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);
export const rangeSliderMachine = createMachine<RangeSliderSchema>({
  initial: 'idle',
  context: ({ props }) => {
    if (props.value && props.defaultValue && props.value.length !== props.defaultValue.length)
      throw new Error('RangeSlider value and defaultValue must have the same thumb count.');
    const { min, max } = numberRange(props);
    const defaults = normalizeRangeValues(
      props.defaultValue ?? (props.value ? props.value.map((_, index) => (index === 0 ? min : max)) : [min, max]),
      props,
    );
    return { value: [...defaults], defaultValue: defaults, activeIndex: 0 };
  },
  states: { idle: {}, dragging: {} },
  onProps: { guard: ({ props }) => !!props.disabled, target: 'idle' },
  on: {
    START: {
      guard: ({ props, context, event }) =>
        !props.disabled && event.index >= 0 && event.index < rangeSliderValues(props, context).length,
      target: 'dragging',
      assign: ({ event }) => ({ activeIndex: event.index }),
    },
    END: { target: 'idle' },
    SET: {
      guard: ({ props, context, event }) =>
        !props.disabled &&
        Number.isFinite(event.value) &&
        !same(requested(props, context, event.index, event.value), rangeSliderValues(props, context)),
      assign: ({ props, context, event }) => ({
        value: props.value === undefined ? requested(props, context, event.index, event.value) : context.value,
        activeIndex: event.index,
      }),
      actions: [
        ({ props, context, event }) => props.onValueChange?.(requested(props, context, event.index, event.value)),
      ],
    },
    RESET: {
      target: 'idle',
      guard: ({ props, context }) =>
        !same(normalizeRangeValues(context.defaultValue, props), rangeSliderValues(props, context)),
      assign: ({ props, context }) => ({
        value: props.value === undefined ? normalizeRangeValues(context.defaultValue, props) : context.value,
      }),
      actions: [({ props, context }) => props.onValueChange?.(normalizeRangeValues(context.defaultValue, props))],
    },
  },
});
