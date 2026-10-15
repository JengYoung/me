'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useProgress } from "./use-progress";
import type { ProgressApi, ProgressOptions } from "./use-progress";
const Context = createContext<ProgressApi | null>(null);
function useProgressContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Progress parts must be rendered inside Progress.Root.');
  return api;
}
export type ProgressRootProps = Omit<PartProps<'div'>, keyof ProgressOptions> & ProgressOptions;
export function ProgressRoot({ value, min, max, valueText, label, description, id, ...props }: ProgressRootProps) {
  const api = useProgress({ value, min, max, valueText, label, description, id });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export type ProgressNativeProps = Omit<PartProps<'progress'>, keyof ProgressOptions> &
  Omit<ProgressOptions, 'label' | 'description'>;
export function ProgressNative({ value, min, max, valueText, id, ...props }: ProgressNativeProps) {
  return <progress {...useProgress({ value, min, max, valueText, id }).getNativeProps(props)} />;
}
export function ProgressLabel(props: PartProps<'span'>) {
  return <span {...useProgressContext().getLabelProps(props)} />;
}
export function ProgressDescription(props: PartProps<'span'>) {
  return <span {...useProgressContext().getDescriptionProps(props)} />;
}
export function ProgressTrack(props: PartProps<'div'>) {
  return <div {...useProgressContext().getTrackProps(props)} />;
}
export function ProgressIndicator(props: PartProps<'div'>) {
  return <div {...useProgressContext().getIndicatorProps(props)} />;
}
export function ProgressCircle(props: PartProps<'circle'>) {
  return <circle {...useProgressContext().getCircleProps(props)} />;
}
export const Progress = {
  Root: ProgressRoot,
  Native: ProgressNative,
  Label: ProgressLabel,
  Description: ProgressDescription,
  Track: ProgressTrack,
  Indicator: ProgressIndicator,
  Circle: ProgressCircle,
};
