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
import { sliderMachine, sliderValue } from './slider.machine';
import type { SliderOptions } from './slider.machine';
import { connectSlider } from './slider.connect';

export function useSlider(options: SliderOptions = {}) {
  numberRange(options);
  const [controlled] = useState(options.value !== undefined);
  const dir = useDirection(options.dir);
  const id = useStableId('iris-slider', options.id);
  const service = useMachine(sliderMachine, { props: { ...options, dir } });
  const { send, getProps, getSnapshot } = service;
  const offset = useRef(0);
  const drag = usePointerDrag({
    disabled: options.disabled,
    onStart(event) {
      const props = getProps();
      const ratio = pointerRatio(event, props.orientation ?? 'horizontal', props.dir ?? 'ltr');
      if (ratio === undefined) return false;
      const { min, max } = numberRange(props);
      const thumb = event.currentTarget.querySelector<HTMLElement>('[data-part="thumb"]');
      const onThumb = thumb?.contains(event.target as Node);
      offset.current = onThumb ? sliderValue(props, getSnapshot().context) - (min + ratio * (max - min)) : 0;
      thumb?.focus({ preventScroll: true });
      send({ type: 'START' });
      if (!onThumb) send({ type: 'SET', value: min + ratio * (max - min) });
      return true;
    },
    onMove(event) {
      const props = getProps();
      const ratio = pointerRatio(event, props.orientation ?? 'horizontal', props.dir ?? 'ltr');
      if (ratio === undefined) return;
      const { min, max } = numberRange(props);
      send({ type: 'SET', value: min + ratio * (max - min) + offset.current });
    },
    onEnd: () => send({ type: 'END' }),
  });
  const reset = useCallback(() => send({ type: 'RESET' }), [send]);
  const inputRef = useFormReset(options.form, reset);
  if (controlled !== (options.value !== undefined)) throw new Error('Slider cannot switch control modes.');
  return connectSlider(service, { ...options, dir, id }, drag, inputRef);
}
export type { SliderOptions } from './slider.machine';
export type { SliderApi } from './slider.connect';
