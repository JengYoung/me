import { createMachine, snapNumber } from '../_shared/core/index';
import type { NumberRangeOptions } from '../_shared/core/index';

export interface SliderOptions extends NumberRangeOptions {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  getValueText?: (value: number) => string;
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
  disabled?: boolean;
  name?: string;
  form?: string;
  id?: string;
}
export interface SliderSchema {
  state: 'idle' | 'dragging';
  props: SliderOptions;
  context: { value: number; defaultValue: number };
  event: { type: 'SET'; value: number } | { type: 'START' } | { type: 'END' } | { type: 'RESET' };
}
export const sliderValue = (props: SliderOptions, context: SliderSchema['context']) =>
  snapNumber(props.value ?? context.value, props);

export const sliderMachine = createMachine<SliderSchema>({
  initial: 'idle',
  context: ({ props }) => ({
    value: snapNumber(props.defaultValue ?? props.min ?? 0, props),
    defaultValue: snapNumber(props.defaultValue ?? props.min ?? 0, props),
  }),
  states: { idle: {}, dragging: {} },
  onProps: { guard: ({ props }) => !!props.disabled, target: 'idle' },
  on: {
    START: { guard: ({ props }) => !props.disabled, target: 'dragging' },
    END: { target: 'idle' },
    SET: {
      guard: ({ props, context, event }) =>
        !props.disabled &&
        Number.isFinite(event.value) &&
        snapNumber(event.value, props) !== sliderValue(props, context),
      assign: ({ props, context, event }) => ({
        value: props.value === undefined ? snapNumber(event.value, props) : context.value,
      }),
      actions: [({ props, event }) => props.onValueChange?.(snapNumber(event.value, props))],
    },
    RESET: {
      target: 'idle',
      guard: ({ props, context }) => snapNumber(context.defaultValue, props) !== sliderValue(props, context),
      assign: ({ props, context }) => ({
        value: props.value === undefined ? snapNumber(context.defaultValue, props) : context.value,
      }),
      actions: [({ props, context }) => props.onValueChange?.(snapNumber(context.defaultValue, props))],
    },
  },
});
