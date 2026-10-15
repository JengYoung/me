import { mergeProps } from "../_shared/react/index";
import type { BooleanStateApi, PartProps } from "../_shared/react/index";
import type { ModalFocusApi } from "../_shared/focus/index";
import type { usePosition } from "../_shared/positioning/index";
import type { PopoverOptions } from "./use-popover";

export function connectPopover(
  state: BooleanStateApi,
  focus: ModalFocusApi,
  position: ReturnType<typeof usePosition>,
  options: PopoverOptions & { id: string; dir: 'ltr' | 'rtl' },
  refs: {
    setTrigger: (node: HTMLButtonElement | null) => void;
    setAnchor: (node: HTMLDivElement | null) => void;
    setContent: (node: HTMLDivElement | null) => void;
  },
) {
  const attributes = (part: string) => ({
    'data-scope': 'popover',
    'data-part': part,
    'data-state': state.value ? 'open' : 'closed',
  });
  return {
    open: state.value,
    setOpen: state.setValue,
    toggle: () => state.setValue((open) => !open),
    scope: focus.scope,
    placement: position.placement,
    updatePosition: position.update,
    getTriggerProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(props, {
        ...attributes('trigger'),
        ref: refs.setTrigger,
        id: `${options.id}-trigger`,
        type: props.type ?? 'button',
        'aria-haspopup': 'dialog',
        'aria-expanded': state.value,
        'aria-controls': `${options.id}-content`,
        onClick: () => {
          if (!props.disabled) state.setValue((open) => !open);
        },
      });
    },
    getAnchorProps: (props: PartProps<'div'> = {}) =>
      mergeProps<'div'>(props, { ...attributes('anchor'), ref: refs.setAnchor }),
    getContentProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return focus.getContentProps(
        mergeProps<'div'>(props, {
          ...attributes('content'),
          ref: refs.setContent,
          id: `${options.id}-content`,
          role: 'dialog',
          'aria-modal': options.modal || undefined,
          'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : `${options.id}-title`),
          'aria-describedby':
            options.describedBy === null ? undefined : (options.describedBy ?? props['aria-describedby']),
          hidden: !state.value,
          dir: options.dir,
          'data-placement': position.placement,
          style: position.style,
        }),
      );
    },
    getTitleProps: (props: PartProps<'h2'> = {}) =>
      mergeProps<'h2'>(props, { ...attributes('title'), id: `${options.id}-title` }),
    getDescriptionProps: (props: PartProps<'p'> = {}) =>
      mergeProps<'p'>(props, { ...attributes('description'), id: `${options.id}-description` }),
    getCloseProps: (props: PartProps<'button'> = {}) =>
      mergeProps<'button'>(props, {
        ...attributes('close'),
        type: props.type ?? 'button',
        onClick: () => {
          if (!props.disabled) state.setValue(false);
        },
      }),
    getBackdropProps: (props: PartProps<'div'> = {}) =>
      mergeProps<'div'>(props, {
        ...attributes('backdrop'),
        hidden: !state.value || !options.modal,
        'aria-hidden': true,
      }),
  };
}
export type PopoverApi = ReturnType<typeof connectPopover>;
