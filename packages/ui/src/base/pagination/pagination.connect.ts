import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import { paginationItems, paginationPage, paginationPageCount, targetPage } from './pagination.machine';
import type { PaginationOptions, PaginationSchema, PaginationTarget } from './pagination.machine';

export function connectPagination(service: MachineApi<PaginationSchema>, options: PaginationOptions & { id: string }) {
  const page = paginationPage(options, service.state.context);
  const pageCount = paginationPageCount(options);
  const pageSize = options.pageSize ?? 10;
  const go = (target: PaginationTarget) => service.send({ type: 'GO', target });
  const targetState = (target: PaginationTarget) => {
    const value = targetPage(options, page, target);
    const disabled =
      !!options.disabled ||
      pageCount === 0 ||
      !Number.isSafeInteger(value) ||
      value < 1 ||
      value > pageCount ||
      (typeof target !== 'number' && value === page);
    return { value, disabled };
  };
  return {
    page,
    pageSize,
    pageCount,
    range: { start: pageCount === 0 ? 0 : (page - 1) * pageSize + 1, end: Math.min(options.count, page * pageSize) },
    items: paginationItems(pageCount, page, options.boundaryCount ?? 1, options.siblingCount ?? 1),
    canPrevious: !options.disabled && pageCount > 0 && page > 1,
    canNext: !options.disabled && page < pageCount,
    first: () => go('first'),
    last: () => go('last'),
    next: () => go('next'),
    previous: () => go('previous'),
    setPage: (value: number) => go(value),
    getRootProps(user: PartProps<'nav'> = {}): PartProps<'nav'> {
      return mergeProps<'nav'>(user, {
        id: options.id,
        'aria-label': user['aria-label'] ?? (user['aria-labelledby'] ? undefined : 'Pagination'),
        'data-scope': 'pagination',
        'data-part': 'root',
      });
    },
    getButtonProps(target: PaginationTarget, user: PartProps<'button'> = {}): PartProps<'button'> {
      const { value, disabled } = targetState(target);
      const { 'aria-current': _current, ...props } = user;
      return mergeProps<'button'>(props, {
        type: 'button',
        disabled: disabled || !!user.disabled,
        'aria-current': typeof target === 'number' && pageCount > 0 && value === page ? 'page' : undefined,
        'data-scope': 'pagination',
        'data-part': 'button',
        'data-page': value,
        onClick: () => {
          if (!disabled && !user.disabled) go(target);
        },
      });
    },
    getLinkProps(target: PaginationTarget, user: PartProps<'a'> & { href: string }): PartProps<'a'> {
      const { value, disabled } = targetState(target);
      const { href, 'aria-current': _current, ...props } = user;
      return mergeProps<'a'>(props, {
        href: disabled ? undefined : href,
        role: disabled ? 'link' : user.role,
        tabIndex: disabled ? -1 : user.tabIndex,
        'aria-disabled': disabled,
        'aria-current': typeof target === 'number' && pageCount > 0 && value === page ? 'page' : undefined,
        'data-scope': 'pagination',
        'data-part': 'link',
        'data-page': value,
        onClick: (event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          if (
            event.button === 0 &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey &&
            (!user.target || user.target === '_self') &&
            !user.download
          )
            go(target);
        },
      });
    },
    getEllipsisProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, { 'aria-hidden': true, 'data-scope': 'pagination', 'data-part': 'ellipsis' });
    },
  };
}
export type PaginationApi = ReturnType<typeof connectPagination>;
