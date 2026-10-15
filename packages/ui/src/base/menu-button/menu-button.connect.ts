import { mergeProps } from "../_shared/react/index";
import type { PartProps } from "../_shared/react/index";
import type { MenuApi } from "../menu-menubar/index";
import type { ButtonApi } from "../button/index";
import type { RefObject } from 'react';
export function connectMenuButton(
  menu: MenuApi,
  button: ButtonApi,
  options: {
    id: string;
    open: boolean;
    disabled?: boolean;
    trigger: RefObject<HTMLButtonElement | null>;
    setOpen: (open: boolean, edge?: 'first' | 'last') => void;
  },
) {
  return {
    ...menu,
    open: options.open,
    menu,
    setOpen: options.setOpen,
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, { 'data-scope': 'menu-button', 'data-part': 'root' });
    },
    getTriggerProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(button.getButtonProps(props), {
        ref: options.trigger,
        id: `${options.id}-trigger`,
        'aria-haspopup': 'menu',
        'aria-expanded': options.open,
        'aria-controls': `${options.id}-menu`,
        'data-scope': 'menu-button',
        'data-part': 'trigger',
        onKeyDown: (event) => {
          if (
            event.nativeEvent.isComposing ||
            event.keyCode === 229 ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            options.disabled ||
            props.disabled
          )
            return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            options.setOpen(true, event.key === 'ArrowDown' ? 'first' : 'last');
          }
        },
      });
    },
    getContentProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return menu.getRootProps(mergeProps<'div'>(props, { 'aria-labelledby': `${options.id}-trigger` }));
    },
  };
}
export type MenuButtonApi = ReturnType<typeof connectMenuButton>;
