import { flattenTree, isTreeBranch } from "../_shared/core/index";
import type { TreeEntry } from "../_shared/core/index";
import { mergeProps } from "../_shared/react/index";
import type { PartProps, MachineApi } from "../_shared/react/index";
import type { GridApi } from "../grid/index";
import { treeGridExpanded, treeGridSelected } from "./treegrid.machine";
import type { TreeGridSchema } from "./treegrid.machine";
import type { TreeGridOptions, TreeGridNode } from "./use-treegrid";

export function connectTreeGrid(
  service: MachineApi<TreeGridSchema>,
  grid: GridApi,
  options: TreeGridOptions & { id: string },
  entries: readonly TreeEntry[],
) {
  const expandedValues = treeGridExpanded(options, service.state.context);
  const visibleRows = entries.filter((entry) => entry.visible);
  function entryFor(value: string) {
    const entry = entries.find((e) => e.node.value === value);
    if (!entry) throw new Error(`Unknown Treegrid row: ${value}`);
    return entry;
  }
  function toggleExpanded(value: string) {
    const props = service.getProps();
    const entry = flattenTree(props.nodes).find((e) => e.node.value === value);
    if (!entry || entry.node.disabled || !isTreeBranch(entry.node)) return;
    const current = treeGridExpanded(props, service.getSnapshot().context);
    service.send({
      type: 'EXPAND',
      values: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  }
  return {
    focusedCell: grid.focusedCell,
    selectedRows: treeGridSelected(options, service.state.context),
    interacting: grid.interacting,
    expandedValues,
    visibleRows,
    toggleExpanded,
    setExpandedValues: (values: readonly string[]) => service.send({ type: 'EXPAND', values }),
    focusCell: grid.focusCell,
    selectRow: grid.selectRow,
    setSelectedRows: (values: readonly string[]) => service.send({ type: 'SELECT', values }),
    getControlProps: grid.getControlProps,
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return { ...grid.getRootProps(props), role: 'treegrid', 'data-scope': 'treegrid' };
    },
    getRowProps(value: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      const entry = entryFor(value);
      if (!entry.visible) throw new Error('Render only visibleRows in a Treegrid.');
      const base = grid.getRowProps(value, props);
      return {
        ...base,
        'aria-level': entry.level,
        'aria-posinset': entry.posInSet,
        'aria-setsize': entry.setSize,
        'aria-selected':
          options.selectionMode === 'single' && !grid.selectedRows.includes(value) ? undefined : base['aria-selected'],
        'aria-busy': entry.node.loading || undefined,
        'data-scope': 'treegrid',
      };
    },
    getCellProps(row: string, column: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      const entry = entryFor(row);
      const first = (entry.node as TreeGridNode).cells[0]?.value === column;
      const expanded = isTreeBranch(entry.node) && first ? expandedValues.includes(row) : undefined;
      const { 'aria-expanded': _expanded, ...user } = props;
      const base = grid.getCellProps(
        row,
        column,
        mergeProps<'div'>(user, {
          onKeyDown: (event) => {
            if (
              event.target !== event.currentTarget ||
              event.altKey ||
              event.metaKey ||
              event.shiftKey ||
              event.nativeEvent.isComposing
            )
              return;
            if (first && isTreeBranch(entry.node) && event.key === 'Enter' && !event.ctrlKey) {
              event.preventDefault();
              toggleExpanded(row);
            }
            if (event.ctrlKey && (event.key === 'Home' || event.key === 'End')) {
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? visibleRows.find((r) => !r.node.disabled)
                  : visibleRows.filter((r) => !r.node.disabled).at(-1);
              if (next) grid.focusCell(next.node.value, column);
            }
          },
        }),
      );
      return { ...base, 'aria-expanded': expanded, 'data-scope': 'treegrid' };
    },
    getExpanderProps(value: string, props: PartProps<'button'> = {}): PartProps<'button'> {
      const entry = entryFor(value);
      return mergeProps<'button'>(props, {
        type: 'button',
        tabIndex: -1,
        disabled: options.disabled || entry.node.disabled || !isTreeBranch(entry.node),
        'aria-label':
          props['aria-label'] ?? `${expandedValues.includes(value) ? 'Collapse' : 'Expand'} ${entry.node.label}`,
        'data-scope': 'treegrid',
        'data-part': 'expander',
        onPointerDown: (event) => {
          if (event.button === 0 && event.pointerType !== 'touch') event.preventDefault();
        },
        onClick: (event) => {
          event.stopPropagation();
          const first = (entry.node as TreeGridNode).cells[0];
          if (first && grid.focusCell(value, first.value)) toggleExpanded(value);
        },
      });
    },
  };
}
export type TreeGridApi = ReturnType<typeof connectTreeGrid>;
