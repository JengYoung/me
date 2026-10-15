'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useSidebar } from "./use-sidebar";
import type { SidebarOptions, SidebarApi } from "./use-sidebar";
const Context = createContext<SidebarApi | null>(null);
function useSidebarContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Sidebar parts must be inside Sidebar.Root.');
  return api;
}
export type SidebarRootProps = SidebarOptions & { children?: ReactNode };
export function SidebarRoot({ children, ...options }: SidebarRootProps) {
  const api = useSidebar(options);
  return <Context value={api}>{children}</Context>;
}
export function SidebarTrigger(props: PartProps<'button'>) {
  return <button {...useSidebarContext().getTriggerProps(props)} />;
}
export function SidebarContent(props: PartProps<'div'>) {
  return <div {...useSidebarContext().getContentProps(props)} />;
}
export function SidebarNav(props: PartProps<'nav'>) {
  return <nav {...useSidebarContext().getNavProps(props)} />;
}
export function SidebarTitle(props: PartProps<'h2'>) {
  return <h2 {...useSidebarContext().getTitleProps(props)}>{props.children}</h2>;
}
export function SidebarDescription(props: PartProps<'p'>) {
  return <p {...useSidebarContext().getDescriptionProps(props)} />;
}
export function SidebarClose(props: PartProps<'button'>) {
  return <button {...useSidebarContext().getCloseProps(props)} />;
}
export const Sidebar = {
  Root: SidebarRoot,
  Trigger: SidebarTrigger,
  Content: SidebarContent,
  Nav: SidebarNav,
  Title: SidebarTitle,
  Description: SidebarDescription,
  Close: SidebarClose,
};
