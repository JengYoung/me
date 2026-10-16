/** Gregorian civil values. No timestamps, host timezone, or locale-dependent parsing. */
export type DateGranularity = 'day' | 'minute' | 'second';
export type DateSegmentType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';
export type DateParts = Record<DateSegmentType, string>;
export interface DateValueOptions {
  granularity?: DateGranularity;
  locale?: string;
  min?: string;
  max?: string;
}
export const dateUnits = (granularity: DateGranularity = 'day'): DateSegmentType[] =>
  granularity === 'day'
    ? ['year', 'month', 'day']
    : granularity === 'minute'
      ? ['year', 'month', 'day', 'hour', 'minute']
      : ['year', 'month', 'day', 'hour', 'minute', 'second'];
export const emptyDateParts = (): DateParts => ({ year: '', month: '', day: '', hour: '', minute: '', second: '' });
export function daysInMonth(year: number, month: number) {
  return month === 2
    ? year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
      ? 29
      : 28
    : [4, 6, 9, 11].includes(month)
      ? 30
      : 31;
}
export function dateSegmentRange(type: DateSegmentType, parts: DateParts): [number, number] {
  if (type === 'year') return [1, 9999];
  if (type === 'month') return [1, 12];
  if (type === 'day') return [1, parts.month ? daysInMonth(Number(parts.year) || 2000, Number(parts.month)) : 31];
  return [0, type === 'hour' ? 23 : 59];
}
export function serializeDate(parts: DateParts, granularity: DateGranularity = 'day'): string | null {
  if (
    dateUnits(granularity).some((type) => {
      const [min, max] = dateSegmentRange(type, parts);
      return !/^\d+$/.test(parts[type]) || Number(parts[type]) < min || Number(parts[type]) > max;
    })
  )
    return null;
  const pad = (type: DateSegmentType) => String(Number(parts[type])).padStart(type === 'year' ? 4 : 2, '0');
  const date = `${pad('year')}-${pad('month')}-${pad('day')}`;
  return granularity === 'day'
    ? date
    : `${date}T${pad('hour')}:${pad('minute')}${granularity === 'second' ? `:${pad('second')}` : ''}`;
}
export function parseDate(value: string, granularity: DateGranularity = 'day'): DateParts | null {
  const expression =
    granularity === 'day'
      ? /^(\d{4})-(\d{2})-(\d{2})$/
      : granularity === 'minute'
        ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
        : /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;
  const match = expression.exec(value);
  if (!match) return null;
  const parts = emptyDateParts();
  dateUnits(granularity).forEach((type, index) => {
    parts[type] = match[index + 1]!;
  });
  return serializeDate(parts, granularity) === value ? parts : null;
}
export function validateDateOptions(options: DateValueOptions, values: (string | null | undefined)[] = []) {
  if (!['day', 'minute', 'second'].includes(options.granularity ?? 'day'))
    throw new Error('Unsupported date granularity.');
  for (const value of [options.min, options.max, ...values]) {
    if (value != null && !parseDate(value, options.granularity))
      throw new Error(`Invalid Gregorian civil date: ${value}`);
  }
  if (options.min && options.max && options.min > options.max) throw new Error('Date Input min must not exceed max.');
}
export function dateValidity(
  parts: DateParts,
  options: DateValueOptions,
): 'empty' | 'incomplete' | 'invalid' | 'valid' {
  const values = dateUnits(options.granularity).map((type) => parts[type]);
  if (values.every((text) => text === '')) return 'empty';
  if (values.some((text) => text === '')) return 'incomplete';
  const value = serializeDate(parts, options.granularity);
  return !value || (options.min && value < options.min) || (options.max && value > options.max) ? 'invalid' : 'valid';
}
export function dateLayout(options: DateValueOptions): { type: DateSegmentType | 'literal'; text: string }[] {
  const granularity = options.granularity ?? 'day';
  return new Intl.DateTimeFormat(options.locale ?? 'en-US', {
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone: 'UTC',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(granularity === 'day'
      ? {}
      : { hour: '2-digit', minute: '2-digit', ...(granularity === 'second' ? { second: '2-digit' } : {}) }),
  })
    .formatToParts(new Date('2000-11-22T13:45:56Z'))
    .filter((part) => part.type === 'literal' || dateUnits(granularity).includes(part.type as DateSegmentType))
    .map((part) => ({ type: part.type as DateSegmentType | 'literal', text: part.value }));
}
/** Accept native locale digits on keyboards while keeping one canonical ASCII representation. */
export function normalizeDateDigits(text: string, locale = 'en-US') {
  const format = new Intl.NumberFormat(locale, { useGrouping: false });
  let result = text;
  for (let digit = 0; digit <= 9; digit++) result = result.split(format.format(digit)).join(String(digit));
  return result.replace(/[\u200e\u200f\u061c]/g, '');
}
export function pasteDate(text: string, options: DateValueOptions): DateParts | null {
  const normalized = normalizeDateDigits(text.trim(), options.locale);
  const iso = parseDate(normalized, options.granularity);
  if (iso) return iso;
  const layout = dateLayout(options);
  const escape = (literal: string) => literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = layout
    .map((part) =>
      part.type === 'literal'
        ? escape(normalizeDateDigits(part.text, options.locale))
        : `(\\d{1,${part.type === 'year' ? 4 : 2}})`,
    )
    .join('');
  const match = new RegExp(`^${expression}$`).exec(normalized);
  if (!match) return null;
  const parts = emptyDateParts();
  layout
    .filter((part) => part.type !== 'literal')
    .forEach((part, index) => {
      parts[part.type as DateSegmentType] = match[index + 1]!;
    });
  return serializeDate(parts, options.granularity) ? parts : null;
}
