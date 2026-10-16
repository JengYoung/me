/** sRGB color represented as HSV plus straight (unpremultiplied) alpha. */
export interface ColorValue {
  h: number;
  s: number;
  v: number;
  a: number;
}
export type ColorFormat = 'hex' | 'rgb' | 'hsl';
export type ColorChannel = 'hue' | 'saturation' | 'brightness' | 'alpha';
const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value));
const round = (value: number, places = 3) => Number(value.toFixed(places));
export function normalizeColor(color: ColorValue, enableAlpha = true): ColorValue {
  if (![color.h, color.s, color.v, color.a].every(Number.isFinite))
    throw new Error('Color channels must be finite numbers.');
  return {
    h: clamp(color.h, 360),
    s: clamp(color.s, 100),
    v: clamp(color.v, 100),
    a: enableAlpha ? clamp(color.a, 1) : 1,
  };
}
export const sameColor = (a: ColorValue, b: ColorValue) => a.h === b.h && a.s === b.s && a.v === b.v && a.a === b.a;
export function colorToRgb(color: ColorValue): { r: number; g: number; b: number; a: number } {
  const { h, s, v, a } = normalizeColor(color);
  const saturation = s / 100;
  const value = v / 100;
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return 255 * (value - value * saturation * Math.max(0, Math.min(k, 4 - k, 1)));
  };
  return { r: f(5), g: f(3), b: f(1), a };
}
export function colorFromRgb(r: number, g: number, b: number, a = 1): ColorValue {
  const red = clamp(r, 255) / 255;
  const green = clamp(g, 255) / 255;
  const blue = clamp(b, 255) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue =
    delta === 0
      ? 0
      : max === red
        ? (green - blue) / delta
        : max === green
          ? (blue - red) / delta + 2
          : (red - green) / delta + 4;
  hue = (((hue * 60) % 360) + 360) % 360;
  return normalizeColor({ h: hue, s: max === 0 ? 0 : (delta / max) * 100, v: max * 100, a });
}
export function colorToHsl(color: ColorValue) {
  const { h, s, v, a } = normalizeColor(color);
  const light = (v / 100) * (1 - s / 200);
  return {
    h,
    s: light === 0 || light === 1 ? 0 : ((v / 100 - light) / Math.min(light, 1 - light)) * 100,
    l: light * 100,
    a,
  };
}
export function colorFromHsl(h: number, s: number, l: number, a = 1): ColorValue {
  const light = clamp(l, 100) / 100;
  const saturation = clamp(s, 100) / 100;
  const value = light + saturation * Math.min(light, 1 - light);
  return normalizeColor({
    h: ((h % 360) + 360) % 360,
    s: value === 0 ? 0 : 200 * (1 - light / value),
    v: value * 100,
    a,
  });
}
/** Strict supported CSS subset: hex, rgb[a], hsl[a], or transparent. */
export function parseColor(text: string): ColorValue | null {
  const input = text.trim().toLowerCase();
  if (input === 'transparent') return { h: 0, s: 0, v: 0, a: 0 };
  const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.exec(input);
  if (hex) {
    const digits = hex[1]!.length <= 4 ? [...hex[1]!].map((digit) => digit + digit).join('') : hex[1]!;
    return colorFromRgb(
      parseInt(digits.slice(0, 2), 16),
      parseInt(digits.slice(2, 4), 16),
      parseInt(digits.slice(4, 6), 16),
      digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1,
    );
  }
  const fn = /^(rgba?|hsla?)\(([^()]*)\)$/.exec(input);
  if (!fn) return null;
  const comma = fn[2]!.includes(',');
  if (comma && fn[2]!.includes('/')) return null;
  const values = comma ? fn[2]!.split(',').map((part) => part.trim()) : fn[2]!.trim().split(/\s*\/\s*/);
  const channels = comma ? values.slice(0, 3) : values[0]!.split(/\s+/);
  const alpha = comma ? values[3] : values[1];
  if (channels.length !== 3 || (comma ? values.length < 3 || values.length > 4 : values.length > 2)) return null;
  const number = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/;
  const channel = (value: string, scale: number): number | null => {
    const raw = value.endsWith('%') ? value.slice(0, -1) : value;
    if (!number.test(raw) || !Number.isFinite(Number(raw))) return null;
    return clamp(Number(raw) * (value.endsWith('%') ? scale / 100 : 1), scale);
  };
  const opacity = alpha === undefined ? 1 : channel(alpha, 1);
  if (opacity === null) return null;
  if (fn[1]!.startsWith('rgb')) {
    if (comma && channels.some((value) => value.endsWith('%')) && !channels.every((value) => value.endsWith('%')))
      return null;
    const rgb = channels.map((value) => channel(value, 255));
    return rgb.some((value) => value === null) ? null : colorFromRgb(rgb[0]!, rgb[1]!, rgb[2]!, opacity);
  }
  const hue = channels[0]!.replace(/deg$/, '');
  if (!number.test(hue) || !Number.isFinite(Number(hue)) || !channels[1]!.endsWith('%') || !channels[2]!.endsWith('%'))
    return null;
  const saturation = channel(channels[1]!, 100);
  const light = channel(channels[2]!, 100);
  return saturation === null || light === null ? null : colorFromHsl(Number(hue), saturation, light, opacity);
}
export function formatColor(color: ColorValue, format: ColorFormat = 'hex'): string {
  const rgb = colorToRgb(color);
  if (format === 'hex') {
    const byte = (value: number) => Math.round(value).toString(16).padStart(2, '0');
    return `#${byte(rgb.r)}${byte(rgb.g)}${byte(rgb.b)}${rgb.a < 1 ? byte(rgb.a * 255) : ''}`;
  }
  const alpha = rgb.a < 1 ? ` / ${round(rgb.a, 5)}` : '';
  if (format === 'rgb') return `rgb(${round(rgb.r)} ${round(rgb.g)} ${round(rgb.b)}${alpha})`;
  const hsl = colorToHsl(color);
  return `hsl(${round(hsl.h)} ${round(hsl.s)}% ${round(hsl.l)}%${alpha})`;
}
export const colorChannelKey = { hue: 'h', saturation: 's', brightness: 'v', alpha: 'a' } as const;
export function colorChannelRange(channel: ColorChannel) {
  return { min: 0, max: channel === 'hue' ? 360 : channel === 'alpha' ? 1 : 100, step: channel === 'alpha' ? 0.01 : 1 };
}
