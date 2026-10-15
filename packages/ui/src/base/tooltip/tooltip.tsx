'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useTooltip } from "./use-tooltip";
import type { TooltipApi, TooltipOptions } from "./use-tooltip";
const Context = createContext<TooltipApi | null>(null);
export function useTooltipContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Tooltip parts must be inside Tooltip.Root.');
  return api;
}
export type TooltipRootProps = TooltipOptions & { children?: ReactNode };
export function TooltipRoot({ children, ...options }: TooltipRootProps) {
  const api = useTooltip(options);
  return <Context value={api}>{children}</Context>;
}
export function TooltipTrigger(props: PartProps<'button'>) {
  return <button {...useTooltipContext().getTriggerProps(props)} />;
}
export function TooltipContent(props: PartProps<'div'>) {
  return <div {...useTooltipContext().getContentProps(props)} />;
}
export const Tooltip = { Root: TooltipRoot, Trigger: TooltipTrigger, Content: TooltipContent };
