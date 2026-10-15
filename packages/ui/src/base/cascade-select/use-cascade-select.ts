'use client';
import { useCallback, useMemo, useState } from 'react';
import { useField } from '../field/index';
import type { FieldOptions } from '../field/index';
import { useTreeView } from '../tree-view/index';
import { useDirectionContext, useFormReset, useMachine, useStableId } from '../_shared/react/index';
import {
  cascadeExpanded,
  cascadeNodes,
  cascadePath,
  cascadeSelectMachine,
  cascadeValue,
} from './cascade-select.machine';
import type { CascadeSelectMachineOptions } from './cascade-select.machine';
import { connectCascadeSelect } from './cascade-select.connect';

export type CascadeSelectOptions = CascadeSelectMachineOptions & FieldOptions;
export function useCascadeSelect(options: CascadeSelectOptions) {
  const inherited = useDirectionContext();
  const id = useStableId('iris-cascade-select', options.id);
  const [modes] = useState([options.value !== undefined, options.expandedPath !== undefined]);
  const props = { ...options, id, dir: options.dir ?? inherited };
  const service = useMachine(cascadeSelectMachine, { props });
  const value = cascadeValue(options, service.state.context);
  const expandedPath = cascadeExpanded(options, service.state.context);
  const nodes = useMemo(() => cascadeNodes(options.nodes), [options.nodes]);
  const tree = useTreeView({
    nodes,
    id,
    dir: props.dir,
    disabled: options.disabled,
    selectionMode: options.selectionMode ?? 'single',
    selectedValues: value,
    expandedValues: expandedPath,
    onSelectedValuesChange: (values) => service.send({ type: 'SELECT', values }),
    onExpandedValuesChange: (values) => {
      const added = values.find((entry) => !expandedPath.includes(entry));
      service.send({ type: 'EXPAND', path: added ? cascadePath(nodes, added) : values });
    },
  });
  const field = useField({ ...options, id, invalid: options.invalid || (!!options.required && value.length === 0) });
  const { send } = service;
  const reset = useCallback(() => send({ type: 'RESET' }), [send]);
  const resetRef = useFormReset(options.form, reset);
  if (modes[0] !== (options.value !== undefined) || modes[1] !== (options.expandedPath !== undefined))
    throw new Error('Cascade Select cannot switch control modes.');
  return connectCascadeSelect(service, props, field, tree, resetRef);
}
export type { CascadeSelectApi } from './cascade-select.connect';
export type { TreeNode as CascadeSelectNode } from '../_shared/core/index';
