import { mergeProps } from '../_shared/react/index';
import type { PropGetter } from '../_shared/react/index';
import type { DialogApi } from '../dialog/index';
import type { RefObject } from 'react';

export interface AlertDialogApi extends Omit<DialogApi, 'getCloseProps'> {
  getCancelProps: PropGetter<'button'>;
  getActionProps: PropGetter<'button'>;
}

/** Specialize the shared Dialog machine/bindings; confirming is an explicit, cancellable action. */
export function connectAlertDialog(dialog: DialogApi, cancel: RefObject<HTMLButtonElement | null>): AlertDialogApi {
  const { getCloseProps: _close, ...api } = dialog;
  const scope = { 'data-scope': 'alert-dialog' };
  return {
    ...api,
    getTriggerProps: (props) => ({ ...api.getTriggerProps(props), ...scope }),
    getContentProps: (props) => ({ ...api.getContentProps(props), ...scope, role: 'alertdialog' }),
    getTitleProps: (props) => ({ ...api.getTitleProps(props), ...scope }),
    getDescriptionProps: (props) => ({ ...api.getDescriptionProps(props), ...scope }),
    getBackdropProps: (props) => ({ ...api.getBackdropProps(props), ...scope }),
    getCancelProps(props = {}) {
      return mergeProps<'button'>(props, {
        ...scope,
        'data-part': 'cancel',
        ref: cancel,
        type: props.type ?? 'button',
        onClick: () => {
          if (!props.disabled) api.setOpen(false, 'cancel');
        },
      });
    },
    getActionProps(props = {}) {
      return mergeProps<'button'>(props, {
        ...scope,
        'data-part': 'action',
        type: props.type ?? 'button',
        onClick: () => {
          if (!props.disabled) api.setOpen(false, 'confirm');
        },
      });
    },
  };
}
