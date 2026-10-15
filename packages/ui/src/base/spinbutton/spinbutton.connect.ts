import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RefCallback } from 'react';
import { invalidSpinbutton, parseSpinbutton, spinbuttonText, spinbuttonValue } from "./spinbutton.machine";
import type { SpinbuttonOptions, SpinbuttonSchema } from "./spinbutton.machine";

export function connectSpinbutton(
  service: MachineApi<SpinbuttonSchema>,
  options: SpinbuttonOptions & { id: string },
  inputRef: RefCallback<HTMLInputElement>,
) {
  const value = spinbuttonValue(options, service.state.context);
  const text = spinbuttonText(options, service.state.context);
  const composing = service.state.value === 'composing';
  const invalid = !!options.invalid || (!composing && invalidSpinbutton(text, options));
  const number = parseSpinbutton(text);
  const data = {
    'data-scope': 'spinbutton',
    'data-state': service.state.value,
    'data-disabled': options.disabled || undefined,
    'data-invalid': invalid || undefined,
  } as const;
  function stepProps(direction: 1 | -1, props: PartProps<'button'> = {}): PartProps<'button'> {
    return mergeProps<'button'>(props, {
      ...data,
      'data-part': direction === 1 ? 'increment' : 'decrement',
      type: 'button',
      tabIndex: -1,
      disabled:
        options.disabled ||
        options.readOnly ||
        (number !== null &&
          number !== undefined &&
          (direction === 1
            ? options.max !== undefined && number >= options.max
            : options.min !== undefined && number <= options.min)),
      'aria-label': props['aria-label'] ?? (direction === 1 ? 'Increase value' : 'Decrease value'),
      'aria-controls': options.id,
      onMouseDown(event) {
        event.preventDefault();
        event.currentTarget.ownerDocument.getElementById(options.id)?.focus({ preventScroll: true });
      },
      onClick(event) {
        service.send({ type: 'STEP', direction });
        event.currentTarget.ownerDocument.getElementById(options.id)?.focus({ preventScroll: true });
      },
    });
  }
  return {
    value,
    text,
    invalid,
    composing,
    setValue: (next: number | null) => service.send({ type: 'SET', value: next }),
    increment: () => service.send({ type: 'STEP', direction: 1 }),
    decrement: () => service.send({ type: 'STEP', direction: -1 }),
    commit: () => service.send({ type: 'COMMIT' }),
    cancel: () => service.send({ type: 'CANCEL' }),
    getLabelProps: (props: PartProps<'label'> = {}): PartProps<'label'> =>
      mergeProps<'label'>(props, { ...data, 'data-part': 'label', htmlFor: options.id }),
    getInputProps(props: PartProps<'input'> = {}): PartProps<'input'> {
      const { defaultValue: _default, name: _name, ...user } = props;
      return mergeProps<'input'>(user, {
        ...data,
        'data-part': 'input',
        id: options.id,
        type: 'text',
        role: 'spinbutton',
        inputMode: 'decimal',
        value: text,
        ref(input) {
          if (!input) return;
          input.setCustomValidity(invalid ? 'Enter a valid number within the allowed range and step.' : '');
          return inputRef(input);
        },
        disabled: options.disabled,
        readOnly: options.readOnly,
        required: options.required,
        form: options.form,
        'aria-valuenow': number ?? undefined,
        'aria-valuemin': options.min,
        'aria-valuemax': options.max,
        'aria-valuetext': number !== null && number !== undefined ? options.getValueText?.(number) : undefined,
        'aria-invalid': invalid || undefined,
        onChange(event) {
          service.send({ type: 'EDIT', text: event.currentTarget.value });
        },
        onCompositionStart() {
          service.send({ type: 'COMPOSITION_START' });
        },
        onCompositionEnd(event) {
          service.send({ type: 'COMPOSITION_END', text: event.currentTarget.value });
        },
        onBlur() {
          service.send({ type: 'COMMIT' });
        },
        onKeyDown(event) {
          if (
            event.nativeEvent.isComposing ||
            event.nativeEvent.keyCode === 229 ||
            service.getSnapshot().value === 'composing' ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
          )
            return;
          const current = service.getProps();
          if (current.disabled || current.readOnly) return;
          switch (event.key) {
            case 'ArrowUp':
            case 'PageUp':
              event.preventDefault();
              service.send({ type: 'STEP', direction: 1, large: event.key === 'PageUp' });
              break;
            case 'ArrowDown':
            case 'PageDown':
              event.preventDefault();
              service.send({ type: 'STEP', direction: -1, large: event.key === 'PageDown' });
              break;
            case 'Home':
              if (current.min !== undefined) {
                event.preventDefault();
                service.send({ type: 'SET', value: current.min });
              }
              break;
            case 'End':
              if (current.max !== undefined) {
                event.preventDefault();
                service.send({ type: 'SET', value: current.max });
              }
              break;
            case 'Enter':
              event.preventDefault();
              service.send({ type: 'COMMIT' });
              break;
            case 'Escape':
              event.preventDefault();
              service.send({ type: 'CANCEL' });
              break;
          }
        },
      });
    },
    getIncrementProps: (props: PartProps<'button'> = {}) => stepProps(1, props),
    getDecrementProps: (props: PartProps<'button'> = {}) => stepProps(-1, props),
    getHiddenInputProps(props: PartProps<'input'> = {}): PartProps<'input'> {
      const { defaultValue: _default, ...user } = props;
      return mergeProps<'input'>(user, {
        ...data,
        'data-part': 'hidden-input',
        type: 'hidden',
        value: value ?? '',
        name: options.name,
        form: options.form,
        disabled: options.disabled,
      });
    },
  };
}
export type SpinbuttonApi = ReturnType<typeof connectSpinbutton>;
