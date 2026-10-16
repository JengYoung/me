export interface NumberRangeOptions {
  min?: number;
  max?: number;
  step?: number;
  pageStep?: number;
}

/** Numeric policy shared by range widgets; no DOM or framework state. */
export function numberRange(options: NumberRangeOptions = {}) {
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const step = options.step ?? 1;
  const pageStep = options.pageStep ?? step * 10;
  if (![min, max, step, pageStep, max - min].every(Number.isFinite) || min > max || step <= 0 || pageStep <= 0)
    throw new Error('Numeric ranges require finite min <= max and positive step/pageStep.');
  return { min, max, step, pageStep };
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Include both endpoints even when the last interval is shorter than step. */
export function snapNumber(value: number, options: NumberRangeOptions): number {
  const { min, max, step } = numberRange(options);
  if (!Number.isFinite(value)) return min;
  if (value <= min) return min;
  if (value >= max) return max;
  return clampNumber(Number((min + Math.round((value - min) / step) * step).toPrecision(15)), min, max);
}

export function numberPercent(value: number, min: number, max: number): number {
  return max === min ? 0 : ((clampNumber(value, min, max) - min) / (max - min)) * 100;
}

export function sliderKeyValue(
  key: string,
  value: number,
  options: NumberRangeOptions & { dir?: 'ltr' | 'rtl' },
): number | undefined {
  const { min, max, step, pageStep } = numberRange(options);
  switch (key) {
    case 'Home':
      return min;
    case 'End':
      return max;
    case 'PageUp':
      return value + pageStep;
    case 'PageDown':
      return value - pageStep;
    case 'ArrowUp':
      return value + step;
    case 'ArrowDown':
      return value - step;
    case 'ArrowRight':
      return value + (options.dir === 'rtl' ? -step : step);
    case 'ArrowLeft':
      return value + (options.dir === 'rtl' ? step : -step);
    default:
      return undefined;
  }
}
