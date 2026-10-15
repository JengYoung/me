'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useMenu } from "./use-menu";
import type { MenuApi, MenuOptions, MenubarOptions } from "./use-menu";
const Context = createContext<MenuApi | null>(null);
/** Share an existing hook owner with thin Menu parts, including MenuButton. */
export const MenuProvider = Context.Provider;
export function useMenuContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Menu parts must be inside Menu.Root, Menubar.Root or MenuProvider.');
  return api;
}
export type MenuRootProps = Omit<PartProps<'div'>, keyof MenuOptions | 'onSelect'> & MenuOptions;
export function MenuRoot({
  items,
  kind,
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
  returnFocus,
  ...props
}: MenuRootProps) {
  const api = useMenu({
    items,
    kind,
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
    returnFocus,
  });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export type MenubarRootProps = Omit<PartProps<'div'>, keyof MenubarOptions | 'onSelect'> & MenubarOptions;
export function MenubarRoot(props: MenubarRootProps) {
  return <MenuRoot {...props} kind="menubar" />;
}
export function MenuItemPart({ value, ...props }: PartProps<'div'> & { value: string }) {
  return <div {...useMenuContext().getItemProps(value, props)} />;
}
export function MenuSubmenu({ value, ...props }: PartProps<'div'> & { value: string }) {
  return <div {...useMenuContext().getSubmenuProps(value, props)} />;
}
export function MenuGroup({ label, ...props }: PartProps<'div'> & { label: string }) {
  return <div {...useMenuContext().getGroupProps(label, props)} />;
}
export function MenuSeparator(props: PartProps<'div'>) {
  return <div {...useMenuContext().getSeparatorProps(props)} />;
}
export const Menu = {
  Root: MenuRoot,
  Item: MenuItemPart,
  Submenu: MenuSubmenu,
  Group: MenuGroup,
  Separator: MenuSeparator,
};
export const Menubar = { ...Menu, Root: MenubarRoot };
