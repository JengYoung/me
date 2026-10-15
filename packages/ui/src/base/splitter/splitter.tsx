'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useSplitter } from "./use-splitter";
import type { SplitterApi, SplitterOptions } from "./use-splitter";
const Context = createContext<SplitterApi | null>(null);
function useSplitterContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Splitter parts must be rendered inside Splitter.Root.');
  return api;
}
export type SplitterRootProps = SplitterOptions & { children?: ReactNode };
export function SplitterRoot({ children, ...options }: SplitterRootProps) {
  const api = useSplitter(options);
  return <Context value={api}>{children}</Context>;
}
export function SplitterGroup(props: PartProps<'div'>) {
  return <div {...useSplitterContext().getRootProps(props)} />;
}
export function SplitterLabel(props: PartProps<'span'>) {
  return <span {...useSplitterContext().getLabelProps(props)} />;
}
export type SplitterPaneProps = PartProps<'div'> & { pane: 'primary' | 'secondary' };
export function SplitterPane({ pane, ...props }: SplitterPaneProps) {
  return <div {...useSplitterContext().getPaneProps(pane, props)} />;
}
export function SplitterSeparator(props: PartProps<'div'>) {
  return <div {...useSplitterContext().getSeparatorProps(props)} />;
}
export type SplitterValueProps = { children: (api: SplitterApi) => ReactNode };
export function SplitterValue({ children }: SplitterValueProps) {
  return children(useSplitterContext());
}
export const Splitter = {
  Root: SplitterRoot,
  Group: SplitterGroup,
  Pane: SplitterPane,
  Separator: SplitterSeparator,
  Label: SplitterLabel,
  Value: SplitterValue,
};
