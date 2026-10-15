import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RefObject } from 'react';
import { tooltipOpen } from "./tooltip.machine";
import type { TooltipOptions, TooltipSchema } from "./tooltip.machine";
export function connectTooltip(
  service: MachineApi<TooltipSchema>,
  options: TooltipOptions & { id: string },
  trigger: RefObject<HTMLButtonElement | null>,
) {
  const open = tooltipOpen(options, service.state.value);
  const dismiss = () => service.send({ type: 'DISMISS' });
  return {
    open,
    state: service.state.value,
    dismiss,
    setOpen: (next: boolean) => service.send({ type: 'SET_OPEN', open: next }),
    getTriggerProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      const describedBy =
        [...new Set(`${props['aria-describedby'] ?? ''} ${open ? options.id : ''}`.split(/\s+/).filter(Boolean))].join(
          ' ',
        ) || undefined;
      return mergeProps<'button'>(props, {
        ref: trigger,
        type: props.type ?? 'button',
        'aria-describedby': describedBy,
        'data-scope': 'tooltip',
        'data-part': 'trigger',
        'data-state': open ? 'open' : 'closed',
        onPointerEnter: (event) => {
          if (event.pointerType !== 'touch') service.send({ type: 'HOVER', part: 'trigger', hovered: true });
        },
        onPointerLeave: (event) => {
          if (event.pointerType !== 'touch') service.send({ type: 'HOVER', part: 'trigger', hovered: false });
        },
        onFocus: () => service.send({ type: 'FOCUS', focused: true }),
        onBlur: () => service.send({ type: 'FOCUS', focused: false }),
        onClick: dismiss,
        onKeyDown: (event) => {
          if (
            event.key === 'Escape' &&
            !event.nativeEvent.isComposing &&
            tooltipOpen(service.getProps(), service.getSnapshot().value)
          ) {
            event.preventDefault();
            event.stopPropagation();
            dismiss();
          }
        },
      });
    },
    getContentProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        id: options.id,
        role: 'tooltip',
        hidden: !open,
        'data-scope': 'tooltip',
        'data-part': 'content',
        'data-state': open ? 'open' : 'closed',
        onPointerEnter: (event) => {
          if (event.pointerType !== 'touch') service.send({ type: 'HOVER', part: 'content', hovered: true });
        },
        onPointerLeave: (event) => {
          if (event.pointerType !== 'touch') service.send({ type: 'HOVER', part: 'content', hovered: false });
        },
      });
    },
  };
}
export type TooltipApi = ReturnType<typeof connectTooltip>;
