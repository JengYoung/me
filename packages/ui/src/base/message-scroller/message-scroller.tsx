'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useMessageScroller } from "./use-message-scroller";
import type { MessageScrollerOptions, MessageScrollerApi } from "./use-message-scroller";
const Context = createContext<MessageScrollerApi | null>(null);
function useMessageScrollerContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Message Scroller parts must be rendered inside MessageScroller.Root.');
  return api;
}
export type MessageScrollerRootProps = MessageScrollerOptions & { children?: ReactNode };
export function MessageScrollerRoot({ children, ...options }: MessageScrollerRootProps) {
  return <Context value={useMessageScroller(options)}>{children}</Context>;
}
export function MessageScrollerViewport(props: PartProps<'div'>) {
  return <div {...useMessageScrollerContext().getViewportProps(props)} />;
}
export function MessageScrollerContent(props: PartProps<'div'>) {
  return <div {...useMessageScrollerContext().getContentProps(props)} />;
}
export type MessageScrollerMessageProps = PartProps<'div'> & { messageId: string };
export function MessageScrollerMessage({ messageId, ...props }: MessageScrollerMessageProps) {
  return <div {...useMessageScrollerContext().getMessageProps(messageId, props)} />;
}
export function MessageScrollerLatestButton(props: PartProps<'button'>) {
  return <button {...useMessageScrollerContext().getLatestButtonProps(props)} />;
}
export function MessageScrollerAnnouncer(props: PartProps<'div'>) {
  return <div {...useMessageScrollerContext().getAnnouncerProps(props)} />;
}
export function MessageScrollerValue({ children }: { children: (api: MessageScrollerApi) => ReactNode }) {
  return children(useMessageScrollerContext());
}
export const MessageScroller = {
  Root: MessageScrollerRoot,
  Viewport: MessageScrollerViewport,
  Content: MessageScrollerContent,
  Message: MessageScrollerMessage,
  LatestButton: MessageScrollerLatestButton,
  Announcer: MessageScrollerAnnouncer,
  Value: MessageScrollerValue,
};
