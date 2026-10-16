'use client';
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { createToastStore } from './toast-store';
import type { ToastRecord, ToastStore, ToastStoreOptions } from './toast-store';
import { useToast, useToastViewport } from './use-toast';
import type { ToastApi, ToastViewportApi } from './use-toast';

const StoreContext = createContext<ToastStore | null>(null);
const ViewportContext = createContext<ToastViewportApi | null>(null);
const ItemContext = createContext<ToastApi | null>(null);
export function useToastContext() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('Toast parts must be rendered inside Toast.Provider.');
  return store;
}
function useItem() {
  const api = useContext(ItemContext);
  if (!api) throw new Error('Toast item parts must be rendered inside Toast.Root.');
  return api;
}
export interface ToastProviderProps {
  store?: ToastStore;
  options?: ToastStoreOptions;
  children?: ReactNode;
}
export function ToastProvider({ store, options, children }: ToastProviderProps) {
  const [owned] = useState(() => createToastStore(options));
  return <StoreContext value={store ?? owned}>{children}</StoreContext>;
}
export type ToastViewportProps = Omit<PartProps<'div'>, 'children'> & {
  children?: ReactNode | ((items: readonly ToastRecord[]) => ReactNode);
};
export function ToastViewport({ children, ...props }: ToastViewportProps) {
  const api = useToastViewport(useToastContext());
  return (
    <ViewportContext value={api}>
      <div {...api.getViewportProps(props)}>{typeof children === 'function' ? children(api.toasts) : children}</div>
    </ViewportContext>
  );
}
export type ToastAnnouncerProps = PartProps<'span'> & { priority: 'polite' | 'assertive' };
export function ToastAnnouncer({ priority, ...props }: ToastAnnouncerProps) {
  const api = useContext(ViewportContext);
  if (!api) throw new Error('Toast.Announcer must be rendered inside Toast.Viewport.');
  return <span {...api.getAnnouncerProps(priority, props)} />;
}
export type ToastRootProps = Omit<PartProps<'div'>, 'id'> & { id: string };
export function ToastRoot({ id, ...props }: ToastRootProps) {
  const api = useToast(useToastContext(), id);
  return api.mounted ? (
    <ItemContext value={api}>
      <div {...api.getRootProps(props)} />
    </ItemContext>
  ) : null;
}
export function ToastTitle(props: PartProps<'div'>) {
  return <div {...useItem().getTitleProps(props)} />;
}
export function ToastDescription(props: PartProps<'div'>) {
  return <div {...useItem().getDescriptionProps(props)} />;
}
export function ToastAction(props: PartProps<'button'>) {
  return <button {...useItem().getActionProps(props)} />;
}
export function ToastCloseTrigger(props: PartProps<'button'>) {
  return <button {...useItem().getCloseProps(props)} />;
}
export const Toast = {
  Provider: ToastProvider,
  Viewport: ToastViewport,
  Announcer: ToastAnnouncer,
  Root: ToastRoot,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  CloseTrigger: ToastCloseTrigger,
};
