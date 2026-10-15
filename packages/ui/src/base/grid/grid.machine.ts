import { createMachine, recoverValue, sameCollection, isItemEnabled } from "../_shared/core/index";
import type { CollectionItem } from "../_shared/core/index";
import { cellKey, gridItems, normalizeRows, sameValues, validateGrid } from "./grid.model";
import type { GridOptions } from "./grid.model";
export interface GridSchema {
  state: 'navigation' | 'interaction';
  props: GridOptions;
  context: { focused: string | null; items: readonly CollectionItem[]; selected: readonly string[] };
  event:
    | { type: 'FOCUS'; key: string }
    | { type: 'INTERACT' }
    | { type: 'NAVIGATE' }
    | { type: 'SELECT'; rows: readonly string[] };
}
export const gridSelected = (props: GridOptions, context: GridSchema['context']) =>
  normalizeRows(props, props.selectedRows ?? context.selected);
export function gridFocused(props: GridOptions, context: GridSchema['context']) {
  if (props.disabled) return null;
  const items = gridItems(props.rows);
  if (context.focused && !isItemEnabled(items, context.focused) && props.getFocusFallback) {
    const [row, column] = JSON.parse(context.focused) as [string, string];
    const fallback = props.getFocusFallback({ row, column });
    if (fallback && isItemEnabled(items, cellKey(fallback.row, fallback.column)))
      return cellKey(fallback.row, fallback.column);
  }
  return recoverValue(items, context.items, context.focused);
}
export const gridMachine = createMachine<GridSchema>({
  initial: 'navigation',
  context: ({ props }) => {
    validateGrid(props);
    const items = gridItems(props.rows);
    return {
      items,
      focused: recoverValue(
        items,
        [],
        props.defaultFocusedCell ? cellKey(props.defaultFocusedCell.row, props.defaultFocusedCell.column) : null,
      ),
      selected: props.selectedRows === undefined ? normalizeRows(props, props.defaultSelectedRows ?? []) : [],
    };
  },
  states: { navigation: {}, interaction: {} },
  onProps: {
    assign: ({ props, context }) => {
      const items = gridItems(props.rows);
      const selected = normalizeRows(props, context.selected);
      return {
        items: sameCollection(items, context.items) ? context.items : items,
        focused: gridFocused(props, context),
        selected: sameValues(selected, context.selected) ? context.selected : selected,
      };
    },
    actions: [
      ({ props, context, send }) => {
        if (props.disabled || !context.focused) send({ type: 'NAVIGATE' });
      },
    ],
  },
  on: {
    FOCUS: {
      guard: ({ props, event }) => !props.disabled && isItemEnabled(gridItems(props.rows), event.key),
      assign: ({ event }) => ({ focused: event.key }),
    },
    INTERACT: { guard: ({ props, context }) => !props.disabled && context.focused !== null, target: 'interaction' },
    NAVIGATE: { target: 'navigation' },
    SELECT: {
      guard: ({ props, context, event }) =>
        !props.disabled &&
        event.rows.every((v) =>
          props.rows.some((row) => row.value === v && (!row.disabled || gridSelected(props, context).includes(v))),
        ) &&
        !sameValues(gridSelected(props, context), normalizeRows(props, event.rows)),
      assign: ({ props, context, event }) => ({
        selected: props.selectedRows === undefined ? normalizeRows(props, event.rows) : context.selected,
      }),
      actions: [({ props, event }) => props.onSelectedRowsChange?.(normalizeRows(props, event.rows))],
    },
  },
});
