import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps, usePointerDrag } from '../_shared/react/index';
import { splitterCollapsed, splitterRange, splitterSize } from './splitter.machine';
import type { SplitterOptions, SplitterSchema } from './splitter.machine';

export function connectSplitter(
  service: MachineApi<SplitterSchema>,
  options: SplitterOptions & { id: string },
  drag: ReturnType<typeof usePointerDrag>,
) {
  const size = splitterSize(options, service.state.context);
  const collapsed = splitterCollapsed(options, size);
  const range = splitterRange(options);
  const data = {
    'data-scope': 'splitter',
    'data-state': collapsed ? 'collapsed' : 'expanded',
    'data-orientation': options.orientation ?? 'vertical',
    'data-disabled': options.disabled || undefined,
    'data-dragging': service.state.value === 'dragging' || undefined,
  } as const;
  return {
    size,
    collapsed,
    dragging: service.state.value === 'dragging',
    setSize: (next: number) => service.send({ type: 'SET', size: next }),
    toggle: () => service.send({ type: 'TOGGLE' }),
    getRootProps: (props: PartProps<'div'> = {}): PartProps<'div'> =>
      mergeProps<'div'>(props, { ...data, 'data-part': 'root', id: options.id, dir: options.dir, ...drag }),
    getLabelProps: (props: PartProps<'span'> = {}): PartProps<'span'> =>
      mergeProps<'span'>(props, { ...data, 'data-part': 'label', id: `${options.id}-label` }),
    getPaneProps(pane: 'primary' | 'secondary', props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ...data,
        'data-part': 'pane',
        'data-pane': pane,
        id: `${options.id}-${pane}`,
        hidden: pane === 'primary' && collapsed && range.collapsedSize === 0,
        inert: pane === 'primary' && collapsed,
      });
    },
    getSeparatorProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ...data,
        'data-part': 'separator',
        id: `${options.id}-separator`,
        role: 'separator',
        tabIndex: options.disabled ? -1 : 0,
        'aria-orientation': options.orientation ?? 'vertical',
        'aria-valuemin': options.collapsible === false ? range.min : range.collapsedSize,
        'aria-valuemax': range.max,
        'aria-valuenow': size,
        'aria-valuetext': options.getValueText?.(size),
        'aria-controls': `${options.id}-primary`,
        'aria-disabled': options.disabled || undefined,
        'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : `${options.id}-label`),
        onKeyDown(event) {
          if (
            event.target !== event.currentTarget ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.nativeEvent.isComposing
          )
            return;
          const current = service.getProps();
          if (current.disabled) return;
          if (event.key === 'Enter' && current.collapsible !== false) {
            event.preventDefault();
            service.send({ type: 'TOGGLE' });
            return;
          }
          if (current.fixed) return;
          const limits = splitterRange(current);
          const value = splitterSize(current, service.getSnapshot().context);
          const horizontal = current.orientation === 'horizontal';
          let next: number | undefined;
          if (event.key === 'Home') next = current.collapsible === false ? limits.min : limits.collapsedSize;
          else if (event.key === 'End') next = limits.max;
          else if (horizontal && event.key === 'ArrowUp') next = value - limits.step;
          else if (horizontal && event.key === 'ArrowDown') next = value + limits.step;
          else if (!horizontal && event.key === 'ArrowLeft')
            next = value + (current.dir === 'rtl' ? limits.step : -limits.step);
          else if (!horizontal && event.key === 'ArrowRight')
            next = value + (current.dir === 'rtl' ? -limits.step : limits.step);
          if (next === undefined) return;
          event.preventDefault();
          service.send({ type: 'SET', size: next });
        },
      });
    },
  };
}
export type SplitterApi = ReturnType<typeof connectSplitter>;
