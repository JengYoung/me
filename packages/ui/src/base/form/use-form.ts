'use client';
import { useCallback, useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { useStableId } from '../_shared/react/index';
import { createNativeFormAdapter } from './native-adapter';
import { connectForm } from './form.connect';
import type { FormAdapter, FormEngineOptions } from './form.types';

export interface FormOptions extends FormEngineOptions {
  id?: string;
  /** A stable adapter instance; options are delivered at commit, never during render. */
  adapter?: FormAdapter;
  focusOnError?: boolean;
}
const useCommit = typeof document === 'undefined' ? useEffect : useLayoutEffect;
export function useForm(options: FormOptions = {}) {
  const id = useStableId('iris-form', options.id);
  const [owner] = useState(() => ({
    adapter: options.adapter ?? createNativeFormAdapter(options),
    supplied: options.adapter,
  }));
  if (owner.supplied !== options.adapter) throw new Error('Form adapter must be stable for the lifetime of the form.');
  const { adapter } = owner;
  const snapshot = useSyncExternalStore(adapter.subscribe, adapter.getSnapshot, adapter.getSnapshot);
  useCommit(() => adapter.configure(options), [adapter, options]);
  useCommit(() => adapter.connect(), [adapter]);
  const [controls] = useState(() => new Map<string, Set<HTMLElement>>());
  const registerControl = useCallback(
    (name: string, node: HTMLElement) => {
      let nodes = controls.get(name);
      if (!nodes) {
        nodes = new Set();
        controls.set(name, nodes);
      }
      nodes.add(node);
      return () => {
        nodes.delete(node);
        if (!nodes.size) controls.delete(name);
      };
    },
    [controls],
  );
  const focusField = useCallback(
    (name: string) => {
      const node = [...(controls.get(name) ?? [])].find(
        (item) => item.isConnected && !item.matches(':disabled') && !item.closest('[hidden]'),
      );
      node?.focus();
      return !!node && node.ownerDocument.activeElement === node;
    },
    [controls],
  );
  const focusError = useCallback(() => {
    const errors = adapter.getSnapshot().errors;
    const candidates = [...controls]
      .filter(([name]) => Object.hasOwn(errors, name) && errors[name])
      .flatMap(([name, nodes]) => [...nodes].map((node) => ({ name, node })));
    candidates.sort((a, b) => (a.node.compareDocumentPosition(b.node) & 2 ? 1 : -1));
    return candidates.some(({ name }) => focusField(name));
  }, [adapter, controls, focusField]);
  return connectForm(adapter, snapshot, { ...options, id }, { registerControl, focusField, focusError });
}
export type FormApi = ReturnType<typeof useForm>;
