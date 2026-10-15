'use client';
import { useMachine, useStableId, useDirectionContext } from "../_shared/react/index";
import { useRovingFocus } from "../_shared/keyboard/index";
import { useState } from 'react';
import { treeViewMachine, treeEntries, treeFocused } from "./tree-view.machine";
import type { TreeViewOptions } from "./tree-view.machine";
import { connectTreeView } from "./tree-view.connect";
export function useTreeView(options: TreeViewOptions) {
  const inherited = useDirectionContext();
  const props = { ...options, dir: options.dir ?? inherited };
  const id = useStableId('iris-tree-view', options.id);
  const [modes] = useState([options.expandedValues !== undefined, options.selectedValues !== undefined]);
  const service = useMachine(treeViewMachine, { props });
  const roving = useRovingFocus({
    items: treeEntries(options, service.state.context)
      .filter((entry) => entry.visible)
      .map((entry) => entry.node),
    value: treeFocused(options, service.state.context),
    orientation: 'vertical',
    loop: false,
    disabled: options.disabled,
    dir: props.dir,
    onValueChange: (value) => {
      if (value !== null) service.send({ type: 'FOCUS', value });
    },
  });
  if (modes[0] !== (options.expandedValues !== undefined) || modes[1] !== (options.selectedValues !== undefined))
    throw new Error('Tree View cannot switch control modes.');
  return connectTreeView(service, roving, { ...props, id });
}
export type { TreeViewOptions } from "./tree-view.machine";
export type { TreeViewApi } from "./tree-view.connect";
export type { TreeNode, TreeEntry } from "../_shared/core/index";
