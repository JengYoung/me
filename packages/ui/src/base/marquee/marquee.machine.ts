import { createMachine } from "../_shared/core/index";
import type { Direction } from "../_shared/core/index";

export interface MarqueeOptions {
  id?: string;
  dir?: Direction;
  orientation?: 'horizontal' | 'vertical';
  reverse?: boolean;
  speed?: number;
  gap?: number;
  autoFill?: boolean;
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
}
export interface MarqueeSchema {
  state: 'paused' | 'playing';
  props: MarqueeOptions;
  context: {
    requested: boolean;
    viewportSize: number;
    contentSize: number;
    ready: boolean;
    reduced: boolean;
    hidden: boolean;
    hovered: boolean;
    focused: boolean;
  };
  event:
    | { type: 'REQUEST'; playing: boolean }
    | { type: 'MEASURE'; viewportSize: number; contentSize: number }
    | { type: 'ENVIRONMENT'; reduced: boolean; hidden: boolean }
    | { type: 'HOVER'; hovered: boolean }
    | { type: 'FOCUS'; focused: boolean }
    | { type: 'EVALUATE' };
}
export function validateMarquee(options: MarqueeOptions) {
  if (options.speed !== undefined && (!Number.isFinite(options.speed) || options.speed <= 0))
    throw new Error('Marquee speed must be a positive finite number.');
  if (options.gap !== undefined && (!Number.isFinite(options.gap) || options.gap < 0))
    throw new Error('Marquee gap must be finite and non-negative.');
}
export const marqueeRequested = (props: MarqueeOptions, context: MarqueeSchema['context']) =>
  props.playing ?? context.requested;
export const marqueePlaying = (props: MarqueeOptions, context: MarqueeSchema['context']) =>
  marqueeRequested(props, context) &&
  context.ready &&
  context.contentSize > 0 &&
  context.viewportSize > 0 &&
  !context.reduced &&
  !context.hidden &&
  !((props.pauseOnHover ?? true) && context.hovered) &&
  !((props.pauseOnFocus ?? true) && context.focused);
export function marqueeGeometry(props: MarqueeOptions, context: MarqueeSchema['context']) {
  const distance = context.contentSize > 0 ? context.contentSize + (props.gap ?? 0) : 0;
  const copyCount =
    distance > 0 && context.viewportSize > 0
      ? props.autoFill === false
        ? 1
        : Math.min(100, Math.max(1, Math.ceil(context.viewportSize / distance)))
      : 0;
  const delta = distance * (props.orientation !== 'vertical' && props.dir === 'rtl' ? 1 : -1);
  return {
    distance,
    duration: (distance / (props.speed ?? 40)) * 1000,
    copyCount,
    from: props.reverse ? delta : 0,
    to: props.reverse ? 0 : delta,
  };
}
export const marqueeMachine = createMachine<MarqueeSchema>({
  initial: 'paused',
  context: ({ props }) => ({
    requested: props.playing === undefined ? (props.defaultPlaying ?? true) : false,
    viewportSize: 0,
    contentSize: 0,
    ready: false,
    reduced: true,
    hidden: false,
    hovered: false,
    focused: false,
  }),
  states: { paused: {}, playing: {} },
  onProps: { actions: [({ send }) => send({ type: 'EVALUATE' })] },
  on: {
    REQUEST: {
      guard: ({ props, context, event }) => event.playing !== marqueeRequested(props, context),
      assign: ({ props, context, event }) => ({
        requested: props.playing === undefined ? event.playing : context.requested,
      }),
      actions: [
        ({ props, event, send }) => {
          props.onPlayingChange?.(event.playing);
          send({ type: 'EVALUATE' });
        },
      ],
    },
    MEASURE: {
      assign: ({ event }) => ({ viewportSize: event.viewportSize, contentSize: event.contentSize }),
      actions: [({ send }) => send({ type: 'EVALUATE' })],
    },
    ENVIRONMENT: {
      assign: ({ event }) => ({ ready: true, reduced: event.reduced, hidden: event.hidden }),
      actions: [({ send }) => send({ type: 'EVALUATE' })],
    },
    HOVER: { assign: ({ event }) => ({ hovered: event.hovered }), actions: [({ send }) => send({ type: 'EVALUATE' })] },
    FOCUS: { assign: ({ event }) => ({ focused: event.focused }), actions: [({ send }) => send({ type: 'EVALUATE' })] },
    EVALUATE: [
      { guard: ({ props, context }) => marqueePlaying(props, context), target: 'playing' },
      { target: 'paused' },
    ],
  },
});
