import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RovingFocusApi } from "../_shared/keyboard/index";
import type { KeyboardEvent, MouseEvent } from 'react';
import { cellKey, gridPosition } from "./grid.model";
import type { GridOptions } from "./grid.model";
import { gridFocused, gridSelected } from "./grid.machine";
import type { GridSchema } from "./grid.machine";

export function connectGrid(
  service: MachineApi<GridSchema>,
  roving: RovingFocusApi,
  options: GridOptions & { id: string },
) {
  const focused = gridFocused(options, service.state.context);
  const selectedRows = gridSelected(options, service.state.context);
  const interaction = service.state.value === 'interaction';
  function selectRow(row: string) {
    const props = service.getProps();
    if (!props.rows.some((item) => item.value === row && !item.disabled)) return;
    const selected = gridSelected(props, service.getSnapshot().context);
    service.send({
      type: 'SELECT',
      rows:
        props.selectionMode === 'multiple'
          ? selected.includes(row)
            ? selected.filter((v) => v !== row)
            : [...selected, row]
          : [row],
    });
  }
  function focusCell(row: string, column: string) {
    const result = roving.focus(cellKey(row, column));
    if (result) service.send({ type: 'NAVIGATE' });
    return result;
  }
  function onKeyDown(rowValue: string, column: string, event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.metaKey || event.nativeEvent.isComposing) return;
    if ((event.target as HTMLElement).closest('[data-grid-cell]') !== event.currentTarget) return;
    const props = service.getProps();
    if (props.disabled) return;
    const key = cellKey(rowValue, column);
    if (event.target !== event.currentTarget) {
      if (event.key === 'Escape' || event.key === 'F2') {
        event.preventDefault();
        event.stopPropagation();
        focusCell(rowValue, column);
      }
      return;
    }
    if (!event.ctrlKey && !event.shiftKey && (event.key === 'Enter' || event.key === 'F2')) {
      const control = event.currentTarget.querySelector<HTMLElement>(
        '[data-grid-control]:not(:disabled):not([hidden])',
      );
      if (control) {
        event.preventDefault();
        service.send({ type: 'INTERACT' });
        control.focus();
      }
      return;
    }
    if (event.key === ' ' && !event.ctrlKey && props.selectionMode && props.selectionMode !== 'none') {
      event.preventDefault();
      selectRow(rowValue);
      return;
    }
    if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'a' && props.selectionMode === 'multiple') {
      event.preventDefault();
      service.send({ type: 'SELECT', rows: props.rows.filter((r) => !r.disabled).map((r) => r.value) });
      return;
    }
    if (event.shiftKey || (event.ctrlKey && event.key !== 'Home' && event.key !== 'End')) return;
    const rowIndex = props.rows.findIndex((row) => row.value === rowValue);
    const row = props.rows[rowIndex];
    if (!row) return;
    const columnIndex = row.cells.findIndex((cell) => cell.value === column);
    const dir =
      props.dir ??
      (event.currentTarget.ownerDocument.defaultView?.getComputedStyle(event.currentTarget).direction === 'rtl'
        ? 'rtl'
        : 'ltr');
    const horizontal = (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0) * (dir === 'rtl' ? -1 : 1);
    let target: { row: string; column: string } | undefined;
    if (horizontal) {
      for (let i = columnIndex + horizontal; i >= 0 && i < row.cells.length; i += horizontal) {
        const cell = row.cells[i]!;
        if (!cell.disabled) {
          target = { row: rowValue, column: cell.value };
          break;
        }
      }
    } else if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(event.key)) {
      const step = event.key === 'ArrowUp' || event.key === 'PageUp' ? -1 : 1;
      const distance = event.key.startsWith('Page') ? (props.pageSize ?? 10) : 1;
      const destination = Math.min(props.rows.length - 1, Math.max(0, rowIndex + step * distance));
      for (let i = destination; i >= 0 && i < props.rows.length; i += step) {
        const nextRow = props.rows[i]!;
        if (nextRow.disabled) continue;
        const cell =
          nextRow.cells.find((c) => c.value === column && !c.disabled) ??
          nextRow.cells[Math.min(columnIndex, nextRow.cells.length - 1)];
        if (cell && !cell.disabled) {
          target = { row: nextRow.value, column: cell.value };
          break;
        }
      }
    } else if (event.key === 'Home' || event.key === 'End') {
      const rows = event.ctrlKey ? props.rows : [row];
      const cells = rows
        .filter((r) => !r.disabled)
        .flatMap((r) => r.cells.filter((c) => !c.disabled).map((c) => ({ row: r.value, column: c.value })));
      target = event.key === 'Home' ? cells[0] : cells.at(-1);
    } else return;
    event.preventDefault();
    if (target && cellKey(target.row, target.column) !== key) focusCell(target.row, target.column);
  }
  function getCell(rowValue: string, column: string) {
    const row = options.rows.find((r) => r.value === rowValue);
    const cell = row?.cells.find((c) => c.value === column);
    if (!row || !cell) throw new Error(`Unknown Grid cell: ${rowValue}/${column}`);
    return { row, cell };
  }
  return {
    focusedCell: gridPosition(options.rows, focused),
    selectedRows,
    interacting: interaction,
    focusCell,
    selectRow,
    setSelectedRows: (rows: readonly string[]) => service.send({ type: 'SELECT', rows }),
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return roving.getRootProps(
        mergeProps<'div'>(props, {
          id: options.id,
          role: 'grid',
          'aria-rowcount': options.rowCount ?? options.rows.length,
          'aria-colcount': options.columnCount ?? Math.max(0, ...options.rows.map((row) => row.cells.length)),
          'aria-multiselectable': options.selectionMode === 'multiple' || undefined,
          'aria-disabled': options.disabled || undefined,
          'data-scope': 'grid',
          'data-part': 'root',
          onBlur: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) service.send({ type: 'NAVIGATE' });
          },
        }),
      );
    },
    getRowProps(value: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      const index = options.rows.findIndex((row) => row.value === value);
      if (index < 0) throw new Error(`Unknown Grid row: ${value}`);
      const { 'aria-selected': _selected, ...user } = props;
      return mergeProps<'div'>(user, {
        role: 'row',
        'aria-rowindex': options.rows[index]!.rowIndex ?? index + 1,
        'aria-selected':
          options.selectionMode && options.selectionMode !== 'none' ? selectedRows.includes(value) : undefined,
        'data-scope': 'grid',
        'data-part': 'row',
        'data-value': value,
      });
    },
    getCellProps(rowValue: string, column: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      const { row, cell } = getCell(rowValue, column);
      const key = cellKey(rowValue, column);
      return roving.getItemProps<'div'>(
        key,
        mergeProps<'div'>(props, {
          id: `${options.id}-cell-${encodeURIComponent(key)}`,
          role: cell.role ?? 'gridcell',
          'aria-colindex': cell.columnIndex ?? row.cells.indexOf(cell) + 1,
          'aria-disabled': cell.disabled || row.disabled || options.disabled || undefined,
          'data-scope': 'grid',
          'data-part': 'cell',
          'data-grid-cell': key,
          'data-active': focused === key || undefined,
          onKeyDown: (event) => onKeyDown(rowValue, column, event),
          onFocus: (event) => {
            if (
              event.target !== event.currentTarget &&
              (event.target as HTMLElement).closest('[data-grid-cell]') === event.currentTarget
            ) {
              service.send({ type: 'FOCUS', key });
              service.send({ type: 'INTERACT' });
            } else if (event.target === event.currentTarget) service.send({ type: 'NAVIGATE' });
          },
          onPointerDown: (event) => {
            if (event.button === 0 && (event.target as HTMLElement).closest('[data-grid-cell]') === event.currentTarget)
              roving.focus(key);
          },
          onClick: (event) => {
            if ((event.target as HTMLElement).closest('[data-grid-control]')) return;
            if (roving.focus(key) && options.selectionMode && options.selectionMode !== 'none') selectRow(rowValue);
          },
        }),
      );
    },
    getControlProps<Tag extends 'input' | 'button' | 'select' | 'textarea' | 'a' = 'input'>(
      row: string,
      column: string,
      props: PartProps<Tag> = {} as PartProps<Tag>,
      tag: Tag = 'input' as Tag,
    ): PartProps<Tag> {
      const model = getCell(row, column);
      const disabled = !!options.disabled || !!model.row.disabled || !!model.cell.disabled;
      return mergeProps<Tag>(
        props,
        Object.assign({} as PartProps<Tag>, {
          tabIndex: !disabled && interaction && focused === cellKey(row, column) ? 0 : -1,
          'data-grid-control': true,
          'aria-disabled': disabled || undefined,
          ...(tag === 'a'
            ? {
                onClick: (event: MouseEvent<HTMLElement>) => {
                  if (disabled) event.preventDefault();
                },
              }
            : { disabled: disabled || (props as PartProps<'input'>).disabled }),
        }),
      );
    },
  };
}
export type GridApi = ReturnType<typeof connectGrid>;
