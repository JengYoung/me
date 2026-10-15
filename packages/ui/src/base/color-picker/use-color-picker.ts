'use client';
import { useCallback, useState } from 'react';
import { useField } from "../field/index";
import type { FieldOptions } from "../field/index";
import { pointerRatio, useDirectionContext, useFormReset, useMachine, usePointerDrag, useStableId } from "../_shared/react/index";
import type { PointerEvent } from 'react';
import { colorChannelDraft, colorPickerMachine, colorText, parseChannelInput } from "./color-picker.machine";
import type { ColorPickerMachineOptions } from "./color-picker.machine";
import { normalizeColor, parseColor } from "./color-value";
import { connectColorPicker } from "./color-picker.connect";
export type ColorPickerOptions = ColorPickerMachineOptions & Omit<FieldOptions, 'required'>;
export function useColorPicker(options: ColorPickerOptions = {}) {
  if (options.value) normalizeColor(options.value);
  if (options.defaultValue) normalizeColor(options.defaultValue);
  const [controlled] = useState(options.value !== undefined);
  const id = useStableId('iris-color-picker', options.id);
  const inherited = useDirectionContext();
  const props = { ...options, id, dir: options.dir ?? inherited };
  const service = useMachine(colorPickerMachine, { props });
  const { send, getProps } = service;
  const channelDraft = colorChannelDraft(options, service.state.context);
  const field = useField({
    ...options,
    id,
    invalid:
      options.invalid ||
      !parseColor(colorText(options, service.state.context)) ||
      (channelDraft !== null && parseChannelInput(channelDraft.channel, channelDraft.text) === null),
  });
  const updateArea = (event: PointerEvent<HTMLDivElement>) => {
    const current = getProps();
    const dir =
      current.dir ??
      (event.currentTarget.ownerDocument.defaultView?.getComputedStyle(event.currentTarget).direction === 'rtl'
        ? 'rtl'
        : 'ltr');
    const x = pointerRatio(event, 'horizontal', dir);
    const y = pointerRatio(event, 'vertical', dir);
    if (x === undefined || y === undefined) return false;
    send({ type: 'AREA', saturation: x * 100, brightness: y * 100 });
    return true;
  };
  const drag = usePointerDrag({
    disabled: options.disabled || options.readOnly,
    onStart(event) {
      if ((event.target as HTMLElement).closest('input,button')) return false;
      send({ type: 'START' });
      if (!updateArea(event)) {
        send({ type: 'END' });
        return false;
      }
      event.currentTarget.ownerDocument.getElementById(`${id}-saturation`)?.focus({ preventScroll: true });
      return true;
    },
    onMove: updateArea,
    onEnd: () => send({ type: 'END' }),
  });
  const reset = useCallback(() => send({ type: 'RESET' }), [send]);
  const resetRef = useFormReset(options.form, reset);
  if (controlled !== (options.value !== undefined)) throw new Error('Color Picker cannot switch control modes.');
  return connectColorPicker(service, props, field, drag, resetRef);
}
export type { ColorPickerApi } from "./color-picker.connect";
