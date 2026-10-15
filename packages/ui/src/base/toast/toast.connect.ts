import { mergeProps } from "../_shared/react/index";
import type { PartProps } from "../_shared/react/index";
import type { PresenceApi } from "../presence/index";
import type { ToastRecord, ToastStore } from "./toast-store";

export function connectToast(store: ToastStore, item: ToastRecord | undefined, id: string, presence: PresenceApi) {
  const active = item?.status === 'visible';
  return {
    toast: item,
    mounted: !!item && item.status !== 'queued' && presence.mounted,
    dismiss: () => {
      if (item) store.dismiss(item.id);
    },
    getRootProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(presence.getPresenceProps(user), {
        role: 'group',
        tabIndex: -1,
        'aria-labelledby': id + '-title',
        'aria-describedby': item?.description ? id + '-description' : undefined,
        inert: !active,
        'aria-hidden': !active,
        'data-scope': 'toast',
        'data-part': 'root',
        'data-state': item?.status ?? 'closing',
        'data-toast-id': item?.id,
      });
    },
    getTitleProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        id: id + '-title',
        'data-scope': 'toast',
        'data-part': 'title',
        children: user.children ?? item?.title,
      });
    },
    getDescriptionProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        id: id + '-description',
        'data-scope': 'toast',
        'data-part': 'description',
        children: user.children ?? item?.description,
      });
    },
    getCloseProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        type: 'button',
        disabled: !active || user.disabled,
        'data-scope': 'toast',
        'data-part': 'close',
        children: user.children ?? 'Dismiss notification',
        onClick: () => {
          if (active && item && !user.disabled) store.dismiss(item.id);
        },
      });
    },
    getActionProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        type: 'button',
        hidden: !item?.action,
        disabled: !active || user.disabled,
        'data-scope': 'toast',
        'data-part': 'action',
        children: user.children ?? item?.action?.label,
        onClick: () => {
          if (active && item && !user.disabled) store.action(item.id);
        },
      });
    },
  };
}
export type ToastApi = ReturnType<typeof connectToast>;
