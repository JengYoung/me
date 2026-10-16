'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useRangeSlider } from './use-range-slider';
import type { RangeSliderApi, RangeSliderOptions } from './use-range-slider';
const Context = createContext<RangeSliderApi | null>(null);
function useRangeSliderContext() {
  const api = useContext(Context);
  if (!api) throw new Error('RangeSlider parts must be rendered inside RangeSlider.Root.');
  return api;
}
export type RangeSliderRootProps = RangeSliderOptions & { children?: ReactNode };
export function RangeSliderRoot({ children, ...options }: RangeSliderRootProps) {
  const api = useRangeSlider(options);
  return <Context value={api}>{children}</Context>;
}
export function RangeSliderControl(props: PartProps<'div'>) {
  return <div {...useRangeSliderContext().getRootProps(props)} />;
}
export function RangeSliderTrack(props: PartProps<'div'>) {
  return <div {...useRangeSliderContext().getTrackProps(props)} />;
}
export function RangeSliderRange(props: PartProps<'div'>) {
  return <div {...useRangeSliderContext().getRangeProps(props)} />;
}
export type RangeSliderThumbProps = PartProps<'div'> & { index: number };
export function RangeSliderThumb({ index, ...props }: RangeSliderThumbProps) {
  return <div {...useRangeSliderContext().getThumbProps(index, props)} />;
}
export type RangeSliderLabelProps = PartProps<'span'> & { index: number };
export function RangeSliderLabel({ index, ...props }: RangeSliderLabelProps) {
  return <span {...useRangeSliderContext().getLabelProps(index, props)} />;
}
export type RangeSliderHiddenInputProps = PartProps<'input'> & { index: number };
export function RangeSliderHiddenInput({ index, ...props }: RangeSliderHiddenInputProps) {
  return <input {...useRangeSliderContext().getHiddenInputProps(index, props)} />;
}
export type RangeSliderValueProps = { children: (api: RangeSliderApi) => ReactNode };
export function RangeSliderValue({ children }: RangeSliderValueProps) {
  return children(useRangeSliderContext());
}
export const RangeSlider = {
  Root: RangeSliderRoot,
  Control: RangeSliderControl,
  Track: RangeSliderTrack,
  Range: RangeSliderRange,
  Thumb: RangeSliderThumb,
  Label: RangeSliderLabel,
  HiddenInput: RangeSliderHiddenInput,
  Value: RangeSliderValue,
};
