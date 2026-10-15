import { createMachine } from "../_shared/core/index";
import type { Direction, MachineArgs } from "../_shared/core/index";
import { colorChannelKey, formatColor, normalizeColor, parseColor, sameColor } from "./color-value";
import type { ColorChannel, ColorFormat, ColorValue } from "./color-value";
export interface ColorPickerMachineOptions {
  value?: ColorValue;
  defaultValue?: ColorValue;
  onValueChange?: (value: ColorValue) => void;
  format?: ColorFormat;
  enableAlpha?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  dir?: Direction;
  name?: string;
  form?: string;
  channelLabels?: Partial<Record<ColorChannel, string>>;
}
export interface ColorPickerSchema {
  state: 'idle' | 'editing' | 'dragging';
  props: ColorPickerMachineOptions;
  context: {
    value: ColorValue;
    initial: ColorValue;
    draft: string | null;
    channelDraft: { channel: ColorChannel; text: string } | null;
    base: string;
    requested: ColorValue;
    notify: boolean;
  };
  event:
    | { type: 'SET'; value: ColorValue }
    | { type: 'CHANNEL'; channel: ColorChannel; value: number }
    | { type: 'AREA'; saturation: number; brightness: number }
    | { type: 'EDIT'; text: string }
    | { type: 'EDIT_CHANNEL'; channel: ColorChannel; text: string }
    | { type: 'COMMIT' }
    | { type: 'CANCEL' }
    | { type: 'RESET' }
    | { type: 'START' }
    | { type: 'END' };
}
export const colorValue = (props: ColorPickerMachineOptions, context: ColorPickerSchema['context']) =>
  normalizeColor(props.value ?? context.value, props.enableAlpha !== false);
export const colorKey = (value: ColorValue) => [value.h, value.s, value.v, value.a].join(',');
export function colorText(props: ColorPickerMachineOptions, context: ColorPickerSchema['context']) {
  const value = colorValue(props, context);
  return context.draft !== null && context.base === colorKey(value) ? context.draft : formatColor(value, props.format);
}
export function colorChannelDraft(props: ColorPickerMachineOptions, context: ColorPickerSchema['context']) {
  return context.base === colorKey(colorValue(props, context)) &&
    !(context.channelDraft?.channel === 'alpha' && props.enableAlpha === false)
    ? context.channelDraft
    : null;
}
export function parseChannelInput(channel: ColorChannel, text: string): number | null {
  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const number = Number(text);
  if (!Number.isFinite(number) || number < 0 || number > (channel === 'hue' ? 360 : 100)) return null;
  return channel === 'alpha' ? number / 100 : number;
}
export function colorChannelText(
  props: ColorPickerMachineOptions,
  context: ColorPickerSchema['context'],
  channel: ColorChannel,
) {
  const draft = colorChannelDraft(props, context);
  if (draft?.channel === channel) return draft.text;
  const number = colorValue(props, context)[colorChannelKey[channel]] * (channel === 'alpha' ? 100 : 1);
  return String(Number(number.toFixed(3)));
}
function draftValue(props: ColorPickerMachineOptions, context: ColorPickerSchema['context']): ColorValue | null {
  const draft = colorChannelDraft(props, context);
  if (draft) {
    const number = parseChannelInput(draft.channel, draft.text);
    return number === null ? null : { ...colorValue(props, context), [colorChannelKey[draft.channel]]: number };
  }
  if (context.draft === null || context.base !== colorKey(colorValue(props, context))) return null;
  const next = parseColor(context.draft);
  // Preserve the useful hue when a text representation has no chroma.
  if (next && (next.s === 0 || next.v === 0)) next.h = colorValue(props, context).h;
  return next;
}
const editable = ({ props }: MachineArgs<ColorPickerSchema>) => !props.disabled && !props.readOnly;
function request(props: ColorPickerMachineOptions, context: ColorPickerSchema['context'], value: ColorValue) {
  const next = normalizeColor(value, props.enableAlpha !== false);
  return {
    value: props.value === undefined ? next : context.value,
    draft: null,
    channelDraft: null,
    requested: next,
    notify: !sameColor(colorValue(props, context), next),
  };
}
const notify = ({ props, context }: MachineArgs<ColorPickerSchema>) => {
  if (context.notify) props.onValueChange?.({ ...context.requested });
};
export const colorPickerMachine = createMachine<ColorPickerSchema>({
  initial: 'idle',
  states: { idle: {}, editing: {}, dragging: {} },
  context: ({ props }) => {
    const value = normalizeColor(props.defaultValue ?? { h: 0, s: 100, v: 100, a: 1 }, props.enableAlpha !== false);
    return {
      value,
      initial: { ...value },
      draft: null,
      channelDraft: null,
      base: '',
      requested: { ...value },
      notify: false,
    };
  },
  onProps: {
    guard: ({ props, context }) =>
      !!props.disabled ||
      !!props.readOnly ||
      (context.channelDraft?.channel === 'alpha' && props.enableAlpha === false) ||
      ((context.draft !== null || context.channelDraft !== null) &&
        context.base !== colorKey(colorValue(props, context))),
    target: 'idle',
    assign: () => ({ draft: null, channelDraft: null }),
  },
  on: {
    SET: {
      guard: editable,
      assign: ({ props, context, event }) => request(props, context, event.value),
      actions: [notify],
    },
    CHANNEL: {
      guard: (args) =>
        editable(args) &&
        Number.isFinite(args.event.value) &&
        !(args.event.channel === 'alpha' && args.props.enableAlpha === false),
      assign: ({ props, context, event }) =>
        request(props, context, { ...colorValue(props, context), [colorChannelKey[event.channel]]: event.value }),
      actions: [notify],
    },
    AREA: {
      guard: (args) =>
        editable(args) && Number.isFinite(args.event.saturation) && Number.isFinite(args.event.brightness),
      assign: ({ props, context, event }) =>
        request(props, context, { ...colorValue(props, context), s: event.saturation, v: event.brightness }),
      actions: [notify],
    },
    EDIT: {
      guard: editable,
      target: 'editing',
      assign: ({ props, context, event }) => ({
        draft: event.text,
        channelDraft: null,
        base: colorKey(colorValue(props, context)),
      }),
    },
    EDIT_CHANNEL: {
      guard: (args) => editable(args) && !(args.event.channel === 'alpha' && args.props.enableAlpha === false),
      target: 'editing',
      assign: ({ props, context, event }) => ({
        draft: null,
        channelDraft: { channel: event.channel, text: event.text },
        base: colorKey(colorValue(props, context)),
      }),
    },
    COMMIT: {
      guard: (args) => editable(args) && draftValue(args.props, args.context) !== null,
      target: 'idle',
      assign: ({ props, context }) => request(props, context, draftValue(props, context)!),
      actions: [notify],
    },
    CANCEL: { target: 'idle', assign: () => ({ draft: null, channelDraft: null }) },
    START: { guard: editable, target: 'dragging', assign: () => ({ draft: null, channelDraft: null }) },
    END: { target: 'idle' },
    RESET: {
      target: 'idle',
      assign: ({ props, context }) => request(props, context, context.initial),
      actions: [notify],
    },
  },
});
