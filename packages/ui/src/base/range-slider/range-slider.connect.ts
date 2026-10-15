import { numberPercent, numberRange, sliderKeyValue } from "../_shared/core/index";
import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps, usePointerDrag } from "../_shared/react/index";
import type { RefCallback } from 'react';
import { rangeSliderValues, thumbBounds } from "./range-slider.machine";
import type { RangeSliderOptions, RangeSliderSchema } from "./range-slider.machine";

export function connectRangeSlider(
  service: MachineApi<RangeSliderSchema>,
  options: RangeSliderOptions & { id: string },
  drag: ReturnType<typeof usePointerDrag>,
  inputRef: RefCallback<HTMLInputElement>,
) {
  const value = rangeSliderValues(options, service.state.context);
  const { min, max } = numberRange(options);
  const percents = value.map((item) => numberPercent(item, min, max));
  const data = {
    'data-scope': 'range-slider',
    'data-disabled': options.disabled || undefined,
    'data-orientation': options.orientation ?? 'horizontal',
    'data-state': service.state.value,
  } as const;
  return {
    value,
    percents,
    dragging: service.state.value === 'dragging',
    activeIndex: service.state.context.activeIndex,
    setValue: (index: number, next: number) => {
      thumbBounds(value, index, options);
      service.send({ type: 'SET', index, value: next });
    },
    getRootProps: (props: PartProps<'div'> = {}): PartProps<'div'> =>
      mergeProps<'div'>(props, { ...data, 'data-part': 'root', id: options.id, dir: options.dir }),
    getTrackProps: (props: PartProps<'div'> = {}): PartProps<'div'> =>
      mergeProps<'div'>(props, { ...data, 'data-part': 'track', ...drag }),
    getRangeProps: (props: PartProps<'div'> = {}): PartProps<'div'> =>
      mergeProps<'div'>(props, { ...data, 'data-part': 'range', 'aria-hidden': true }),
    getLabelProps(index: number, props: PartProps<'span'> = {}): PartProps<'span'> {
      thumbBounds(value, index, options);
      return mergeProps<'span'>(props, { ...data, 'data-part': 'label', id: `${options.id}-label-${index}` });
    },
    getThumbProps(index: number, props: PartProps<'div'> = {}): PartProps<'div'> {
      const bounds = thumbBounds(value, index, options);
      return mergeProps<'div'>(props, {
        ...data,
        'data-part': 'thumb',
        'data-index': index,
        id: `${options.id}-thumb-${index}`,
        role: 'slider',
        tabIndex: options.disabled ? -1 : 0,
        'aria-labelledby':
          props['aria-labelledby'] ?? (props['aria-label'] ? undefined : `${options.id}-label-${index}`),
        'aria-valuemin': bounds.min,
        'aria-valuemax': bounds.max,
        'aria-valuenow': value[index],
        'aria-valuetext': options.getValueText?.(value[index]!, index),
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
          const values = rangeSliderValues(current, service.getSnapshot().context);
          const next =
            event.key === 'Home'
              ? thumbBounds(values, index, current).min
              : event.key === 'End'
                ? thumbBounds(values, index, current).max
                : sliderKeyValue(event.key, values[index]!, current);
          if (next === undefined) return;
          event.preventDefault();
          service.send({ type: 'SET', index, value: next });
        },
      });
    },
    getHiddenInputProps(index: number, props: PartProps<'input'> = {}): PartProps<'input'> {
      thumbBounds(value, index, options);
      const { defaultValue: _default, ...user } = props;
      return mergeProps<'input'>(user, {
        ...data,
        'data-part': 'input',
        ref: index === 0 ? inputRef : undefined,
        type: 'hidden',
        name: options.name,
        form: options.form,
        value: value[index],
        disabled: options.disabled,
      });
    },
  };
}
export type RangeSliderApi = ReturnType<typeof connectRangeSlider>;
