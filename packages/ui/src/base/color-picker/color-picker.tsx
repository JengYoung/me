'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useColorPicker } from "./use-color-picker";
import type { ColorPickerApi, ColorPickerOptions } from "./use-color-picker";
import type { ColorChannel, ColorValue } from "./color-value";
const Context = createContext<ColorPickerApi | null>(null);
function useColorContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Color Picker parts must be inside ColorPicker.Root.');
  return api;
}
export type ColorPickerRootProps = ColorPickerOptions & { children?: ReactNode };
export function ColorPickerRoot({ children, ...options }: ColorPickerRootProps) {
  const api = useColorPicker(options);
  return <Context value={api}>{children}</Context>;
}
export function ColorPickerGroup(props: PartProps<'div'>) {
  return <div {...useColorContext().getGroupProps(props)} />;
}
export function ColorPickerLabel(props: PartProps<'span'>) {
  return <span {...useColorContext().getLabelProps(props)} />;
}
export function ColorPickerDescription(props: PartProps<'span'>) {
  return <span {...useColorContext().getDescriptionProps(props)} />;
}
export function ColorPickerError(props: PartProps<'span'>) {
  return <span {...useColorContext().getErrorProps(props)} />;
}
export function ColorPickerArea(props: PartProps<'div'>) {
  return <div {...useColorContext().getAreaProps(props)} />;
}
export function ColorPickerAreaThumb(props: PartProps<'div'>) {
  return <div {...useColorContext().getAreaThumbProps(props)} />;
}
export type ColorPickerChannelProps = PartProps<'input'> & { channel: ColorChannel };
export function ColorPickerChannel({ channel, ...props }: ColorPickerChannelProps) {
  return <input {...useColorContext().getChannelProps(channel, props)} />;
}
export type ColorPickerChannelInputProps = PartProps<'input'> & { channel: ColorChannel };
export function ColorPickerChannelInput({ channel, ...props }: ColorPickerChannelInputProps) {
  return <input {...useColorContext().getChannelInputProps(channel, props)} />;
}
export function ColorPickerInput(props: PartProps<'input'>) {
  return <input {...useColorContext().getInputProps(props)} />;
}
export type ColorPickerSwatchProps = Omit<PartProps<'button'>, 'color'> & { color: string | ColorValue };
export function ColorPickerSwatch({ color, ...props }: ColorPickerSwatchProps) {
  return <button {...useColorContext().getSwatchProps(color, props)} />;
}
export function ColorPickerHiddenInput(props: PartProps<'input'>) {
  return <input {...useColorContext().getHiddenInputProps(props)} />;
}
export type ColorPickerValueProps = { children: (api: ColorPickerApi) => ReactNode };
export function ColorPickerValue({ children }: ColorPickerValueProps) {
  return children(useColorContext());
}
export const ColorPicker = {
  Root: ColorPickerRoot,
  Group: ColorPickerGroup,
  Label: ColorPickerLabel,
  Description: ColorPickerDescription,
  Error: ColorPickerError,
  Area: ColorPickerArea,
  AreaThumb: ColorPickerAreaThumb,
  Channel: ColorPickerChannel,
  ChannelInput: ColorPickerChannelInput,
  Input: ColorPickerInput,
  Swatch: ColorPickerSwatch,
  HiddenInput: ColorPickerHiddenInput,
  Value: ColorPickerValue,
};
