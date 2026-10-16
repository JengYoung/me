import type {
  DataTableAdapter,
  DataTableCellValue,
  DataTableEngineOptions,
  DataTableSnapshot,
  DataTableState,
} from './data-table.types';

const defaultState = (): DataTableState => ({
  sorting: null,
  filters: {},
  pagination: { pageIndex: 0, pageSize: 10 },
  selectedRows: [],
  hiddenColumns: [],
});
const compare = (a: DataTableCellValue, b: DataTableCellValue) => {
  if (a == null) return b == null ? 0 : -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  // Deterministic across server/browser locales; applications may supply locale-aware comparison.
  const left = String(a).toLowerCase();
  const right = String(b).toLowerCase();
  return left < right ? -1 : left > right ? 1 : 0;
};
function validate<Row>(options: DataTableEngineOptions<Row>, state: DataTableState) {
  const rowIds = options.data.map(options.getRowId);
  const columnIds = options.columns.map((column) => column.id);
  for (const ids of [rowIds, columnIds])
    if (ids.some((id) => !id.trim()) || new Set(ids).size !== ids.length)
      throw new Error('Data Table requires unique nonempty stable row/column IDs.');
  if (options.columns.some((column) => !column.header.trim()))
    throw new Error('Data Table columns require text headers.');
  if (
    !Number.isInteger(state.pagination.pageIndex) ||
    state.pagination.pageIndex < 0 ||
    !Number.isInteger(state.pagination.pageSize) ||
    state.pagination.pageSize < 1
  )
    throw new Error('Data Table requires a nonnegative pageIndex and a positive pageSize.');
  if (
    options.rowCount !== undefined &&
    options.rowCount !== -1 &&
    (!Number.isInteger(options.rowCount) || options.rowCount < 0)
  )
    throw new Error('Data Table rowCount must be nonnegative or -1.');
}

/** TanStack-inspired row pipeline: core -> filtered -> sorted -> paginated, with explicit manual/server mode. */
export function createDataTableAdapter<Row>(initial: DataTableEngineOptions<Row>): DataTableAdapter<Row> {
  let options = initial;
  const baseline = { ...defaultState(), ...initial.defaultState };
  const keys = Object.keys(baseline) as (keyof DataTableState)[];
  const controlled = new Set(keys.filter((key) => initial.state?.[key] !== undefined));
  let internal = Object.fromEntries(
    keys.filter((key) => !controlled.has(key)).map((key) => [key, baseline[key]]),
  ) as Partial<DataTableState>;
  const listeners = new Set<() => void>();
  function project(): DataTableSnapshot<Row> {
    let state = { ...baseline, ...internal, ...options.state };
    validate(options, state);
    const all = options.data.map((original) => ({
      id: options.getRowId(original),
      original,
      values: Object.fromEntries(options.columns.map((column) => [column.id, column.accessor(original)])),
    }));
    const columns = options.columns.filter((column) => !state.hiddenColumns.includes(column.id));
    const sorting = options.columns.some((column) => column.id === state.sorting?.columnId && column.sortable !== false)
      ? state.sorting
      : null;
    let rows = all;
    if (options.processing !== 'server') {
      rows = rows.filter((row) =>
        options.columns.every((column) => {
          const query = Object.hasOwn(state.filters, column.id) ? state.filters[column.id] : undefined;
          return (
            !query ||
            (column.filter
              ? column.filter(row.values[column.id], query, row.original)
              : String(row.values[column.id] ?? '')
                  .toLowerCase()
                  .includes(query.toLowerCase()))
          );
        }),
      );
      if (sorting) {
        const column = options.columns.find((item) => item.id === sorting.columnId)!;
        const direction = sorting.direction === 'asc' ? 1 : -1;
        rows = [...rows].sort(
          (a, b) => (column.compare ?? compare)(a.values[column.id], b.values[column.id]) * direction,
        );
      }
    }
    const rowCount = options.processing === 'server' ? (options.rowCount ?? rows.length) : rows.length;
    const pageCount = rowCount === -1 ? -1 : Math.ceil(rowCount / state.pagination.pageSize);
    const pageIndex =
      pageCount === -1 ? state.pagination.pageIndex : Math.min(state.pagination.pageIndex, Math.max(0, pageCount - 1));
    const selectedRows =
      options.selectionMode === 'none'
        ? []
        : [...new Set(state.selectedRows)].filter(
            (id) => options.processing === 'server' || all.some((row) => row.id === id),
          );
    state = {
      ...state,
      sorting,
      selectedRows: options.selectionMode === 'single' ? selectedRows.slice(0, 1) : selectedRows,
      pagination: { ...state.pagination, pageIndex },
    };
    if (options.processing !== 'server')
      rows = rows.slice(pageIndex * state.pagination.pageSize, (pageIndex + 1) * state.pagination.pageSize);
    return {
      state,
      rows,
      columns,
      rowCount,
      pageCount,
      canNextPage: pageCount === -1 ? rows.length >= state.pagination.pageSize : pageIndex + 1 < pageCount,
    };
  }
  let snapshot = project();
  function publish() {
    const next = project();
    const same =
      next.rowCount === snapshot.rowCount &&
      next.pageCount === snapshot.pageCount &&
      next.canNextPage === snapshot.canNextPage &&
      JSON.stringify(next.state) === JSON.stringify(snapshot.state) &&
      next.columns.length === snapshot.columns.length &&
      next.columns.every((column, index) => {
        const before = snapshot.columns[index]!;
        return column.id === before.id && column.header === before.header && column.sortable === before.sortable;
      }) &&
      next.rows.length === snapshot.rows.length &&
      next.rows.every((row, index) => {
        const before = snapshot.rows[index]!;
        return (
          row.id === before.id &&
          row.original === before.original &&
          JSON.stringify(row.values) === JSON.stringify(before.values)
        );
      });
    if (same) return;
    snapshot = next;
    listeners.forEach((listener) => listener());
  }
  function request(patch: Partial<DataTableState>) {
    const next = { ...snapshot.state, ...patch };
    validate(options, next);
    if (keys.every((key) => JSON.stringify(next[key]) === JSON.stringify(snapshot.state[key]))) return;
    for (const key of keys)
      if (Object.hasOwn(patch, key) && !controlled.has(key)) internal = { ...internal, [key]: next[key] };
    publish();
    options.onStateChange?.(next);
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    configure(next) {
      if (keys.some((key) => controlled.has(key) !== (next.state?.[key] !== undefined)))
        throw new Error('Data Table cannot switch slice control modes.');
      const changed =
        next.data !== options.data ||
        next.columns !== options.columns ||
        next.getRowId !== options.getRowId ||
        next.processing !== options.processing ||
        next.rowCount !== options.rowCount ||
        next.selectionMode !== options.selectionMode ||
        keys.some((key) => next.state?.[key] !== options.state?.[key]);
      options = next;
      if (changed) {
        // Uncontrolled selections are pruned only against complete client data, never against a page/filter.
        if (!controlled.has('selectedRows') && options.processing !== 'server')
          internal = {
            ...internal,
            selectedRows: (internal.selectedRows ?? []).filter((id) =>
              options.data.some((row) => options.getRowId(row) === id),
            ),
          };
        publish();
      }
    },
    setSorting(sorting) {
      if (sorting && !options.columns.some((column) => column.id === sorting.columnId && column.sortable !== false))
        return;
      request({ sorting, pagination: { ...snapshot.state.pagination, pageIndex: 0 } });
    },
    setFilter(columnId, value) {
      if (!options.columns.some((column) => column.id === columnId)) return;
      request({
        filters: { ...snapshot.state.filters, [columnId]: value },
        pagination: { ...snapshot.state.pagination, pageIndex: 0 },
      });
    },
    setPagination(pagination) {
      request({ pagination });
    },
    setSelectedRows(rows) {
      if (options.selectionMode === 'none') return;
      request({ selectedRows: options.selectionMode === 'single' ? [...new Set(rows)].slice(-1) : [...new Set(rows)] });
    },
    setColumnVisible(columnId, visible) {
      if (!options.columns.some((column) => column.id === columnId)) return;
      request({
        hiddenColumns: visible
          ? snapshot.state.hiddenColumns.filter((id) => id !== columnId)
          : [...new Set([...snapshot.state.hiddenColumns, columnId])],
      });
    },
    reset() {
      request(baseline);
    },
  };
}
