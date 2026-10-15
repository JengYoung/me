'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { ModalFocusProvider } from '../_shared/focus/index';
import { DialogPortal } from '../dialog/index';
import { useHoverCard } from './use-hover-card';
import type { HoverCardOptions, HoverCardApi } from './use-hover-card';
const Context = createContext<HoverCardApi | null>(null);
function useHoverCardContext() {
  const api = useContext(Context);
  if (!api) throw new Error('HoverCard parts must be inside HoverCard.Root.');
  return api;
}
export type HoverCardRootProps = HoverCardOptions & { children?: ReactNode };
export function HoverCardRoot({ children, ...options }: HoverCardRootProps) {
  const api = useHoverCard(options);
  return (
    <ModalFocusProvider scope={api.scope}>
      <Context value={api}>{children}</Context>
    </ModalFocusProvider>
  );
}
export function HoverCardTrigger(props: PartProps<'a'>) {
  return <a {...useHoverCardContext().getTriggerProps(props)}>{props.children}</a>;
}
export function HoverCardContent(props: PartProps<'div'>) {
  return <div {...useHoverCardContext().getContentProps(props)} />;
}
export const HoverCardPortal = DialogPortal;
export const HoverCard = {
  Root: HoverCardRoot,
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
  Portal: HoverCardPortal,
};
