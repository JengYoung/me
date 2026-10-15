import { flattenTree, isTreeBranch } from "../_shared/core/index";
import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { FieldApi } from "../field/index";
import type { TreeViewApi } from "../tree-view/index";
import type { RefCallback } from 'react';
import { cascadeExpanded, cascadePath, cascadeValue, normalizeCascadePath } from "./cascade-select.machine";
import type { CascadeSelectSchema } from "./cascade-select.machine";
import type { CascadeSelectOptions } from "./use-cascade-select";

export function connectCascadeSelect(
  service: MachineApi<CascadeSelectSchema>,
  options: CascadeSelectOptions & { id: string },
  field: FieldApi,
  tree: TreeViewApi,
  resetRef: RefCallback<HTMLInputElement>,
) {
  const value = cascadeValue(options, service.state.context);
  const expandedPath = cascadeExpanded(options, service.state.context);
  const entries = flattenTree(options.nodes);
  const selectedPaths = value.map((selected) => cascadePath(options.nodes, selected));
  const data = (part: string) => ({
    'data-scope': 'cascade-select',
    'data-part': part,
    'data-disabled': options.disabled || undefined,
    'data-readonly': options.readOnly || undefined,
    'data-invalid': field.invalid || undefined,
  });
  function expand(value: string) {
    const props = service.getProps();
    const path = cascadePath(props.nodes, value);
    if (!path.length || normalizeCascadePath(props, path).length !== path.length) return;
    const current = cascadeExpanded(props, service.getSnapshot().context);
    service.send({ type: 'EXPAND', path: current.includes(value) ? path.slice(0, -1) : path });
  }
  return {
    value,
    expandedPath,
    selectedPaths,
    focusedValue: tree.focusedValue,
    activePath: tree.focusedValue ? cascadePath(options.nodes, tree.focusedValue) : [],
    valueText: selectedPaths
      .map((path) => path.map((id) => entries.find((entry) => entry.node.value === id)!.node.label).join(' / '))
      .join(', '),
    ids: field.ids,
    invalid: field.invalid,
    focus: tree.focus,
    setValue: (values: readonly string[]) => service.send({ type: 'SELECT', values }),
    clear: () => service.send({ type: 'SELECT', values: [] }),
    setExpandedPath: (path: readonly string[]) => service.send({ type: 'EXPAND', path }),
    toggleExpanded: expand,
    getTreeProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      const { 'aria-readonly': _readOnly, ...props } = field.getCustomControlProps(user);
      return mergeProps<'div'>(tree.getRootProps(props), data('tree'));
    },
    getLabelProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(field.getCustomLabelProps(user), data('label'));
    },
    getDescriptionProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(field.getDescriptionProps(user), data('description'));
    },
    getErrorProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(field.getErrorProps(user), data('error'));
    },
    getItemProps(item: string, user: PartProps<'div'> = {}): PartProps<'div'> {
      const entry = entries.find((entry) => entry.node.value === item);
      if (!entry) throw new Error(`Unknown Cascade Select node: ${item}`);
      const branch = isTreeBranch(entry.node);
      const props = tree.getItemProps(
        item,
        mergeProps<'div'>(user, {
          onClick(event) {
            if (
              (event.target as HTMLElement).closest('[role="treeitem"]') !== event.currentTarget ||
              !branch ||
              service.getProps().allowParentSelection
            )
              return;
            event.preventDefault();
            if (tree.focus(item)) expand(item);
          },
          onKeyDown(event) {
            if (
              event.target !== event.currentTarget ||
              event.altKey ||
              event.ctrlKey ||
              event.metaKey ||
              event.shiftKey ||
              event.nativeEvent.isComposing
            )
              return;
            if (event.key === '*') {
              event.preventDefault();
              return;
            }
            if (branch && !service.getProps().allowParentSelection && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              expand(item);
            }
          },
        }),
      );
      // Branches used only for navigation do not advertise a selectable state.
      if (branch && !options.allowParentSelection) delete props['aria-selected'];
      return mergeProps<'div'>(props, {
        ...data('item'),
        'data-selected': value.includes(item) || undefined,
        'data-branch': branch || undefined,
      });
    },
    getGroupProps(item: string, user: PartProps<'div'> = {}) {
      return mergeProps<'div'>(tree.getGroupProps(item, user), data('group'));
    },
    getExpanderProps(item: string, user: PartProps<'button'> = {}) {
      return mergeProps<'button'>(tree.getExpanderProps(item, user), data('expander'));
    },
    getClearProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        ...data('clear'),
        type: 'button',
        disabled: options.disabled || options.readOnly || !value.length,
        'aria-label': user['aria-label'] ?? 'Clear selection',
        onClick: () => service.send({ type: 'SELECT', values: [] }),
      });
    },
    getHiddenInputProps(user: PartProps<'input'> = {}): PartProps<'input'> {
      const { defaultValue: _default, ...props } = user;
      return mergeProps<'input'>(props, {
        ...data('hidden-input'),
        type: 'hidden',
        name: options.name,
        form: options.form,
        disabled: options.disabled,
        value: JSON.stringify(value),
        ref: resetRef,
      });
    },
  };
}
export type CascadeSelectApi = ReturnType<typeof connectCascadeSelect>;
