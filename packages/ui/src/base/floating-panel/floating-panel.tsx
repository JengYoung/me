'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { ModalFocusProvider } from "../_shared/focus/index";
import { DialogPortal } from "../dialog/index";
import { useFloatingPanel } from "./use-floating-panel";
import type { FloatingPanelApi, FloatingPanelOptions } from "./use-floating-panel";
import type { FloatingPanelMode } from "./floating-panel.machine";
import type { PanelResizeEdge } from "./geometry";

const Context = createContext<FloatingPanelApi | null>(null);
function useFloatingPanelContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Floating Panel parts must be inside FloatingPanel.Root.');
  return api;
}
export type FloatingPanelRootProps = FloatingPanelOptions & { children?: ReactNode };
export function FloatingPanelRoot({ children, ...options }: FloatingPanelRootProps) {
  const api = useFloatingPanel(options);
  return (
    <ModalFocusProvider scope={api.scope}>
      <Context value={api}>{children}</Context>
    </ModalFocusProvider>
  );
}
export function FloatingPanelTrigger(props: PartProps<'button'>) {
  return <button {...useFloatingPanelContext().getTriggerProps(props)} />;
}
export function FloatingPanelContent(props: PartProps<'div'>) {
  return <div {...useFloatingPanelContext().getContentProps(props)} />;
}
export function FloatingPanelTitle(props: PartProps<'h2'>) {
  return <h2 {...useFloatingPanelContext().getTitleProps(props)}>{props.children}</h2>;
}
export function FloatingPanelBody(props: PartProps<'div'>) {
  return <div {...useFloatingPanelContext().getBodyProps(props)} />;
}
export function FloatingPanelDragHandle(props: PartProps<'button'>) {
  return <button {...useFloatingPanelContext().getDragHandleProps(props)} />;
}
export type FloatingPanelResizeHandleProps = PartProps<'button'> & { edge: PanelResizeEdge };
export function FloatingPanelResizeHandle({ edge, ...props }: FloatingPanelResizeHandleProps) {
  return <button {...useFloatingPanelContext().getResizeHandleProps(edge, props)} />;
}
export type FloatingPanelModeTriggerProps = PartProps<'button'> & { mode: FloatingPanelMode };
export function FloatingPanelModeTrigger({ mode, ...props }: FloatingPanelModeTriggerProps) {
  return <button {...useFloatingPanelContext().getModeTriggerProps(mode, props)} />;
}
export function FloatingPanelClose(props: PartProps<'button'>) {
  return <button {...useFloatingPanelContext().getCloseProps(props)} />;
}
export const FloatingPanelPortal = DialogPortal;
export const FloatingPanel = {
  Root: FloatingPanelRoot,
  Trigger: FloatingPanelTrigger,
  Content: FloatingPanelContent,
  Title: FloatingPanelTitle,
  Body: FloatingPanelBody,
  DragHandle: FloatingPanelDragHandle,
  ResizeHandle: FloatingPanelResizeHandle,
  ModeTrigger: FloatingPanelModeTrigger,
  Close: FloatingPanelClose,
  Portal: FloatingPanelPortal,
};
