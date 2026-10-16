import { mergeProps } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';
import type { CSSProperties } from 'react';

export interface ProgressOptions {
  value?: number | null;
  min?: number;
  max?: number;
  valueText?: string;
  label?: boolean;
  description?: boolean;
  id?: string;
}
export function connectProgress(options: ProgressOptions & { id: string }) {
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const span = max - min;
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(span) || span <= 0)
    throw new Error('Progress requires finite min < max and a finite range.');
  if (options.value != null && !Number.isFinite(options.value))
    throw new Error('Progress value must be finite or null.');
  const value = options.value == null ? null : Math.min(max, Math.max(min, options.value));
  const ratio = value === null ? null : (value - min) / span;
  const percent = ratio === null ? null : ratio * 100;
  const indeterminate = value === null;
  const complete = value === max;
  const state = indeterminate ? 'indeterminate' : complete ? 'complete' : 'loading';
  const ids = { root: options.id, label: `${options.id}-label`, description: `${options.id}-description` };
  const data = (part: string) => ({ 'data-scope': 'progress', 'data-part': part, 'data-state': state });
  const names = (user: { 'aria-label'?: string; 'aria-labelledby'?: string; 'aria-describedby'?: string }) => ({
    'aria-labelledby': user['aria-labelledby'] ?? (options.label && !user['aria-label'] ? ids.label : undefined),
    'aria-describedby':
      [...new Set([user['aria-describedby'], options.description ? ids.description : undefined].filter(Boolean))].join(
        ' ',
      ) || undefined,
  });
  return {
    ids,
    value,
    min,
    max,
    ratio,
    percent,
    indeterminate,
    complete,
    state,
    valueText: indeterminate ? undefined : options.valueText,
    getRootProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      const {
        'aria-valuenow': _now,
        'aria-valuemin': _min,
        'aria-valuemax': _max,
        'aria-valuetext': _text,
        ...props
      } = user;
      return mergeProps<'div'>(props, {
        ...data('root'),
        ...names(user),
        id: ids.root,
        role: 'progressbar',
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuenow': value ?? undefined,
        'aria-valuetext': indeterminate ? undefined : options.valueText,
      });
    },
    getNativeProps(user: PartProps<'progress'> = {}): PartProps<'progress'> {
      const {
        value: _value,
        max: _maximum,
        role: _role,
        'aria-valuenow': _now,
        'aria-valuemin': _min,
        'aria-valuemax': _max,
        'aria-valuetext': _text,
        ...props
      } = user;
      return mergeProps<'progress'>(props, {
        ...data('native'),
        ...names(user),
        id: ids.root,
        max: span,
        value: value === null ? undefined : value - min,
        'aria-valuetext': indeterminate ? undefined : options.valueText,
      });
    },
    getLabelProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, { ...data('label'), id: ids.label });
    },
    getDescriptionProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, { ...data('description'), id: ids.description });
    },
    getTrackProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, { ...data('track'), 'aria-hidden': true });
    },
    getIndicatorProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        ...data('indicator'),
        'aria-hidden': true,
        style: { '--iris-progress-percent': percent === null ? undefined : `${percent}%` } as CSSProperties,
      });
    },
    getCircleProps(user: PartProps<'circle'> = {}): PartProps<'circle'> {
      const { strokeDashoffset: _offset, ...props } = user;
      return mergeProps<'circle'>(props, {
        ...data('circle'),
        'aria-hidden': true,
        pathLength: 100,
        strokeDasharray: 100,
        strokeDashoffset: percent === null ? undefined : 100 - percent,
      });
    },
  };
}
export type ProgressApi = ReturnType<typeof connectProgress>;
