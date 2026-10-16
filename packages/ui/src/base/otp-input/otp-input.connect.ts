import { mergeProps } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';
import type { FieldApi } from '../field/index';
import type { Snapshot } from '../_shared/core/index';
import type { RefCallback } from 'react';
import { otpValue } from './otp-input.machine';
import type { OtpInputSchema } from './otp-input.machine';
import type { OtpInputOptions } from './use-otp-input';

export type OtpInputInputProps = Omit<
  PartProps<'input'>,
  'value' | 'defaultValue' | 'id' | 'type' | 'name' | 'form' | 'maxLength' | 'minLength' | 'pattern'
>;
export function connectOtpInput(
  field: FieldApi,
  options: OtpInputOptions,
  state: Snapshot<OtpInputSchema>,
  actions: {
    ref: RefCallback<HTMLInputElement>;
    change(node: HTMLInputElement, compositionEnd?: boolean): void;
    select(node: HTMLInputElement): void;
    send(event: OtpInputSchema['event']): void;
    setValue(value: string): void;
    focus(index?: number): void;
    activateSlot(index: number): void;
  },
) {
  const value = otpValue(options, state.context);
  const characters = Array.from(value);
  const length = options.length ?? 6;
  const focused = state.value === 'focused' && !options.disabled;
  const activeIndex = focused ? Math.min(state.context.start, characters.length, length - 1) : null;
  const complete = characters.length === length;
  const slots = Array.from({ length }, (_, index) => ({
    index,
    character: characters[index] ?? '',
    active: index === activeIndex,
    selected: focused && index >= state.context.start && index < state.context.end,
  }));
  const data = (part: string) => ({
    'data-scope': 'otp-input',
    'data-part': part,
    'data-complete': complete ? '' : undefined,
  });
  return {
    value,
    length,
    complete,
    focused,
    activeIndex,
    slots,
    ids: field.ids,
    setValue: actions.setValue,
    focus: actions.focus,
    getRootProps(user: PartProps<'div'> = {}) {
      return mergeProps<'div'>(field.getRootProps(user), data('root'));
    },
    getLabelProps(user: PartProps<'label'> = {}) {
      return mergeProps<'label'>(field.getLabelProps(user), data('label'));
    },
    getDescriptionProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(field.getDescriptionProps(user), data('description'));
    },
    getErrorProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(field.getErrorProps(user), data('error'));
    },
    getInputProps(user: OtpInputInputProps = {}): PartProps<'input'> {
      return mergeProps<'input'>(
        { autoComplete: 'one-time-code', inputMode: 'numeric', ...field.getControlProps(user) },
        {
          ...data('input'),
          ref: actions.ref,
          type: 'text',
          name: options.name,
          form: options.form,
          value: state.context.draft ?? value,
          pattern: `.{${length}}`,
          onChange() {},
          onInput(event) {
            actions.change(event.currentTarget);
          },
          onCompositionStart(event) {
            actions.send({ type: 'COMPOSITION_START', value: event.currentTarget.value });
          },
          onCompositionEnd(event) {
            actions.change(event.currentTarget, true);
          },
          onFocus(event) {
            actions.send({ type: 'FOCUS' });
            actions.select(event.currentTarget);
          },
          onBlur() {
            actions.send({ type: 'BLUR' });
          },
          onSelect(event) {
            actions.select(event.currentTarget);
          },
          onPaste(event) {
            if (options.disabled || options.readOnly || state.context.draft !== null) return;
            event.preventDefault();
            const node = event.currentTarget;
            node.setRangeText(
              event.clipboardData.getData('text'),
              node.selectionStart ?? 0,
              node.selectionEnd ?? 0,
              'end',
            );
            actions.change(node);
          },
        },
      );
    },
    getSlotProps(index: number, user: PartProps<'span'> = {}): PartProps<'span'> {
      const slot = slots[index];
      if (!slot) throw new Error('OTP slot index is outside the configured length.');
      return mergeProps<'span'>(user, {
        ...data('slot'),
        'aria-hidden': true,
        'data-index': index,
        'data-active': slot.active ? '' : undefined,
        'data-selected': slot.selected ? '' : undefined,
        'data-filled': slot.character ? '' : undefined,
        'data-disabled': options.disabled ? '' : undefined,
        onPointerDown(event) {
          // Keep mouse focus on the input without canceling touch-generated clicks in Safari.
          if (!options.disabled && event.pointerType === 'mouse' && event.button === 0) event.preventDefault();
        },
        onClick(event) {
          if (event.button === 0) actions.activateSlot(index);
        },
      });
    },
  };
}
export type OtpInputApi = ReturnType<typeof connectOtpInput>;
