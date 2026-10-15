import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RovingFocusApi } from "../_shared/keyboard/index";
import type { FocusEvent } from 'react';
import { accordionValue } from "./accordion.machine";
import type { AccordionOptions, AccordionSchema } from "./accordion.machine";

export function connectAccordion(
  service: MachineApi<AccordionSchema>,
  roving: RovingFocusApi,
  options: AccordionOptions & { id: string },
  panel: {
    focus(value: string, event: FocusEvent<HTMLDivElement>): void;
    blur(event: FocusEvent<HTMLDivElement>): void;
  },
) {
  const value = accordionValue(options, service.state.context);
  const item = (itemValue: string) => {
    const found = options.items.find((entry) => entry.value === itemValue);
    if (!found) throw new Error(`Unknown accordion item: ${itemValue}`);
    return found;
  };
  const triggerId = (key: string) => `${options.id}-trigger-${encodeURIComponent(key)}`;
  const contentId = (key: string) => `${options.id}-content-${encodeURIComponent(key)}`;
  return {
    value,
    toggle: (key: string) => service.send({ type: 'TOGGLE', value: key }),
    setValue: (next: readonly string[]) => service.send({ type: 'SET', value: next }),
    focus: roving.focus,
    getRootProps: (props: PartProps<'div'> = {}) =>
      roving.getRootProps(mergeProps<'div'>(props, { id: options.id, 'data-scope': 'accordion', 'data-part': 'root' })),
    getHeadingProps(itemValue: string, props: PartProps<'h3'> = {}): PartProps<'h3'> {
      item(itemValue);
      return mergeProps<'h3'>(props, {
        'data-scope': 'accordion',
        'data-part': 'heading',
        'data-state': value.includes(itemValue) ? 'open' : 'closed',
      });
    },
    getTriggerProps(itemValue: string, props: PartProps<'button'> = {}): PartProps<'button'> {
      const disabled = !!options.disabled || !!item(itemValue).disabled;
      const open = value.includes(itemValue);
      const locked = open && options.collapsible === false && value.length === 1;
      return mergeProps<'button'>(roving.getItemProps<'button'>(itemValue, props), {
        id: triggerId(itemValue),
        type: 'button',
        disabled,
        tabIndex: disabled ? -1 : 0,
        'aria-expanded': open,
        'aria-controls': contentId(itemValue),
        'aria-disabled': locked || disabled,
        'data-scope': 'accordion',
        'data-part': 'trigger',
        'data-state': open ? 'open' : 'closed',
        onClick: () => service.send({ type: 'TOGGLE', value: itemValue }),
      });
    },
    getContentProps(itemValue: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      item(itemValue);
      return mergeProps<'div'>(props, {
        id: contentId(itemValue),
        hidden: !value.includes(itemValue),
        'aria-labelledby': props.role === 'region' ? triggerId(itemValue) : undefined,
        'data-scope': 'accordion',
        'data-part': 'content',
        'data-state': value.includes(itemValue) ? 'open' : 'closed',
        onFocusCapture: (event) => panel.focus(itemValue, event),
        onBlurCapture: panel.blur,
      });
    },
  };
}
