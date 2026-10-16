'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useBreadcrumb } from './use-breadcrumb';
import type { BreadcrumbApi, BreadcrumbLinkProps, BreadcrumbOptions } from './use-breadcrumb';
const Context = createContext<BreadcrumbApi | null>(null);
function useBreadcrumbContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Breadcrumb parts must be rendered inside Breadcrumb.Root.');
  return api;
}
export type BreadcrumbRootProps = PartProps<'nav'> & BreadcrumbOptions;
export function BreadcrumbRoot({ id, ...props }: BreadcrumbRootProps) {
  const api = useBreadcrumb({ id });
  return (
    <Context value={api}>
      <nav {...api.getRootProps(props)} />
    </Context>
  );
}
export function BreadcrumbList(props: PartProps<'ol'>) {
  return <ol {...useBreadcrumbContext().getListProps(props)} />;
}
export function BreadcrumbItem(props: PartProps<'li'>) {
  return <li {...useBreadcrumbContext().getItemProps(props)} />;
}
export function BreadcrumbLink(props: BreadcrumbLinkProps) {
  return <a {...useBreadcrumbContext().getLinkProps(props)}>{props.children}</a>;
}
export function BreadcrumbCurrent(props: PartProps<'span'>) {
  return <span {...useBreadcrumbContext().getCurrentProps(props)} />;
}
export function BreadcrumbSeparator(props: PartProps<'span'>) {
  return <span {...useBreadcrumbContext().getSeparatorProps(props)} />;
}
export const Breadcrumb = {
  Root: BreadcrumbRoot,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Current: BreadcrumbCurrent,
  Separator: BreadcrumbSeparator,
};
