export type ScrollAxis = 'horizontal' | 'vertical';
export type RtlScrollType = 'negative' | 'reverse' | 'default';
export interface ScrollAxisMetrics {
  viewport: number;
  content: number;
  track: number;
  position: number;
  max: number;
  overflow: boolean;
  thumbSize: number;
  /** Physical offset from the left/top of the track. */
  thumbOffset: number;
}
export const clampScroll = (value: number, max: number) => Math.max(0, Math.min(max, value));
export function logicalScrollLeft(raw: number, max: number, type: RtlScrollType) {
  return clampScroll(type === 'negative' ? -raw : type === 'default' ? max - raw : raw, max);
}
export function physicalScrollLeft(value: number, max: number, type: RtlScrollType) {
  const position = clampScroll(value, max);
  return type === 'negative' ? -position : type === 'default' ? max - position : position;
}
export function scrollAxisMetrics(
  viewport: number,
  content: number,
  track: number,
  position: number,
  minimum = 24,
  reversed = false,
): ScrollAxisMetrics {
  const max = Math.max(0, content - viewport);
  const thumbSize = Math.min(track, Math.max(minimum, content > 0 ? (track * viewport) / content : track));
  const value = clampScroll(position, max);
  const ratio = max > 0 ? value / max : 0;
  return {
    viewport,
    content,
    track,
    position: value,
    max,
    overflow: max > 0,
    thumbSize,
    thumbOffset: (track - thumbSize) * (reversed ? 1 - ratio : ratio),
  };
}
