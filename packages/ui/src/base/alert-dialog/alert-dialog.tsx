'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { DialogPortal } from "../dialog/index";
import { ModalFocusProvider } from "../_shared/focus/index";
import { useAlertDialog } from "./use-alert-dialog";
import type { AlertDialogApi, AlertDialogOptions } from "./use-alert-dialog";

const Context = createContext<AlertDialogApi | null>(null);
function useAlertDialogContext() {
  const api = useContext(Context);
  if (!api) throw new Error('AlertDialog parts must be rendered inside AlertDialog.Root.');
  return api;
}
export type AlertDialogRootProps = AlertDialogOptions & { children?: ReactNode };
export function AlertDialogRoot({ children, ...options }: AlertDialogRootProps) {
  const api = useAlertDialog(options);
  return (
    <ModalFocusProvider scope={api.scope}>
      <Context value={api}>{children}</Context>
    </ModalFocusProvider>
  );
}
export function AlertDialogTrigger(props: PartProps<'button'>) {
  return <button {...useAlertDialogContext().getTriggerProps(props)} />;
}
export function AlertDialogContent(props: PartProps<'div'>) {
  return <div {...useAlertDialogContext().getContentProps(props)} />;
}
export function AlertDialogTitle(props: PartProps<'h2'>) {
  return <h2 {...useAlertDialogContext().getTitleProps(props)}>{props.children}</h2>;
}
export function AlertDialogDescription(props: PartProps<'p'>) {
  return <p {...useAlertDialogContext().getDescriptionProps(props)} />;
}
export function AlertDialogCancel(props: PartProps<'button'>) {
  return <button {...useAlertDialogContext().getCancelProps(props)} />;
}
export function AlertDialogAction(props: PartProps<'button'>) {
  return <button {...useAlertDialogContext().getActionProps(props)} />;
}
export function AlertDialogBackdrop(props: PartProps<'div'>) {
  return <div {...useAlertDialogContext().getBackdropProps(props)} />;
}
export const AlertDialogPortal = DialogPortal;
export const AlertDialog = {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Content: AlertDialogContent,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Cancel: AlertDialogCancel,
  Action: AlertDialogAction,
  Backdrop: AlertDialogBackdrop,
  Portal: AlertDialogPortal,
};
