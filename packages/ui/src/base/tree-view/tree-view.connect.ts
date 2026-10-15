import { isTreeBranch } from '../_shared/core/index';
import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { RovingFocusApi } from '../_shared/keyboard/index';
import { treeEntries, treeExpanded, treeFocused, treeSearch, treeSelected } from './tree-view.machine';
import type { TreeViewOptions, TreeViewSchema } from './tree-view.machine';

export function connectTreeView(
  service: MachineApi<TreeViewSchema>,
  roving: RovingFocusApi,
  options: TreeViewOptions & { id: string },
) {
  const entries = treeEntries(options, service.state.context);
  const expandedValues = treeExpanded(options, service.state.context);
  const selectedValues = treeSelected(options, service.state.context);
  const focusedValue = treeFocused(options, service.state.context);
  function toggleExpanded(value: string) {
    const props = service.getProps();
    const entry = treeEntries(props, service.getSnapshot().context).find((item) => item.node.value === value);
    if (!entry || entry.node.disabled || !isTreeBranch(entry.node)) return;
    const current = treeExpanded(props, service.getSnapshot().context);
    service.send({
      type: 'EXPAND',
      values: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  }
  function select(value: string) {
    const props = service.getProps();
    if (
      !treeEntries(props, service.getSnapshot().context).some(
        (entry) => entry.node.value === value && !entry.node.disabled,
      )
    )
      return;
    const current = treeSelected(props, service.getSnapshot().context);
    service.send({
      type: 'SELECT',
      values:
        props.selectionMode === 'multiple'
          ? current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value]
          : [value],
    });
  }
  function entryFor(value: string) {
    const entry = entries.find((item) => item.node.value === value);
    if (!entry) throw new Error(`Unknown Tree View item: ${value}`);
    return entry;
  }
  return {
    expandedValues,
    selectedValues,
    focusedValue,
    visibleItems: entries.filter((entry) => entry.visible),
    focus: roving.focus,
    toggleExpanded,
    select,
    setExpandedValues: (values: readonly string[]) => service.send({ type: 'EXPAND', values }),
    setSelectedValues: (values: readonly string[]) => service.send({ type: 'SELECT', values }),
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return roving.getRootProps(
        mergeProps<'div'>(props, {
          id: options.id,
          role: 'tree',
          'aria-multiselectable': options.selectionMode === 'multiple' || undefined,
          'aria-disabled': options.disabled || undefined,
          'data-scope': 'tree-view',
          'data-part': 'root',
        }),
      );
    },
    getItemProps(value: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      const entry = entryFor(value);
      const expanded = expandedValues.includes(value);
      const { 'aria-expanded': _expanded, 'aria-selected': _selected, ...user } = props;
      const internal = mergeProps<'div'>(user, {
        id: `${options.id}-item-${encodeURIComponent(value)}`,
        role: 'treeitem',
        'aria-label': entry.node.label,
        'aria-level': entry.level,
        'aria-posinset': entry.posInSet,
        'aria-setsize': entry.setSize,
        'aria-expanded': isTreeBranch(entry.node) ? expanded : undefined,
        'aria-selected': options.selectionMode === 'none' ? undefined : selectedValues.includes(value),
        'aria-disabled': entry.node.disabled || options.disabled || undefined,
        'aria-busy': entry.node.loading || undefined,
        hidden: !entry.visible,
        'data-scope': 'tree-view',
        'data-part': 'item',
        'data-value': value,
        'data-state': isTreeBranch(entry.node) ? (expanded ? 'expanded' : 'collapsed') : undefined,
        onClick: (event) => {
          if ((event.target as HTMLElement).closest('[role="treeitem"]') !== event.currentTarget) return;
          if (roving.focus(value)) select(value);
        },
        onDoubleClick: (event) => {
          if ((event.target as HTMLElement).closest('[role="treeitem"]') === event.currentTarget) toggleExpanded(value);
        },
        onKeyDown: (event) => {
          if (
            event.target !== event.currentTarget ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.nativeEvent.isComposing
          )
            return;
          const currentProps = service.getProps();
          if (currentProps.disabled || entry.node.disabled) return;
          const latest = treeEntries(currentProps, service.getSnapshot().context);
          const item = latest.find((e) => e.node.value === value);
          if (!item) return;
          const open = treeExpanded(currentProps, service.getSnapshot().context).includes(value);
          const dir =
            currentProps.dir ??
            (event.currentTarget.ownerDocument.defaultView?.getComputedStyle(event.currentTarget).direction === 'rtl'
              ? 'rtl'
              : 'ltr');
          const expandKey = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
          const collapseKey = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
          if (event.key === expandKey) {
            event.preventDefault();
            if (isTreeBranch(item.node) && !open) toggleExpanded(value);
            else {
              const child = latest.find((e) => e.parent === value && e.visible && !e.node.disabled);
              if (child) roving.focus(child.node.value);
            }
          } else if (event.key === collapseKey) {
            event.preventDefault();
            if (isTreeBranch(item.node) && open) toggleExpanded(value);
            else if (item.parent) roving.focus(item.parent);
          } else if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            select(value);
          } else if (event.key === '*') {
            event.preventDefault();
            const expanded = treeExpanded(currentProps, service.getSnapshot().context);
            service.send({
              type: 'EXPAND',
              values: [
                ...expanded,
                ...latest
                  .filter((e) => e.parent === item.parent && !e.node.disabled && isTreeBranch(e.node))
                  .map((e) => e.node.value),
              ],
            });
          } else if (event.key.length === 1) {
            event.preventDefault();
            service.send({ type: 'TYPE', character: event.key });
            const next = treeSearch(currentProps, service.getSnapshot().context);
            if (next) roving.focus(next);
          }
        },
      });
      // Hidden descendants may stay mounted; only visible entries join the roving collection.
      return entry.visible ? roving.getItemProps<'div'>(value, internal) : { ...internal, tabIndex: -1 };
    },
    getGroupProps(value: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      entryFor(value);
      return mergeProps<'div'>(props, {
        id: `${options.id}-group-${encodeURIComponent(value)}`,
        role: 'group',
        hidden: !expandedValues.includes(value),
        'data-scope': 'tree-view',
        'data-part': 'group',
      });
    },
    getExpanderProps(value: string, props: PartProps<'button'> = {}): PartProps<'button'> {
      const entry = entryFor(value);
      return mergeProps<'button'>(props, {
        type: 'button',
        tabIndex: -1,
        disabled: options.disabled || entry.node.disabled || !isTreeBranch(entry.node),
        'aria-label':
          props['aria-label'] ?? `${expandedValues.includes(value) ? 'Collapse' : 'Expand'} ${entry.node.label}`,
        'data-scope': 'tree-view',
        'data-part': 'expander',
        onPointerDown: (event) => {
          if (event.button === 0 && event.pointerType !== 'touch') event.preventDefault();
        },
        onClick: (event) => {
          event.stopPropagation();
          if (roving.focus(value)) toggleExpanded(value);
        },
      });
    },
  };
}
export type TreeViewApi = ReturnType<typeof connectTreeView>;
