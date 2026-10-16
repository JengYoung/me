import { mergeProps } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';
import type { GridApi } from '../grid/index';
import type { TableApi } from '../table/index';
import type { PaginationApi } from '../pagination/index';
import type { DataTableAdapter, DataTableSnapshot } from './data-table.types';
import type { DataTableOptions } from './use-data-table';

export function connectDataTable<Row>(
  snapshot: DataTableSnapshot<Row>,
  options: DataTableOptions<Row> & { id: string },
  adapter: DataTableAdapter<Row>,
  table: TableApi,
  grid: GridApi,
  pagination: PaginationApi,
  headerId: string,
) {
  const data = (part: string) => ({ 'data-scope': 'data-table', 'data-part': part });
  const sort = (column: string) =>
    snapshot.state.sorting?.columnId === column
      ? snapshot.state.sorting.direction === 'asc'
        ? ('ascending' as const)
        : ('descending' as const)
      : undefined;
  const toggleRow = (id: string) => {
    if (options.disabled || options.selectionMode === 'none') return;
    const latest = adapter.getSnapshot();
    if (!latest.rows.some((row) => row.id === id)) return;
    const selected = latest.state.selectedRows;
    adapter.setSelectedRows(
      selected.includes(id)
        ? selected.filter((row) => row !== id)
        : options.selectionMode === 'single'
          ? [id]
          : [...selected, id],
    );
  };
  const column = (id: string) => {
    const item = snapshot.columns.find((item) => item.id === id);
    if (!item) throw new Error(`Unknown visible Data Table column: ${id}`);
    return item;
  };
  const rowIndex = (id: string) => {
    const index = snapshot.rows.findIndex((row) => row.id === id);
    if (index < 0) throw new Error(`Unknown visible Data Table row: ${id}`);
    return snapshot.state.pagination.pageIndex * snapshot.state.pagination.pageSize + index + 2;
  };
  const mode = (expected: 'table' | 'grid') => {
    if ((options.mode ?? 'table') !== expected) throw new Error(`This getter requires Data Table ${expected} mode.`);
  };
  return {
    ...snapshot,
    adapter,
    mode: options.mode ?? 'table',
    loading: !!options.loading,
    error: options.error,
    empty: !options.loading && !options.error && snapshot.rows.length === 0,
    setSorting: adapter.setSorting,
    setFilter: adapter.setFilter,
    setPagination: adapter.setPagination,
    setSelectedRows: adapter.setSelectedRows,
    setColumnVisible: adapter.setColumnVisible,
    reset: adapter.reset,
    toggleRow,
    focusedCell: grid.focusedCell,
    focusCell: grid.focusCell,
    getTableProps(user: PartProps<'table'> = {}): PartProps<'table'> {
      mode('table');
      return mergeProps<'table'>(table.getRootProps(user), { 'aria-busy': !!options.loading, ...data('root') });
    },
    getCaptionProps: table.getCaptionProps,
    getHeadProps: table.getHeadProps,
    getBodyProps: table.getBodyProps,
    getHeaderProps(id: string, user: PartProps<'th'> = {}): PartProps<'th'> {
      mode('table');
      column(id);
      return table.getHeaderCellProps({
        ...user,
        id: `${options.id}-column-${encodeURIComponent(id)}`,
        'aria-sort': sort(id),
        'aria-colindex': options.columns.findIndex((item) => item.id === id) + 1,
      });
    },
    getRowProps(id: string, user: PartProps<'tr'> = {}): PartProps<'tr'> {
      mode('table');
      return table.getRowProps({
        ...user,
        'aria-rowindex': rowIndex(id),
        'data-selected': snapshot.state.selectedRows.includes(id),
      });
    },
    getCellProps(row: string, id: string, user: PartProps<'td'> = {}): PartProps<'td'> {
      mode('table');
      rowIndex(row);
      column(id);
      return table.getCellProps({
        ...user,
        headers: `${options.id}-column-${encodeURIComponent(id)}`,
        'aria-colindex': options.columns.findIndex((item) => item.id === id) + 1,
      });
    },
    getSortProps(id: string, user: PartProps<'button'> = {}): PartProps<'button'> {
      const item = column(id);
      const internal: PartProps<'button'> = {
        type: 'button',
        disabled: !!user.disabled || !!options.disabled || item.sortable === false,
        ...data('sort'),
        onClick() {
          if (options.disabled || item.sortable === false) return;
          const current = adapter.getSnapshot().state.sorting;
          adapter.setSorting(
            current?.columnId !== id
              ? { columnId: id, direction: 'asc' }
              : current.direction === 'asc'
                ? { columnId: id, direction: 'desc' }
                : null,
          );
        },
      };
      return mergeProps<'button'>(
        options.mode === 'grid' ? grid.getControlProps(headerId, id, user, 'button') : user,
        internal,
      );
    },
    getSelectionProps(id: string, user: PartProps<'input'> = {}): PartProps<'input'> {
      rowIndex(id);
      return mergeProps<'input'>(user, {
        type: 'checkbox',
        checked: snapshot.state.selectedRows.includes(id),
        disabled: !!user.disabled || !!options.disabled || options.selectionMode === 'none',
        ...data('selection'),
        onChange: () => toggleRow(id),
      });
    },
    getFilterProps(id: string, user: PartProps<'input'> = {}): PartProps<'input'> {
      if (!options.columns.some((item) => item.id === id)) throw new Error(`Unknown column: ${id}`);
      return mergeProps<'input'>(user, {
        type: 'search',
        value: (Object.hasOwn(snapshot.state.filters, id) ? snapshot.state.filters[id] : undefined) ?? '',
        disabled: !!user.disabled || !!options.disabled,
        ...data('filter'),
        onChange: (event) => adapter.setFilter(id, event.currentTarget.value),
      });
    },
    getColumnVisibilityProps(id: string, user: PartProps<'input'> = {}): PartProps<'input'> {
      return mergeProps<'input'>(user, {
        type: 'checkbox',
        checked: !snapshot.state.hiddenColumns.includes(id),
        disabled: !!user.disabled || !!options.disabled,
        ...data('column-visibility'),
        onChange: (event) => adapter.setColumnVisible(id, event.currentTarget.checked),
      });
    },
    getGridProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      mode('grid');
      return mergeProps<'div'>(grid.getRootProps(user), { 'aria-busy': !!options.loading, ...data('root') });
    },
    getGridHeaderRowProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      mode('grid');
      const props = grid.getRowProps(headerId, user);
      delete props['aria-selected'];
      return props;
    },
    getGridHeaderProps(id: string, user: PartProps<'div'> = {}): PartProps<'div'> {
      mode('grid');
      return grid.getCellProps(headerId, id, { ...user, 'aria-sort': sort(id) });
    },
    getGridRowProps(id: string, user: PartProps<'div'> = {}): PartProps<'div'> {
      mode('grid');
      return grid.getRowProps(id, user);
    },
    getGridCellProps(row: string, id: string, user: PartProps<'div'> = {}): PartProps<'div'> {
      mode('grid');
      return grid.getCellProps(row, id, user);
    },
    getGridControlProps: grid.getControlProps,
    getPreviousProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return pagination.getButtonProps('previous', user);
    },
    getNextProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        type: 'button',
        disabled: !!user.disabled || !!options.disabled || !snapshot.canNextPage,
        onClick() {
          const current = adapter.getSnapshot();
          if (current.canNextPage && !options.disabled)
            adapter.setPagination({ ...current.state.pagination, pageIndex: current.state.pagination.pageIndex + 1 });
        },
      });
    },
    getStatusProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        role: options.error ? 'alert' : 'status',
        'aria-live': options.error ? 'assertive' : 'polite',
        ...data('status'),
      });
    },
  };
}
