import { mergeProps } from "../_shared/react/index";
import type { PartProps } from "../_shared/react/index";

export interface MeterOptions {
  value: number;
  min?: number;
  max?: number;
  valueText?: string;
  id?: string;
}
export function connectMeter(options: MeterOptions & { id: string }) {
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  if (![min, max, options.value].every(Number.isFinite) || min >= max)
    throw new Error('Meter requires finite values and min < max.');
  const value = Math.min(max, Math.max(min, options.value));
  return {
    id: options.id,
    value,
    min,
    max,
    percent: ((value - min) / (max - min)) * 100,
    getRootProps(props: PartProps<'meter'> = {}): PartProps<'meter'> {
      const {
        'aria-valuetext': _text,
        'aria-valuenow': _now,
        'aria-valuemin': _min,
        'aria-valuemax': _max,
        ...user
      } = props;
      return mergeProps<'meter'>(user, {
        id: options.id,
        min,
        max,
        value,
        'aria-valuetext': options.valueText,
        'data-scope': 'meter',
        'data-part': 'root',
      });
    },
  };
}
export type MeterApi = ReturnType<typeof connectMeter>;
