import { mergeProps } from "../_shared/react/index";
import type { PropGetter } from "../_shared/react/index";
import type { ModalFocusApi } from "../_shared/focus/index";
import type { RefObject } from 'react';
import type { DialogChangeReason } from "./dialog.machine";

export interface DialogApi {
  readonly open: boolean;
  readonly scope: ModalFocusApi['scope'];
  setOpen(open: boolean, reason?: DialogChangeReason): void;
  getTriggerProps: PropGetter<'button'>;
  getContentProps: PropGetter<'div'>;
  getTitleProps: PropGetter<'h2'>;
  getDescriptionProps: PropGetter<'p'>;
  getCloseProps: PropGetter<'button'>;
  getBackdropProps: PropGetter<'div'>;
}

export function connectDialog(
  state: Pick<DialogApi, 'open' | 'setOpen'>,
  focus: ModalFocusApi,
  options: { id: string; describedBy?: string | null; trigger: RefObject<HTMLButtonElement | null> },
): DialogApi {
  const { id } = options;
  const attributes = (part: string) => ({
    'data-scope': 'dialog',
    'data-part': part,
    'data-state': state.open ? 'open' : 'closed',
  });
  return {
    ...state,
    scope: focus.scope,
    getTriggerProps(props = {}) {
      return mergeProps<'button'>(props, {
        ...attributes('trigger'),
        id: `${id}-trigger`,
        ref: options.trigger,
        type: props.type ?? 'button',
        'aria-haspopup': 'dialog',
        'aria-expanded': state.open,
        'aria-controls': `${id}-content`,
        onClick: () => {
          if (!props.disabled) state.setOpen(true, 'trigger');
        },
      });
    },
    getContentProps(props = {}) {
      return focus.getContentProps(
        mergeProps<'div'>(props, {
          ...attributes('content'),
          id: `${id}-content`,
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : `${id}-title`),
          'aria-describedby':
            options.describedBy === null
              ? undefined
              : (props['aria-describedby'] ?? options.describedBy ?? `${id}-description`),
          hidden: !state.open,
        }),
      );
    },
    getTitleProps: (props = {}) => mergeProps<'h2'>(props, { ...attributes('title'), id: `${id}-title` }),
    getDescriptionProps: (props = {}) =>
      mergeProps<'p'>(props, { ...attributes('description'), id: `${id}-description` }),
    getCloseProps(props = {}) {
      return mergeProps<'button'>(props, {
        ...attributes('close'),
        type: props.type ?? 'button',
        onClick: () => {
          if (!props.disabled) state.setOpen(false, 'close-button');
        },
      });
    },
    getBackdropProps: (props = {}) =>
      mergeProps<'div'>(props, {
        ...attributes('backdrop'),
        'aria-hidden': true,
        hidden: !state.open,
      }),
  };
}
