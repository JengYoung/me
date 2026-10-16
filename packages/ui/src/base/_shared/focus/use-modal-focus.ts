'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { mergeProps } from '../react/index';
import type { PartProps } from '../react/index';
import { activateLayer, registerModalLayer } from './modal-layer';
import type { LayerFocusOptions, ModalFocusOptions } from './modal-layer';
import { useModalScope } from './modal-scope';

const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

export function useModalFocus(options: ModalFocusOptions) {
  return useLayerFocus({ ...options, modal: true });
}

export function useLayerFocus(options: LayerFocusOptions) {
  const scope = useModalScope();
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const [order, setOrder] = useState({ active: false, index: 0 });
  const onOrderChange = useCallback((active: boolean, index: number) => {
    setOrder((previous) => (previous.active === active && previous.index === index ? previous : { active, index }));
  }, []);
  const committed = useRef(options);
  useCommitEffect(() => {
    committed.current = options;
  });
  useCommitEffect(() => {
    if (options.open && content) return registerModalLayer(content, () => committed.current, scope, onOrderChange);
  }, [options.open, options.modal, content, scope, onOrderChange]);
  const activate = useCallback(() => {
    if (content) activateLayer(content);
  }, [content]);
  return {
    scope,
    active: options.open && order.active,
    layerIndex: order.index,
    activate,
    getContentProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, { ref: setContent, tabIndex: -1 });
    },
  };
}

export type ModalFocusApi = ReturnType<typeof useModalFocus>;
