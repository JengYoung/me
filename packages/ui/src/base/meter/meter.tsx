'use client';
import type { PartProps } from "../_shared/react/index";
import { useMeter } from "./use-meter";
import type { MeterOptions } from "./use-meter";
export type MeterProps = Omit<PartProps<'meter'>, 'value' | 'min' | 'max'> & MeterOptions;
export function Meter({ value, min, max, valueText, id, ...props }: MeterProps) {
  return <meter {...useMeter({ value, min, max, valueText, id }).getRootProps(props)} />;
}
