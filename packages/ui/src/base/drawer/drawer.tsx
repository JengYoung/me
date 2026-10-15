'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { ModalFocusProvider } from '../_shared/focus/index';
import { DialogPortal } from '../dialog/index';
import { useDrawer } from './use-drawer';
import type { DrawerOptions, DrawerApi } from './use-drawer';
const Context = createContext<DrawerApi | null>(null);
function useDrawerContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Drawer parts must be inside Drawer.Root.');
  return api;
}
export type DrawerRootProps = DrawerOptions & { children?: ReactNode };
export function DrawerRoot({ children, ...options }: DrawerRootProps) {
  const api = useDrawer(options);
  return (
    <ModalFocusProvider scope={api.scope}>
      <Context value={api}>{children}</Context>
    </ModalFocusProvider>
  );
}
export function DrawerTrigger(props: PartProps<'button'>) {
  return <button {...useDrawerContext().getTriggerProps(props)} />;
}
export function DrawerContent(props: PartProps<'div'>) {
  return <div {...useDrawerContext().getContentProps(props)} />;
}
export function DrawerTitle(props: PartProps<'h2'>) {
  return <h2 {...useDrawerContext().getTitleProps(props)}>{props.children}</h2>;
}
export function DrawerDescription(props: PartProps<'p'>) {
  return <p {...useDrawerContext().getDescriptionProps(props)} />;
}
export function DrawerClose(props: PartProps<'button'>) {
  return <button {...useDrawerContext().getCloseProps(props)} />;
}
export function DrawerBackdrop(props: PartProps<'div'>) {
  return <div {...useDrawerContext().getBackdropProps(props)} />;
}
export function DrawerHandle(props: PartProps<'div'>) {
  return <div {...useDrawerContext().getHandleProps(props)} />;
}
export const DrawerPortal = DialogPortal;
export const Drawer = {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Content: DrawerContent,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
  Backdrop: DrawerBackdrop,
  Handle: DrawerHandle,
  Portal: DrawerPortal,
};
