import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps, usePointerDrag } from "../_shared/react/index";
import type { FieldApi } from "../field/index";
import type { RefCallback } from 'react';
import { colorChannelText, colorText, colorValue, parseChannelInput } from "./color-picker.machine";
import type { ColorPickerSchema } from "./color-picker.machine";
import {
  colorChannelKey,
  colorChannelRange,
  colorToHsl,
  colorToRgb,
  formatColor,
  normalizeColor,
  parseColor,
} from "./color-value";
import type { ColorChannel, ColorValue } from "./color-value";
import type { ColorPickerOptions } from "./use-color-picker";
export function connectColorPicker(
  service: MachineApi<ColorPickerSchema>,
  options: ColorPickerOptions & { id: string },
  field: FieldApi,
  drag: ReturnType<typeof usePointerDrag>,
  resetRef: RefCallback<HTMLInputElement>,
) {
  const value = colorValue(options, service.state.context);
  const text = colorText(options, service.state.context);
  const hex = formatColor(value);
  const rgb = colorToRgb(value);
  const hsl = colorToHsl(value);
  const data = (part: string) => ({
    'data-scope': 'color-picker',
    'data-part': part,
    'data-disabled': options.disabled || undefined,
    'data-readonly': options.readOnly || undefined,
    'data-invalid': field.invalid || undefined,
  });
  const names = { hue: 'Hue', saturation: 'Saturation', brightness: 'Brightness', alpha: 'Opacity' };
  return {
    value,
    text,
    hex,
    rgb,
    hsl,
    invalid: field.invalid,
    ids: field.ids,
    dragging: service.state.value === 'dragging',
    hueColor: formatColor({ h: value.h, s: 100, v: 100, a: 1 }),
    setValue: (value: ColorValue) => service.send({ type: 'SET', value }),
    setChannel: (channel: ColorChannel, value: number) => service.send({ type: 'CHANNEL', channel, value }),
    commit: () => service.send({ type: 'COMMIT' }),
    cancel: () => service.send({ type: 'CANCEL' }),
    getGroupProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      const { 'aria-readonly': _readOnly, 'aria-required': _required, ...props } = field.getCustomControlProps(user);
      return mergeProps<'div'>(props, { ...data('group'), role: 'group', dir: options.dir });
    },
    getLabelProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(field.getCustomLabelProps(user), data('label'));
    },
    getDescriptionProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(field.getDescriptionProps(user), data('description'));
    },
    getErrorProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(field.getErrorProps(user), data('error'));
    },
    getAreaProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        ...data('area'),
        ...drag,
        role: 'group',
        'aria-label': user['aria-label'] ?? 'Saturation and brightness',
        'data-dragging': service.state.value === 'dragging' || undefined,
      });
    },
    getAreaThumbProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, { ...data('area-thumb'), 'aria-hidden': true });
    },
    getChannelProps(channel: ColorChannel, user: PartProps<'input'> = {}): PartProps<'input'> {
      const { defaultValue: _default, name: _name, ...props } = user;
      const range = colorChannelRange(channel);
      const current = value[colorChannelKey[channel]];
      const id = `${options.id}-${channel}`;
      return mergeProps<'input'>(field.getControlProps(props), {
        ...data('channel'),
        ...range,
        'data-channel': channel,
        type: 'range',
        id,
        value: current,
        disabled: options.disabled || (channel === 'alpha' && options.enableAlpha === false),
        'aria-label': user['aria-label'] ?? options.channelLabels?.[channel] ?? names[channel],
        'aria-labelledby': options.label === false ? user['aria-labelledby'] : `${field.ids.label} ${id}`,
        'aria-valuetext': `${Math.round(current * (channel === 'alpha' ? 100 : 1) * 100) / 100}${channel === 'hue' ? ' degrees' : '%'}`,
        'aria-readonly': options.readOnly,
        onChange(event) {
          service.send({ type: 'CHANNEL', channel, value: event.currentTarget.valueAsNumber });
        },
        onPointerDown(event) {
          if (service.getProps().readOnly) event.preventDefault();
        },
        onKeyDown(event) {
          if (
            service.getProps().readOnly &&
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)
          )
            event.preventDefault();
        },
      });
    },
    getChannelInputProps(channel: ColorChannel, user: PartProps<'input'> = {}): PartProps<'input'> {
      const { defaultValue: _default, name: _name, ...props } = user;
      const text = colorChannelText(options, service.state.context, channel);
      const number = parseChannelInput(channel, text);
      const id = `${options.id}-${channel}-input`;
      return mergeProps<'input'>(field.getControlProps(props), {
        ...data('channel-input'),
        'data-channel': channel,
        id,
        type: 'number',
        inputMode: 'decimal',
        min: 0,
        max: channel === 'hue' ? 360 : 100,
        step: 'any',
        value: text,
        form: options.form,
        disabled: options.disabled || (channel === 'alpha' && options.enableAlpha === false),
        readOnly: options.readOnly,
        'aria-label': user['aria-label'] ?? options.channelLabels?.[channel] ?? names[channel],
        'aria-labelledby': options.label === false ? user['aria-labelledby'] : `${field.ids.label} ${id}`,
        'aria-valuetext': number === null ? undefined : `${text}${channel === 'hue' ? ' degrees' : '%'}`,
        ref(input) {
          if (input)
            input.setCustomValidity(
              number === null ? `Enter a number from 0 to ${channel === 'hue' ? 360 : 100}.` : '',
            );
        },
        onChange(event) {
          service.send({ type: 'EDIT_CHANNEL', channel, text: event.currentTarget.value });
        },
        onBlur: () => service.send({ type: 'COMMIT' }),
        onKeyDown(event) {
          if (event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          if (event.key === 'Enter') {
            event.preventDefault();
            service.send({ type: 'COMMIT' });
          } else if (event.key === 'Escape') {
            event.preventDefault();
            service.send({ type: 'CANCEL' });
          }
        },
      });
    },
    getInputProps(user: PartProps<'input'> = {}): PartProps<'input'> {
      const { defaultValue: _default, name: _name, ...props } = user;
      const id = `${options.id}-text`;
      return mergeProps<'input'>(field.getControlProps(props), {
        ...data('input'),
        id,
        type: 'text',
        value: text,
        spellCheck: false,
        autoComplete: 'off',
        form: options.form,
        'aria-label': user['aria-label'] ?? 'Color text',
        'aria-labelledby': options.label === false ? user['aria-labelledby'] : `${field.ids.label} ${id}`,
        ref(input) {
          if (input) input.setCustomValidity(field.invalid ? 'Enter a valid color or channel value.' : '');
        },
        onChange(event) {
          service.send({ type: 'EDIT', text: event.currentTarget.value });
        },
        onBlur: () => service.send({ type: 'COMMIT' }),
        onKeyDown(event) {
          if (event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          if (event.key === 'Enter') {
            event.preventDefault();
            service.send({ type: 'COMMIT' });
          } else if (event.key === 'Escape') {
            event.preventDefault();
            service.send({ type: 'CANCEL' });
          }
        },
      });
    },
    getSwatchProps(color: string | ColorValue, user: PartProps<'button'> = {}): PartProps<'button'> {
      const parsed = typeof color === 'string' ? parseColor(color) : normalizeColor(color);
      if (!parsed) throw new Error(`Invalid swatch color: ${color}`);
      const next = normalizeColor(parsed, options.enableAlpha !== false);
      return mergeProps<'button'>(user, {
        ...data('swatch'),
        type: 'button',
        disabled: options.disabled || options.readOnly,
        'aria-label': user['aria-label'] ?? (typeof user.children === 'string' ? user.children : formatColor(next)),
        'aria-pressed': formatColor(next) === hex,
        onClick: () => service.send({ type: 'SET', value: next }),
      });
    },
    getHiddenInputProps(user: PartProps<'input'> = {}): PartProps<'input'> {
      const { defaultValue: _default, ...props } = user;
      return mergeProps<'input'>(props, {
        ...data('hidden-input'),
        type: 'hidden',
        value: field.invalid ? '' : hex,
        name: options.name,
        form: options.form,
        disabled: options.disabled,
        ref: resetRef,
      });
    },
  };
}
export type ColorPickerApi = ReturnType<typeof connectColorPicker>;
