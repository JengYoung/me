'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useSlider } from './use-slider';
import type { SliderApi, SliderOptions } from './use-slider';

const Context = createContext<SliderApi | null>(null);
function useSliderContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Slider parts must be rendered inside Slider.Root.');
  return api;
}
export type SliderRootProps = SliderOptions & { children?: ReactNode };
export function SliderRoot({ children, ...options }: SliderRootProps) {
  const api = useSlider(options);
  return <Context value={api}>{children}</Context>;
}
export function SliderTrack(props: PartProps<'div'>) {
  return <div {...useSliderContext().getTrackProps(props)} />;
}
export function SliderRange(props: PartProps<'div'>) {
  return <div {...useSliderContext().getRangeProps(props)} />;
}
export function SliderThumb(props: PartProps<'div'>) {
  return <div {...useSliderContext().getThumbProps(props)} />;
}
export function SliderLabel(props: PartProps<'span'>) {
  return <span {...useSliderContext().getLabelProps(props)} />;
}
export function SliderHiddenInput(props: PartProps<'input'>) {
  return <input {...useSliderContext().getHiddenInputProps(props)} />;
}
export function SliderControl(props: PartProps<'div'>) {
  return <div {...useSliderContext().getRootProps(props)} />;
}
export type SliderValueProps = { children: (api: SliderApi) => ReactNode };
export function SliderValue({ children }: SliderValueProps) {
  return children(useSliderContext());
}
export const Slider = {
  Root: SliderRoot,
  Control: SliderControl,
  Track: SliderTrack,
  Range: SliderRange,
  Thumb: SliderThumb,
  Label: SliderLabel,
  HiddenInput: SliderHiddenInput,
  Value: SliderValue,
};
