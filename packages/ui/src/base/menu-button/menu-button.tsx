'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from '../_shared/react/index';
import { Menu, MenuProvider } from '../menu-menubar/index';
import { useMenuButton } from './use-menu-button';
import type { MenuButtonApi, MenuButtonOptions } from './use-menu-button';
const Context = createContext<MenuButtonApi | null>(null);
export function useMenuButtonContext() {
  const api = useContext(Context);
  if (!api) throw new Error('MenuButton parts must be inside MenuButton.Root.');
  return api;
}
export type MenuButtonRootProps = Omit<PartProps<'div'>, keyof MenuButtonOptions | 'onSelect'> & MenuButtonOptions;
export function MenuButtonRoot({
  items,
  open,
  defaultOpen,
  onOpenChange,
  checkedValues,
  defaultCheckedValues,
  onCheckedValuesChange,
  onSelect,
  onClose,
  dir,
  loop,
  disabled,
  id,
  ...props
}: MenuButtonRootProps) {
  const api = useMenuButton({
    items,
    open,
    defaultOpen,
    onOpenChange,
    checkedValues,
    defaultCheckedValues,
    onCheckedValuesChange,
    onSelect,
    onClose,
    dir,
    loop,
    disabled,
    id,
  });
  return (
    <Context value={api}>
      <MenuProvider value={api.menu}>
        <div {...api.getRootProps(props)} />
      </MenuProvider>
    </Context>
  );
}
export function MenuButtonTrigger(props: PartProps<'button'>) {
  return <button {...useMenuButtonContext().getTriggerProps(props)} />;
}
export function MenuButtonContent(props: PartProps<'div'>) {
  return <div {...useMenuButtonContext().getContentProps(props)} />;
}
export const MenuButton = {
  Root: MenuButtonRoot,
  Trigger: MenuButtonTrigger,
  Content: MenuButtonContent,
  Item: Menu.Item,
  Submenu: Menu.Submenu,
  Group: Menu.Group,
  Separator: Menu.Separator,
};
