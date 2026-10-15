import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RefObject } from 'react';
import { marqueeGeometry, marqueePlaying, marqueeRequested } from "./marquee.machine";
import type { MarqueeOptions, MarqueeSchema } from "./marquee.machine";

export type MarqueeCopyProps = Omit<PartProps<'div'>, 'children' | 'dangerouslySetInnerHTML'>;
export interface MarqueeBindings {
  refs: { viewport: RefObject<HTMLDivElement | null>; content: RefObject<HTMLDivElement | null> };
  viewportRef: (node: HTMLDivElement | null) => void;
  contentRef: (node: HTMLDivElement | null) => void;
  copyRef: (index: number) => (node: HTMLDivElement | null) => void;
  measure: () => void;
}
export function connectMarquee(
  service: MachineApi<MarqueeSchema>,
  options: MarqueeOptions & { id: string },
  dom: MarqueeBindings,
) {
  const context = service.state.context;
  const playing = marqueePlaying(options, context);
  const requestedPlaying = marqueeRequested(options, context);
  const geometry = marqueeGeometry(options, context);
  const setPlaying = (playing: boolean) => service.send({ type: 'REQUEST', playing });
  return {
    playing,
    requestedPlaying,
    reducedMotion: context.reduced,
    focused: context.focused,
    ...geometry,
    copies: Array.from({ length: geometry.copyCount }, (_, index) => index),
    refs: dom.refs,
    measure: dom.measure,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    setPlaying,
    getViewportProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        id: options.id,
        ref: dom.viewportRef,
        dir: options.dir,
        role: 'region',
        'data-scope': 'marquee',
        'data-part': 'viewport',
        'data-orientation': options.orientation ?? 'horizontal',
        'data-state': playing ? 'playing' : 'paused',
        'data-reduced-motion': context.reduced,
        'data-focused': context.focused,
        onPointerEnter: (event) => {
          if (event.pointerType !== 'touch') service.send({ type: 'HOVER', hovered: true });
        },
        onPointerLeave: (event) => {
          if (event.pointerType !== 'touch') service.send({ type: 'HOVER', hovered: false });
        },
        onFocusCapture: () => service.send({ type: 'FOCUS', focused: true }),
        onBlurCapture: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            service.send({ type: 'FOCUS', focused: false });
        },
      });
    },
    getTrackProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        'data-scope': 'marquee',
        'data-part': 'track',
        'data-state': playing ? 'playing' : 'paused',
        'data-orientation': options.orientation ?? 'horizontal',
      });
    },
    getContentProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, { ref: dom.contentRef, 'data-scope': 'marquee', 'data-part': 'content' });
    },
    getCopyProps(index: number, props: MarqueeCopyProps = {}): PartProps<'div'> {
      if (!Number.isInteger(index) || index < 0 || index >= geometry.copyCount)
        throw new Error(`Invalid Marquee copy index: ${index}`);
      const { children: _children, dangerouslySetInnerHTML: _html, ...user } = props as PartProps<'div'>;
      return mergeProps<'div'>(user, {
        ref: dom.copyRef(index),
        'aria-hidden': true,
        inert: true,
        'data-scope': 'marquee',
        'data-part': 'copy',
        'data-copy': index,
      });
    },
    getToggleProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      const { 'aria-pressed': _pressed, ...user } = props;
      return mergeProps<'button'>(user, {
        type: 'button',
        'aria-controls': options.id,
        disabled: context.reduced,
        'aria-label': props['aria-label'] ?? (requestedPlaying ? 'Pause animation' : 'Play animation'),
        'data-scope': 'marquee',
        'data-part': 'toggle',
        'data-requested-playing': requestedPlaying,
        onClick: () => setPlaying(!marqueeRequested(service.getProps(), service.getSnapshot().context)),
      });
    },
  };
}
export type MarqueeApi = ReturnType<typeof connectMarquee>;
