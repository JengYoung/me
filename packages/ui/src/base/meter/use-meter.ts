'use client';
import { useStableId } from "../_shared/react/index";
import { connectMeter } from "./meter.connect";
import type { MeterOptions } from "./meter.connect";
export function useMeter(options: MeterOptions) {
  return connectMeter({ ...options, id: useStableId('iris-meter', options.id) });
}
export type { MeterApi, MeterOptions } from "./meter.connect";
