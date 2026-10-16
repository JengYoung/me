'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { PartProps } from '../_shared/react/index';
import { ModalFocusProvider } from '../_shared/focus/index';
import { useDialog } from './use-dialog';
import type { DialogApi, DialogOptions } from './use-dialog';

const Context = createContext<DialogApi | null>(null);
function useDialogContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Dialog parts must be rendered inside Dialog.Root.');
  return api;
}

export type DialogRootProps = DialogOptions & { children?: ReactNode };
export function DialogRoot({ children, ...options }: DialogRootProps) {
  const api = useDialog(options);
  return (
    <ModalFocusProvider scope={api.scope}>
      <Context value={api}>{children}</Context>
    </ModalFocusProvider>
  );
}
export function DialogTrigger(props: PartProps<'button'>) {
  return <button {...useDialogContext().getTriggerProps(props)} />;
}
export function DialogContent(props: PartProps<'div'>) {
  return <div {...useDialogContext().getContentProps(props)} />;
}
export function DialogTitle(props: PartProps<'h2'>) {
  return <h2 {...useDialogContext().getTitleProps(props)}>{props.children}</h2>;
}
export function DialogDescription(props: PartProps<'p'>) {
  return <p {...useDialogContext().getDescriptionProps(props)} />;
}
export function DialogClose(props: PartProps<'button'>) {
  return <button {...useDialogContext().getCloseProps(props)} />;
}
export function DialogBackdrop(props: PartProps<'div'>) {
  return <div {...useDialogContext().getBackdropProps(props)} />;
}

const subscribe = () => () => {};
const client = () => true;
const server = () => false;
export interface DialogPortalProps {
  children?: ReactNode;
  /** Defaults to document.body. null waits for a consumer-owned host. */
  container?: HTMLElement | null;
}
/** Empty server/first hydration output; portal children mount after hydration. Inline Content supports SSR. */
export function DialogPortal({ children, container }: DialogPortalProps) {
  const mounted = useSyncExternalStore(subscribe, client, server);
  if (!mounted) return null;
  const target = container === undefined ? document.body : container;
  return target ? createPortal(children, target) : null;
}

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Backdrop: DialogBackdrop,
  Portal: DialogPortal,
};
