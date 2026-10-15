'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { ModalFocusProvider } from "../_shared/focus/index";
import { DialogPortal } from "../dialog/index";
import { usePopover } from "./use-popover";
import type { PopoverApi, PopoverOptions } from "./use-popover";
const Context = createContext<PopoverApi | null>(null);
function usePopoverContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Popover parts must be inside Popover.Root.');
  return api;
}
export type PopoverRootProps = PopoverOptions & { children?: ReactNode };
export function PopoverRoot({ children, ...options }: PopoverRootProps) {
  const api = usePopover(options);
  return (
    <ModalFocusProvider scope={api.scope}>
      <Context value={api}>{children}</Context>
    </ModalFocusProvider>
  );
}
export function PopoverTrigger(props: PartProps<'button'>) {
  return <button {...usePopoverContext().getTriggerProps(props)} />;
}
export function PopoverAnchor(props: PartProps<'div'>) {
  return <div {...usePopoverContext().getAnchorProps(props)} />;
}
export function PopoverContent(props: PartProps<'div'>) {
  return <div {...usePopoverContext().getContentProps(props)} />;
}
export function PopoverTitle(props: PartProps<'h2'>) {
  return <h2 {...usePopoverContext().getTitleProps(props)}>{props.children}</h2>;
}
export function PopoverDescription(props: PartProps<'p'>) {
  return <p {...usePopoverContext().getDescriptionProps(props)} />;
}
export function PopoverClose(props: PartProps<'button'>) {
  return <button {...usePopoverContext().getCloseProps(props)} />;
}
export function PopoverBackdrop(props: PartProps<'div'>) {
  return <div {...usePopoverContext().getBackdropProps(props)} />;
}
export const PopoverPortal = DialogPortal;
export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Anchor: PopoverAnchor,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
  Backdrop: PopoverBackdrop,
  Portal: PopoverPortal,
};
