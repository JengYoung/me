export type DataTableCellValue = string | number | boolean | null | undefined;
export interface DataTableColumn<Row> {
  id: string;
  header: string;
  accessor: (row: Row) => DataTableCellValue;
  sortable?: boolean;
  compare?: (a: DataTableCellValue, b: DataTableCellValue) => number;
  filter?: (value: DataTableCellValue, query: string, row: Row) => boolean;
}
export interface DataTableState {
  sorting: { columnId: string; direction: 'asc' | 'desc' } | null;
  filters: Readonly<Record<string, string>>;
  pagination: { pageIndex: number; pageSize: number };
  selectedRows: readonly string[];
  hiddenColumns: readonly string[];
}
export interface DataTableEngineOptions<Row> {
  data: readonly Row[];
  columns: readonly DataTableColumn<Row>[];
  getRowId: (row: Row) => string;
  /** Controlled per slice; omitted slices are owned by the engine. */
  state?: Partial<DataTableState>;
  defaultState?: Partial<DataTableState>;
  onStateChange?: (state: DataTableState) => void;
  processing?: 'client' | 'server';
  /** Server total, excluding headers. -1 means unknown. */
  rowCount?: number;
  selectionMode?: 'none' | 'single' | 'multiple';
}
export interface DataTableRow<Row> {
  id: string;
  original: Row;
  values: Readonly<Record<string, DataTableCellValue>>;
}
export interface DataTableSnapshot<Row> {
  state: DataTableState;
  rows: readonly DataTableRow<Row>[];
  columns: readonly DataTableColumn<Row>[];
  rowCount: number;
  pageCount: number;
  canNextPage: boolean;
}
/** A stable engine store. A custom adapter supplies the same snapshot and commands. */
export interface DataTableAdapter<Row> {
  getSnapshot: () => DataTableSnapshot<Row>;
  subscribe: (listener: () => void) => () => void;
  configure: (options: DataTableEngineOptions<Row>) => void;
  setSorting: (sorting: DataTableState['sorting']) => void;
  setFilter: (columnId: string, value: string) => void;
  setPagination: (pagination: DataTableState['pagination']) => void;
  setSelectedRows: (rows: readonly string[]) => void;
  setColumnVisible: (columnId: string, visible: boolean) => void;
  reset: () => void;
}
