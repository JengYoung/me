'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useScrollArea } from "./use-scroll-area";
import type { ScrollAreaApi, ScrollAreaOptions, ScrollAxis } from "./use-scroll-area";
const Context = createContext<ScrollAreaApi | null>(null);
function useScrollAreaContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Scroll Area parts must be rendered inside ScrollArea.Root.');
  return api;
}
export type ScrollAreaRootProps = ScrollAreaOptions & { children?: ReactNode };
export function ScrollAreaRoot({ children, ...options }: ScrollAreaRootProps) {
  return <Context value={useScrollArea(options)}>{children}</Context>;
}
export function ScrollAreaControl(props: PartProps<'div'>) {
  return <div {...useScrollAreaContext().getRootProps(props)} />;
}
export function ScrollAreaViewport(props: PartProps<'div'>) {
  return <div {...useScrollAreaContext().getViewportProps(props)} />;
}
export function ScrollAreaContent(props: PartProps<'div'>) {
  return <div {...useScrollAreaContext().getContentProps(props)} />;
}
export type ScrollAreaAxisProps = PartProps<'div'> & { orientation: ScrollAxis };
export function ScrollAreaScrollbar({ orientation, ...props }: ScrollAreaAxisProps) {
  return <div {...useScrollAreaContext().getScrollbarProps(orientation, props)} />;
}
export function ScrollAreaThumb({ orientation, ...props }: ScrollAreaAxisProps) {
  return <div {...useScrollAreaContext().getThumbProps(orientation, props)} />;
}
export function ScrollAreaValue({ children }: { children: (api: ScrollAreaApi) => ReactNode }) {
  return children(useScrollAreaContext());
}
export const ScrollArea = {
  Root: ScrollAreaRoot,
  Control: ScrollAreaControl,
  Viewport: ScrollAreaViewport,
  Content: ScrollAreaContent,
  Scrollbar: ScrollAreaScrollbar,
  Thumb: ScrollAreaThumb,
  Value: ScrollAreaValue,
};
