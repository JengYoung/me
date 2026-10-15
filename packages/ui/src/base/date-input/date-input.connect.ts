import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { FieldApi } from "../field/index";
import type { RefCallback } from 'react';
import { dateInputParts, dateInputValue } from "./date-input.machine";
import type { DateInputSchema } from "./date-input.machine";
import { dateLayout, dateSegmentRange, dateValidity, serializeDate } from "./date-value";
import type { DateSegmentType } from "./date-value";
import type { DateInputOptions } from "./use-date-input";

export interface DateInputSegmentData {
  type: DateSegmentType | 'literal';
  text: string;
}
export function connectDateInput(
  service: MachineApi<DateInputSchema>,
  options: DateInputOptions & { id: string },
  field: FieldApi,
  resetRef: RefCallback<HTMLInputElement>,
) {
  const parts = dateInputParts(options, service.state.context);
  const validity = dateValidity(parts, options);
  const completeValue =
    validity === 'valid' && !service.state.context.rejectedPaste ? serializeDate(parts, options.granularity) : null;
  const segments: DateInputSegmentData[] = dateLayout(options).map((part) => ({
    ...part,
    text: part.type === 'literal' ? part.text : parts[part.type],
  }));
  const types = segments.filter((part) => part.type !== 'literal').map((part) => part.type as DateSegmentType);
  const data = (part: string) => ({
    'data-scope': 'date-input',
    'data-part': part,
    'data-invalid': field.invalid || undefined,
    'data-disabled': options.disabled || undefined,
  });
  const segmentId = (type: DateSegmentType) => `${options.id}-${type}`;
  return {
    ids: field.ids,
    value: dateInputValue(options, service.state.context),
    completeValue,
    validity,
    invalid: field.invalid,
    segments,
    setValue: (value: string | null) => service.send({ type: 'SET', value }),
    clear: () => service.send({ type: 'SET', value: null }),
    cancel: () => service.send({ type: 'CANCEL' }),
    commit: () => service.send({ type: 'COMMIT' }),
    getGroupProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      const { 'aria-required': _required, 'aria-readonly': _readOnly, ...props } = field.getCustomControlProps(user);
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
    getSegmentProps(type: DateSegmentType, user: PartProps<'input'> = {}): PartProps<'input'> {
      if (!types.includes(type)) throw new Error(`Date segment is not enabled: ${type}`);
      const { defaultValue: _default, name: _name, ...rest } = user;
      const [min, max] = dateSegmentRange(type, parts);
      const text = parts[type];
      return mergeProps<'input'>(field.getControlProps(rest), {
        ...data('segment'),
        'data-segment': type,
        id: segmentId(type),
        type: 'text',
        role: 'spinbutton',
        inputMode: 'numeric',
        value: text,
        size: type === 'year' ? 4 : 2,
        maxLength: type === 'year' ? 4 : 2,
        autoComplete: 'off',
        form: options.form,
        'aria-label': user['aria-label'] ?? options.segmentLabels?.[type] ?? type,
        'aria-labelledby': options.label === false ? user['aria-labelledby'] : `${field.ids.label} ${segmentId(type)}`,
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuenow': text ? Number(text) : undefined,
        'aria-valuetext': text || 'Empty',
        'aria-required': options.required,
        ref(input) {
          if (input) input.setCustomValidity(field.invalid ? 'Enter a complete date within the allowed range.' : '');
        },
        onFocus(event) {
          event.currentTarget.select();
        },
        onChange(event) {
          service.send({ type: 'EDIT', segment: type, text: event.currentTarget.value });
        },
        onBlur() {
          service.send({ type: 'COMMIT' });
        },
        onPaste(event) {
          const current = service.getProps();
          if (current.disabled || current.readOnly) return;
          const text = event.clipboardData.getData('text');
          if (/^\d{1,4}$/.test(text.trim())) return;
          event.preventDefault();
          service.send({ type: 'PASTE', text });
        },
        onKeyDown(event) {
          if (event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          const current = service.getProps();
          if (current.disabled) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            const input = event.currentTarget;
            const dir = current.dir ?? input.ownerDocument.defaultView?.getComputedStyle(input).direction;
            const next = (event.key === 'ArrowRight' ? 1 : -1) * (dir === 'rtl' ? -1 : 1);
            const atEdge =
              (input.selectionStart === 0 && input.selectionEnd === input.value.length) ||
              (next < 0 ? input.selectionStart === 0 : input.selectionEnd === input.value.length);
            const target = types[types.indexOf(type) + next];
            if (atEdge && target) {
              event.preventDefault();
              input.ownerDocument.getElementById(segmentId(target))?.focus();
            }
            return;
          }
          if (current.readOnly) return;
          if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            service.send({
              type: 'STEP',
              segment: type,
              amount: (event.key.endsWith('Down') ? -1 : 1) * (event.key.startsWith('Page') ? 10 : 1),
              edge: event.key === 'Home' ? 'min' : event.key === 'End' ? 'max' : undefined,
            });
          } else if (event.key === 'Escape') {
            event.preventDefault();
            service.send({ type: 'CANCEL' });
          } else if (event.key === 'Enter') {
            event.preventDefault();
            service.send({ type: 'COMMIT' });
          }
        },
      });
    },
    getHiddenInputProps(user: PartProps<'input'> = {}): PartProps<'input'> {
      const { defaultValue: _default, ...props } = user;
      return mergeProps<'input'>(props, {
        ...data('hidden-input'),
        type: 'hidden',
        value: completeValue ?? '',
        name: options.name,
        form: options.form,
        disabled: options.disabled,
        ref: resetRef,
      });
    },
  };
}
export type DateInputApi = ReturnType<typeof connectDateInput>;
