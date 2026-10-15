import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RefObject } from 'react';
import { menuChecked, menuOpen } from "./menu.machine";
import type { MenuSchema, MenuStateOptions, MenuCloseReason } from "./menu.machine";
import { menuPath } from "./menu.model";

export function connectMenu(
  service: MachineApi<MenuSchema>,
  options: MenuStateOptions & { id: string },
  root: RefObject<HTMLDivElement | null>,
) {
  const open = menuOpen(options, service.state.context);
  const checkedValues = menuChecked(options, service.state.context);
  const activeValue = service.state.context.activeValue;
  const openPath = service.state.context.openPath;
  const bar = options.kind === 'menubar';
  const itemId = (value: string) => `${options.id}-item-${encodeURIComponent(value)}`;
  const submenuId = (value: string) => `${options.id}-submenu-${encodeURIComponent(value)}`;
  const focus = (value: string) => service.send({ type: 'FOCUS', value, focus: true });
  const close = (reason: MenuCloseReason = 'programmatic') => service.send({ type: 'CLOSE', reason });
  return {
    open,
    checkedValues,
    activeValue,
    openPath,
    focus,
    setOpen: (next: boolean) => service.send({ type: 'OPEN', open: next }),
    close,
    activate: (value: string) => service.send({ type: 'ACTIVATE', value }),
    openSubmenu: (value: string, last = false) => service.send({ type: 'OPEN_SUB', value, last }),
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ref: root,
        id: options.id,
        role: bar ? 'menubar' : 'menu',
        tabIndex: -1,
        hidden: !open,
        dir: options.dir,
        'aria-orientation': bar ? 'horizontal' : 'vertical',
        'aria-disabled': options.disabled || undefined,
        'data-scope': 'menu',
        'data-part': 'root',
        'data-state': open ? 'open' : 'closed',
        onFocus: (event) => {
          if (event.target === event.currentTarget && options.items[0]) focus(options.items[0].value);
        },
        onBlur: (event) => {
          if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close('outside');
        },
      });
    },
    getItemProps(value: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      const path = menuPath(options.items, value);
      const item = path.at(-1);
      if (!item) throw new Error(`Unknown menu item: ${value}`);
      const role = item.type === 'checkbox' ? 'menuitemcheckbox' : item.type === 'radio' ? 'menuitemradio' : 'menuitem';
      const rootActive = menuPath(options.items, activeValue)[0]?.value ?? options.items[0]?.value;
      return mergeProps<'div'>(props, {
        id: itemId(value),
        role,
        tabIndex: open && bar && path.length === 1 && rootActive === value ? 0 : -1,
        'aria-disabled': item.disabled || options.disabled || undefined,
        'aria-checked': item.type === 'checkbox' || item.type === 'radio' ? checkedValues.includes(value) : undefined,
        'aria-haspopup': item.children ? 'menu' : undefined,
        'aria-expanded': item.children ? open && openPath.includes(value) : undefined,
        'aria-controls': item.children ? submenuId(value) : undefined,
        'data-scope': 'menu',
        'data-part': 'item',
        'data-value': value,
        'data-active': activeValue === value || undefined,
        'data-state': checkedValues.includes(value) ? 'checked' : 'unchecked',
        onFocus: (event) => {
          if (event.target === event.currentTarget && service.getSnapshot().context.activeValue !== value)
            service.send({ type: 'FOCUS', value });
        },
        onPointerMove: (event) => {
          if (event.pointerType === 'touch' || !menuOpen(service.getProps(), service.getSnapshot().context)) return;
          if (service.getSnapshot().context.activeValue !== value) service.send({ type: 'FOCUS', value, focus: true });
        },
        onClick: () => service.send({ type: 'ACTIVATE', value }),
        onKeyDown: (event) => {
          if (event.target !== event.currentTarget || event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey) {
            close('tab');
            return;
          }
          if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          if (
            ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' ', 'Escape'].includes(
              event.key,
            )
          ) {
            event.preventDefault();
            event.stopPropagation();
            const dir =
              service.getProps().dir ??
              (event.currentTarget.ownerDocument.defaultView?.getComputedStyle(event.currentTarget).direction === 'rtl'
                ? 'rtl'
                : 'ltr');
            service.send({ type: 'KEY', key: event.key, dir });
          } else if ([...event.key].length === 1) {
            event.preventDefault();
            service.send({ type: 'TYPE', character: event.key });
          }
        },
      });
    },
    getSubmenuProps(value: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      const path = menuPath(options.items, value);
      if (!path.at(-1)?.children) throw new Error(`Item has no submenu: ${value}`);
      return mergeProps<'div'>(props, {
        id: submenuId(value),
        role: 'menu',
        tabIndex: -1,
        'aria-labelledby': itemId(value),
        hidden: !open || !path.every((item) => openPath.includes(item.value)),
        'data-scope': 'menu',
        'data-part': 'submenu',
        'data-state': open && openPath.includes(value) ? 'open' : 'closed',
      });
    },
    getGroupProps(label: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        role: 'group',
        'aria-label': label,
        'data-scope': 'menu',
        'data-part': 'group',
      });
    },
    getSeparatorProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        role: 'separator',
        'aria-orientation': props['aria-orientation'] ?? (bar ? 'vertical' : 'horizontal'),
        'data-scope': 'menu',
        'data-part': 'separator',
      });
    },
  };
}
export type MenuApi = ReturnType<typeof connectMenu>;
export type MenubarApi = MenuApi;
