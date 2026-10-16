import { createMachine } from '../_shared/core/index';
import type { Direction } from '../_shared/core/index';
import { scrollAxisMetrics } from './scroll-area.geometry';
import type { ScrollAxis, ScrollAxisMetrics } from './scroll-area.geometry';

export interface ScrollAreaOptions {
  id?: string;
  dir?: Direction;
  minThumbSize?: number;
  step?: number;
}
export interface ScrollAreaSchema {
  state: 'idle' | 'dragging';
  props: ScrollAreaOptions;
  context: { horizontal: ScrollAxisMetrics; vertical: ScrollAxisMetrics; axis: ScrollAxis | null };
  event:
    | { type: 'MEASURE'; horizontal: ScrollAxisMetrics; vertical: ScrollAxisMetrics }
    | { type: 'START'; axis: ScrollAxis }
    | { type: 'END' };
}
export function validateScrollArea(options: ScrollAreaOptions) {
  for (const value of [options.minThumbSize, options.step])
    if (value !== undefined && (!Number.isFinite(value) || value <= 0))
      throw new Error('Scroll Area sizes must be positive finite numbers.');
}
function sameMetrics(a: ScrollAxisMetrics, b: ScrollAxisMetrics) {
  return (Object.keys(a) as (keyof ScrollAxisMetrics)[]).every((key) => a[key] === b[key]);
}
export const scrollAreaMachine = createMachine<ScrollAreaSchema>({
  initial: 'idle',
  context: () => ({ horizontal: scrollAxisMetrics(0, 0, 0, 0), vertical: scrollAxisMetrics(0, 0, 0, 0), axis: null }),
  states: { idle: {}, dragging: {} },
  on: {
    MEASURE: {
      guard: ({ context, event }) =>
        !sameMetrics(context.horizontal, event.horizontal) || !sameMetrics(context.vertical, event.vertical),
      assign: ({ event }) => ({ horizontal: event.horizontal, vertical: event.vertical }),
    },
    START: { target: 'dragging', assign: ({ event }) => ({ axis: event.axis }) },
    END: { target: 'idle', assign: () => ({ axis: null }) },
  },
});
