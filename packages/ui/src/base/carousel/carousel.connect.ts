import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { RefObject } from 'react';
import { carouselValue } from './carousel.machine';
import type { CarouselOptions, CarouselSchema } from './carousel.machine';
export function connectCarousel(
  service: MachineApi<CarouselSchema>,
  options: CarouselOptions & { id: string },
  root: RefObject<HTMLDivElement | null>,
  focused: RefObject<{ element: HTMLElement; slide: HTMLElement } | null>,
  rotationIntent: RefObject<boolean | null>,
) {
  const value = carouselValue(options, service.state.context);
  const rotating = service.state.value === 'rotating';
  const rotationEnabled = service.state.value !== 'stopped';
  const index = options.slides.findIndex((slide) => slide.value === value);
  const next = () => service.send({ type: 'MOVE', direction: 'next' });
  const previous = () => service.send({ type: 'MOVE', direction: 'previous' });
  const stop = () => service.send({ type: 'STOP' });
  return {
    value,
    index,
    rotating,
    rotationEnabled,
    next,
    previous,
    stop,
    start: () => service.send({ type: 'START' }),
    setValue: (value: string) => service.send({ type: 'SELECT', value }),
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ref: root,
        tabIndex: -1,
        id: options.id,
        role: props.role === 'group' ? 'group' : 'region',
        'aria-roledescription': props['aria-roledescription'] ?? 'carousel',
        'data-scope': 'carousel',
        'data-part': 'root',
        'data-rotating': rotating,
        onFocusCapture: (event) => {
          const element = event.target as HTMLElement;
          if (element.closest('[data-scope="carousel"][data-part="root"]') !== event.currentTarget) return;
          const slide = element.closest<HTMLElement>('[data-part="slide"]');
          focused.current = slide ? { element, slide } : null;
          stop();
        },
        onBlurCapture: (event) => {
          if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) focused.current = null;
        },
        onPointerEnter: (event) => {
          if (event.pointerType !== 'touch') service.send({ type: 'HOVER', hovered: true });
        },
        onPointerLeave: (event) => {
          if (event.pointerType !== 'touch') service.send({ type: 'HOVER', hovered: false });
        },
      });
    },
    getViewportProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        id: `${options.id}-viewport`,
        'aria-live': rotating ? 'off' : 'polite',
        'aria-atomic': false,
        'data-scope': 'carousel',
        'data-part': 'viewport',
      });
    },
    getSlideProps(slideValue: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      const slideIndex = options.slides.findIndex((slide) => slide.value === slideValue);
      if (slideIndex < 0) throw new Error(`Unknown Carousel slide: ${slideValue}`);
      return mergeProps<'div'>(props, {
        id: `${options.id}-slide-${encodeURIComponent(slideValue)}`,
        role: 'group',
        'aria-roledescription': props['aria-roledescription'] ?? 'slide',
        'aria-label': props['aria-labelledby']
          ? undefined
          : (props['aria-label'] ??
            options.slides[slideIndex]!.label ??
            `${slideIndex + 1} of ${options.slides.length}`),
        hidden: slideValue !== value,
        'data-scope': 'carousel',
        'data-part': 'slide',
        'data-state': slideValue === value ? 'active' : 'inactive',
      });
    },
    getPreviousProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(props, {
        type: 'button',
        disabled: !!options.disabled || options.slides.length < 2 || (options.loop === false && index <= 0),
        'aria-label': props['aria-label'] ?? 'Previous slide',
        'aria-controls': `${options.id}-viewport`,
        'data-scope': 'carousel',
        'data-part': 'previous',
        onClick: previous,
      });
    },
    getNextProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(props, {
        type: 'button',
        disabled:
          !!options.disabled ||
          options.slides.length < 2 ||
          (options.loop === false && index >= options.slides.length - 1),
        'aria-label': props['aria-label'] ?? 'Next slide',
        'aria-controls': `${options.id}-viewport`,
        'data-scope': 'carousel',
        'data-part': 'next',
        onClick: next,
      });
    },
    getRotationProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      const { 'aria-pressed': _pressed, ...user } = props;
      return mergeProps<'button'>(user, {
        type: 'button',
        disabled: !!options.disabled || options.slides.length < 2 || service.state.context.reduced,
        'aria-label': props['aria-label'] ?? (rotationEnabled ? 'Stop slide rotation' : 'Start slide rotation'),
        'data-scope': 'carousel',
        'data-part': 'rotation',
        onPointerDown: (event) => {
          if (event.button !== 0) return;
          rotationIntent.current = service.getSnapshot().value === 'stopped';
          if (event.pointerType !== 'touch') event.preventDefault();
        },
        onPointerCancel: () => {
          rotationIntent.current = null;
        },
        onClick: (event) => {
          const start =
            event.detail > 0 && rotationIntent.current !== null
              ? rotationIntent.current
              : service.getSnapshot().value === 'stopped';
          rotationIntent.current = null;
          service.send({ type: start ? 'START' : 'STOP' });
        },
      });
    },
    getPickerGroupProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        role: 'group',
        'aria-label': props['aria-label'] ?? 'Choose slide',
        'data-scope': 'carousel',
        'data-part': 'picker-group',
      });
    },
    getPickerProps(slideValue: string, props: PartProps<'button'> = {}): PartProps<'button'> {
      const slide = options.slides.find((s) => s.value === slideValue);
      if (!slide) throw new Error(`Unknown Carousel slide: ${slideValue}`);
      return mergeProps<'button'>(props, {
        type: 'button',
        disabled: !!options.disabled,
        'aria-label': props['aria-label'] ?? slide.label ?? String(options.slides.indexOf(slide) + 1),
        'aria-controls': `${options.id}-slide-${encodeURIComponent(slideValue)}`,
        'aria-disabled': slideValue === value,
        'data-scope': 'carousel',
        'data-part': 'picker',
        onClick: () => {
          stop();
          service.send({ type: 'SELECT', value: slideValue });
        },
      });
    },
  };
}
export type CarouselApi = ReturnType<typeof connectCarousel>;
