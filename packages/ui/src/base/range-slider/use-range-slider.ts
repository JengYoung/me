'use client';

import { numberRange } from '../_shared/core/index';
import {
  pointerRatio,
  useDirection,
  useFormReset,
  useMachine,
  usePointerDrag,
  useStableId,
} from '../_shared/react/index';
import { useCallback, useRef, useState } from 'react';
import { normalizeRangeValues, rangeSliderMachine, rangeSliderValues } from './range-slider.machine';
import type { RangeSliderOptions } from './range-slider.machine';
import { connectRangeSlider } from './range-slider.connect';

export function useRangeSlider(options: RangeSliderOptions = {}) {
  const { min, max } = numberRange(options);
  const initial = options.value ?? options.defaultValue ?? [min, max];
  normalizeRangeValues(initial, options);
  const [mode] = useState({ controlled: options.value !== undefined, count: initial.length });
  const dir = useDirection(options.dir);
  const id = useStableId('iris-range-slider', options.id);
  const service = useMachine(rangeSliderMachine, { props: { ...options, dir } });
  const { send, getProps, getSnapshot } = service;
  const offset = useRef(0);
  const drag = usePointerDrag({
    disabled: options.disabled,
    onStart(event) {
      const props = getProps();
      const ratio = pointerRatio(event, props.orientation ?? 'horizontal', props.dir ?? 'ltr');
      if (ratio === undefined) return false;
      const range = numberRange(props);
      const value = range.min + ratio * (range.max - range.min);
      const values = rangeSliderValues(props, getSnapshot().context);
      const target = (event.target as Element).closest<HTMLElement>('[data-part="thumb"]');
      const onThumb = target && event.currentTarget.contains(target);
      let index = onThumb ? Number(target.dataset.index) : getSnapshot().context.activeIndex;
      if (!onThumb)
        values.forEach((candidate, candidateIndex) => {
          if (Math.abs(candidate - value) < Math.abs(values[index]! - value)) index = candidateIndex;
        });
      offset.current = onThumb ? values[index]! - value : 0;
      event.currentTarget
        .querySelector<HTMLElement>(`[data-part="thumb"][data-index="${index}"]`)
        ?.focus({ preventScroll: true });
      send({ type: 'START', index });
      if (!onThumb) send({ type: 'SET', index, value });
      return true;
    },
    onMove(event) {
      const props = getProps();
      const ratio = pointerRatio(event, props.orientation ?? 'horizontal', props.dir ?? 'ltr');
      if (ratio === undefined) return;
      const range = numberRange(props);
      send({
        type: 'SET',
        index: getSnapshot().context.activeIndex,
        value: range.min + ratio * (range.max - range.min) + offset.current,
      });
    },
    onEnd: () => send({ type: 'END' }),
  });
  const reset = useCallback(() => send({ type: 'RESET' }), [send]);
  const inputRef = useFormReset(options.form, reset);
  if (mode.controlled !== (options.value !== undefined) || mode.count !== initial.length)
    throw new Error('RangeSlider control mode and thumb count must stay constant; remount to change them.');
  return connectRangeSlider(service, { ...options, dir, id }, drag, inputRef);
}
export type { RangeSliderOptions } from './range-slider.machine';
export type { RangeSliderApi } from './range-slider.connect';
