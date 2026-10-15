import { numberPercent, numberRange, sliderKeyValue } from '../_shared/core/index';
import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps, usePointerDrag } from '../_shared/react/index';
import type { RefCallback } from 'react';
import { sliderValue } from './slider.machine';
import type { SliderOptions, SliderSchema } from './slider.machine';

export function connectSlider(
  service: MachineApi<SliderSchema>,
  options: SliderOptions & { id: string },
  drag: ReturnType<typeof usePointerDrag>,
  inputRef: RefCallback<HTMLInputElement>,
) {
  const value = sliderValue(options, service.state.context);
  const { min, max } = numberRange(options);
  const percent = numberPercent(value, min, max);
  const data = {
    'data-scope': 'slider',
    'data-disabled': options.disabled || undefined,
    'data-orientation': options.orientation ?? 'horizontal',
    'data-state': service.state.value,
  } as const;
  return {
    value,
    percent,
    dragging: service.state.value === 'dragging',
    setValue: (next: number) => service.send({ type: 'SET', value: next }),
    getRootProps: (props: PartProps<'div'> = {}): PartProps<'div'> =>
      mergeProps<'div'>(props, { ...data, 'data-part': 'root', id: options.id, dir: options.dir }),
    getLabelProps: (props: PartProps<'span'> = {}): PartProps<'span'> =>
      mergeProps<'span'>(props, { ...data, 'data-part': 'label', id: `${options.id}-label` }),
    getTrackProps: (props: PartProps<'div'> = {}): PartProps<'div'> =>
      mergeProps<'div'>(props, { ...data, 'data-part': 'track', ...drag }),
    getRangeProps: (props: PartProps<'div'> = {}): PartProps<'div'> =>
      mergeProps<'div'>(props, { ...data, 'data-part': 'range', 'aria-hidden': true }),
    getThumbProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ...data,
        'data-part': 'thumb',
        id: `${options.id}-thumb`,
        role: 'slider',
        tabIndex: options.disabled ? -1 : 0,
        'aria-label': props['aria-label'],
        'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : `${options.id}-label`),
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuenow': value,
        'aria-valuetext': options.getValueText?.(value),
        'aria-orientation': options.orientation ?? 'horizontal',
        'aria-disabled': options.disabled || undefined,
        onKeyDown(event) {
          if (
            event.target !== event.currentTarget ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.nativeEvent.isComposing
          )
            return;
          const current = service.getProps();
          if (current.disabled) return;
          const next = sliderKeyValue(event.key, sliderValue(current, service.getSnapshot().context), current);
          if (next === undefined) return;
          event.preventDefault();
          service.send({ type: 'SET', value: next });
        },
      });
    },
    getHiddenInputProps(props: PartProps<'input'> = {}): PartProps<'input'> {
      const { defaultValue: _default, ...user } = props;
      return mergeProps<'input'>(user, {
        ...data,
        'data-part': 'input',
        ref: inputRef,
        type: 'hidden',
        name: options.name,
        form: options.form,
        value,
        disabled: options.disabled,
      });
    },
  };
}
export type SliderApi = ReturnType<typeof connectSlider>;
