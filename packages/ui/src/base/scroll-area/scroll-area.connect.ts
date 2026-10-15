import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { RefObject } from 'react';
import type { ScrollAreaOptions, ScrollAreaSchema } from './scroll-area.machine';
import type { ScrollAxis } from './scroll-area.geometry';

export interface ScrollAreaRefs {
  viewport: RefObject<HTMLDivElement | null>;
  content: RefObject<HTMLDivElement | null>;
  horizontalScrollbar: RefObject<HTMLDivElement | null>;
  verticalScrollbar: RefObject<HTMLDivElement | null>;
  horizontalThumb: RefObject<HTMLDivElement | null>;
  verticalThumb: RefObject<HTMLDivElement | null>;
}
export interface ScrollAreaBindings {
  refs: ScrollAreaRefs;
  viewportRef: (element: HTMLDivElement | null) => void;
  contentRef: (element: HTMLDivElement | null) => void;
  horizontalRef: (element: HTMLDivElement | null) => void;
  verticalRef: (element: HTMLDivElement | null) => void;
  horizontalDrag: PartProps<'div'>;
  verticalDrag: PartProps<'div'>;
  measure: () => void;
  scrollTo: (axis: ScrollAxis, position: number) => void;
}
export function connectScrollArea(
  service: MachineApi<ScrollAreaSchema>,
  options: ScrollAreaOptions & { id: string; dir: 'ltr' | 'rtl' },
  dom: ScrollAreaBindings,
) {
  const { horizontal, vertical } = service.state.context;
  return {
    horizontal,
    vertical,
    refs: dom.refs,
    dragging: service.state.value === 'dragging',
    measure: dom.measure,
    scrollTo: dom.scrollTo,
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        dir: options.dir,
        'data-scope': 'scroll-area',
        'data-part': 'root',
        'data-dragging': service.state.value === 'dragging',
      });
    },
    getViewportProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ref: dom.viewportRef,
        id: options.id,
        dir: options.dir,
        role: 'region',
        tabIndex: 0,
        'data-scope': 'scroll-area',
        'data-part': 'viewport',
        onScroll: (event) => {
          if (event.target === event.currentTarget) dom.measure();
        },
      });
    },
    getContentProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, { ref: dom.contentRef, 'data-scope': 'scroll-area', 'data-part': 'content' });
    },
    getScrollbarProps(axis: ScrollAxis, props: PartProps<'div'> = {}): PartProps<'div'> {
      const metrics = axis === 'horizontal' ? horizontal : vertical;
      const drag = axis === 'horizontal' ? dom.horizontalDrag : dom.verticalDrag;
      return mergeProps<'div'>(
        props,
        mergeProps<'div'>(drag, {
          ref: axis === 'horizontal' ? dom.horizontalRef : dom.verticalRef,
          role: 'scrollbar',
          tabIndex: metrics.overflow ? 0 : -1,
          hidden: !metrics.overflow,
          'aria-label': props['aria-labelledby']
            ? undefined
            : (props['aria-label'] ?? (axis === 'horizontal' ? 'Horizontal scroll' : 'Vertical scroll')),
          'aria-controls': options.id,
          'aria-orientation': axis,
          'aria-valuemin': 0,
          'aria-valuemax': metrics.max,
          'aria-valuenow': metrics.position,
          'data-scope': 'scroll-area',
          'data-part': 'scrollbar',
          'data-orientation': axis,
          'data-overflow': metrics.overflow,
          onKeyDown: (event) => {
            if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
            const current = service.getSnapshot().context[axis];
            const { step = 40, dir = 'ltr' } = service.getProps();
            let next: number;
            switch (event.key) {
              case 'Home':
                next = 0;
                break;
              case 'End':
                next = current.max;
                break;
              case 'PageUp':
                next = current.position - current.viewport;
                break;
              case 'PageDown':
                next = current.position + current.viewport;
                break;
              case 'ArrowUp':
                if (axis !== 'vertical') return;
                next = current.position - step;
                break;
              case 'ArrowDown':
                if (axis !== 'vertical') return;
                next = current.position + step;
                break;
              case 'ArrowLeft':
                if (axis !== 'horizontal') return;
                next = current.position + (dir === 'rtl' ? step : -step);
                break;
              case 'ArrowRight':
                if (axis !== 'horizontal') return;
                next = current.position + (dir === 'rtl' ? -step : step);
                break;
              default:
                return;
            }
            event.preventDefault();
            dom.scrollTo(axis, next);
          },
        }),
      );
    },
    getThumbProps(axis: ScrollAxis, props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ref: axis === 'horizontal' ? dom.refs.horizontalThumb : dom.refs.verticalThumb,
        'aria-hidden': true,
        'data-scope': 'scroll-area',
        'data-part': 'thumb',
        'data-orientation': axis,
      });
    },
  };
}
export type ScrollAreaApi = ReturnType<typeof connectScrollArea>;
