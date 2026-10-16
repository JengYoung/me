import {
  createMachine,
  getNavigationTarget,
  recoverValue,
  sameCollection,
  validateCollection,
} from '../_shared/core/index';
export interface CarouselSlide {
  readonly value: string;
  readonly label?: string;
}
export interface CarouselOptions {
  slides: readonly CarouselSlide[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  defaultRotating?: boolean;
  onRotationChange?: (enabled: boolean) => void;
  interval?: number;
  loop?: boolean;
  disabled?: boolean;
  id?: string;
}
export interface CarouselSchema {
  state: 'stopped' | 'rotating' | 'paused';
  props: CarouselOptions;
  context: {
    value: string | null;
    slides: readonly CarouselSlide[];
    ready: boolean;
    hovered: boolean;
    hidden: boolean;
    reduced: boolean;
  };
  event:
    | { type: 'SELECT'; value: string | null }
    | { type: 'MOVE'; direction: 'next' | 'previous' }
    | { type: 'START' }
    | { type: 'STOP' }
    | { type: 'TICK' }
    | { type: 'EVALUATE' }
    | { type: 'HOVER'; hovered: boolean }
    | { type: 'ENVIRONMENT'; hidden: boolean; reduced: boolean };
}
export function validateCarousel(props: CarouselOptions) {
  validateCollection(props.slides);
  if (
    props.interval !== undefined &&
    (!Number.isFinite(props.interval) || props.interval < 1 || props.interval > 2_147_483_647)
  )
    throw new Error('Carousel interval must be between 1 and 2147483647 milliseconds.');
}
export function carouselValue(props: CarouselOptions, context: CarouselSchema['context']) {
  return recoverValue(props.slides, context.slides, props.value !== undefined ? props.value : context.value);
}
const canRotate = (props: CarouselOptions, context: CarouselSchema['context']) =>
  !props.disabled &&
  props.slides.length > 1 &&
  context.ready &&
  !context.reduced &&
  !context.hidden &&
  !context.hovered;
export const carouselMachine = createMachine<CarouselSchema>({
  initial: ({ props }) => (props.defaultRotating ? 'paused' : 'stopped'),
  context: ({ props }) => {
    validateCarousel(props);
    return {
      value: props.value === undefined ? recoverValue(props.slides, [], props.defaultValue ?? null) : null,
      slides: props.slides,
      ready: false,
      hovered: false,
      hidden: false,
      reduced: false,
    };
  },
  states: {
    stopped: {},
    paused: {},
    rotating: {
      effects: [
        ({ props, schedule }) => {
          schedule({ type: 'TICK' }, props.interval ?? 5000);
        },
      ],
    },
  },
  onProps: {
    assign: ({ props, context }) => ({
      value: props.value === undefined ? carouselValue(props, context) : context.value,
      slides: sameCollection(props.slides, context.slides) ? context.slides : props.slides,
    }),
    actions: [({ send }) => send({ type: 'EVALUATE' })],
  },
  on: {
    SELECT: {
      guard: ({ props, context, event }) =>
        !props.disabled &&
        props.slides.some((slide) => slide.value === event.value) &&
        event.value !== carouselValue(props, context),
      assign: ({ props, context, event }) => ({ value: props.value === undefined ? event.value : context.value }),
      actions: [({ props, event }) => props.onValueChange?.(event.value)],
    },
    MOVE: {
      guard: ({ props }) => !props.disabled,
      actions: [
        ({ props, context, event, send }) => {
          const next = getNavigationTarget(
            props.slides,
            carouselValue(props, context),
            event.direction,
            props.loop ?? true,
          );
          if (next !== null) send({ type: 'SELECT', value: next });
        },
      ],
    },
    START: {
      guard: ({ props, context, value }) =>
        !props.disabled && !context.reduced && props.slides.length > 1 && value === 'stopped',
      target: 'paused',
      actions: [
        ({ props, send }) => {
          props.onRotationChange?.(true);
          send({ type: 'EVALUATE' });
        },
      ],
    },
    STOP: {
      guard: ({ value }) => value !== 'stopped',
      target: 'stopped',
      actions: [({ props }) => props.onRotationChange?.(false)],
    },
    HOVER: { assign: ({ event }) => ({ hovered: event.hovered }), actions: [({ send }) => send({ type: 'EVALUATE' })] },
    ENVIRONMENT: {
      assign: ({ event }) => ({ ready: true, hidden: event.hidden, reduced: event.reduced }),
      actions: [({ send }) => send({ type: 'EVALUATE' })],
    },
    EVALUATE: [
      {
        guard: ({ props, context, value }) => value !== 'stopped' && (!!props.disabled || context.reduced),
        target: 'stopped',
        actions: [({ props }) => props.onRotationChange?.(false)],
      },
      { guard: ({ props, context, value }) => value !== 'stopped' && canRotate(props, context), target: 'rotating' },
      { guard: ({ value }) => value === 'rotating', target: 'paused' },
    ],
    TICK: [
      {
        guard: ({ props, context }) =>
          !props.loop && props.loop !== undefined && carouselValue(props, context) === props.slides.at(-1)?.value,
        target: 'stopped',
        actions: [({ props }) => props.onRotationChange?.(false)],
      },
      {
        guard: ({ props, context, value }) => value === 'rotating' && canRotate(props, context),
        target: 'rotating',
        reenter: true,
        actions: [({ send }) => send({ type: 'MOVE', direction: 'next' })],
      },
    ],
  },
});
