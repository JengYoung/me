'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useMarquee } from "./use-marquee";
import type { MarqueeApi, MarqueeOptions, MarqueeCopyProps } from "./use-marquee";
const Context = createContext<MarqueeApi | null>(null);
function useMarqueeContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Marquee parts must be rendered inside Marquee.Root.');
  return api;
}
export type MarqueeRootProps = MarqueeOptions & { children?: ReactNode };
export function MarqueeRoot({ children, ...options }: MarqueeRootProps) {
  return <Context value={useMarquee(options)}>{children}</Context>;
}
export function MarqueeViewport(props: PartProps<'div'>) {
  return <div {...useMarqueeContext().getViewportProps(props)} />;
}
export function MarqueeTrack(props: PartProps<'div'>) {
  return <div {...useMarqueeContext().getTrackProps(props)} />;
}
export function MarqueeContent(props: PartProps<'div'>) {
  return <div {...useMarqueeContext().getContentProps(props)} />;
}
export function MarqueeCopy({ index, ...props }: MarqueeCopyProps & { index: number }) {
  return <div {...useMarqueeContext().getCopyProps(index, props)} />;
}
export function MarqueeToggle(props: PartProps<'button'>) {
  return <button {...useMarqueeContext().getToggleProps(props)} />;
}
export function MarqueeValue({ children }: { children: (api: MarqueeApi) => ReactNode }) {
  return children(useMarqueeContext());
}
export const Marquee = {
  Root: MarqueeRoot,
  Viewport: MarqueeViewport,
  Track: MarqueeTrack,
  Content: MarqueeContent,
  Copy: MarqueeCopy,
  Toggle: MarqueeToggle,
  Value: MarqueeValue,
};
