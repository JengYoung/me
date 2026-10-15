import { mergeProps } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';

export interface TableOptions {
  id?: string;
  rowCount?: number;
  columnCount?: number;
}
function count(value: number | undefined) {
  if (value !== undefined && value !== -1 && (!Number.isInteger(value) || value < 1))
    throw new Error('Table counts must be positive integers or -1 for unknown totals.');
}
function position(props: { 'aria-rowindex'?: number; 'aria-colindex'?: number }) {
  for (const value of [props['aria-rowindex'], props['aria-colindex']])
    if (value !== undefined && (!Number.isInteger(value) || value < 1))
      throw new Error('Table indices are one-based positive integers.');
}
export function connectTable(options: TableOptions & { id: string }) {
  count(options.rowCount);
  count(options.columnCount);
  return {
    id: options.id,
    getRootProps(props: PartProps<'table'> = {}): PartProps<'table'> {
      return mergeProps<'table'>(props, {
        id: options.id,
        'aria-rowcount': options.rowCount,
        'aria-colcount': options.columnCount,
        'data-scope': 'table',
        'data-part': 'root',
      });
    },
    getCaptionProps(props: PartProps<'caption'> = {}): PartProps<'caption'> {
      return mergeProps<'caption'>(props, {
        id: `${options.id}-caption`,
        'data-scope': 'table',
        'data-part': 'caption',
      });
    },
    getHeadProps(props: PartProps<'thead'> = {}): PartProps<'thead'> {
      return mergeProps<'thead'>(props, { 'data-scope': 'table', 'data-part': 'head' });
    },
    getBodyProps(props: PartProps<'tbody'> = {}): PartProps<'tbody'> {
      return mergeProps<'tbody'>(props, { 'data-scope': 'table', 'data-part': 'body' });
    },
    getFootProps(props: PartProps<'tfoot'> = {}): PartProps<'tfoot'> {
      return mergeProps<'tfoot'>(props, { 'data-scope': 'table', 'data-part': 'foot' });
    },
    getRowProps(props: PartProps<'tr'> = {}): PartProps<'tr'> {
      position(props);
      return mergeProps<'tr'>(props, { 'data-scope': 'table', 'data-part': 'row' });
    },
    getHeaderCellProps(props: PartProps<'th'> = {}): PartProps<'th'> {
      position(props);
      return mergeProps<'th'>(props, {
        scope: props.scope ?? 'col',
        'data-scope': 'table',
        'data-part': 'header-cell',
      });
    },
    getCellProps(props: PartProps<'td'> = {}): PartProps<'td'> {
      position(props);
      return mergeProps<'td'>(props, { 'data-scope': 'table', 'data-part': 'cell' });
    },
  };
}
export type TableApi = ReturnType<typeof connectTable>;
