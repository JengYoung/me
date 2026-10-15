'use client';
import { createContext, Fragment, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { usePagination } from './use-pagination';
import type { PaginationApi, PaginationOptions, PaginationItem, PaginationTarget } from './use-pagination';
const Context = createContext<PaginationApi | null>(null);
function usePaginationContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Pagination parts must be rendered inside Pagination.Root.');
  return api;
}
export type PaginationRootProps = Omit<PartProps<'nav'>, keyof PaginationOptions> & PaginationOptions;
export function PaginationRoot({
  count,
  pageSize,
  page,
  defaultPage,
  onPageChange,
  boundaryCount,
  siblingCount,
  disabled,
  id,
  ...props
}: PaginationRootProps) {
  const api = usePagination({
    count,
    pageSize,
    page,
    defaultPage,
    onPageChange,
    boundaryCount,
    siblingCount,
    disabled,
    id,
  });
  return (
    <Context value={api}>
      <nav {...api.getRootProps(props)} />
    </Context>
  );
}
export type PaginationButtonProps = PartProps<'button'> & { page: PaginationTarget };
export function PaginationButton({ page, ...props }: PaginationButtonProps) {
  return <button {...usePaginationContext().getButtonProps(page, props)} />;
}
export type PaginationLinkProps = PartProps<'a'> & { page: PaginationTarget; href: string };
export function PaginationLink({ page, href, children, ...props }: PaginationLinkProps) {
  return <a {...usePaginationContext().getLinkProps(page, { ...props, href })}>{children}</a>;
}
export function PaginationEllipsis(props: PartProps<'span'>) {
  return <span {...usePaginationContext().getEllipsisProps({ children: '…', ...props })} />;
}
export function PaginationItems({ children }: { children: (item: PaginationItem) => ReactNode }) {
  return usePaginationContext().items.map((item) => (
    <Fragment key={item.type === 'page' ? item.value : item.key}>{children(item)}</Fragment>
  ));
}
export const Pagination = {
  Root: PaginationRoot,
  Button: PaginationButton,
  Link: PaginationLink,
  Ellipsis: PaginationEllipsis,
  Items: PaginationItems,
};
