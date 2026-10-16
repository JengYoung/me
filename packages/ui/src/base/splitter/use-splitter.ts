'use client';
import { useDirection, useMachine, usePointerDrag, useStableId } from '../_shared/react/index';
import { useRef, useState } from 'react';
import { splitterMachine, splitterRange, splitterSize } from './splitter.machine';
import type { SplitterOptions } from './splitter.machine';
import { connectSplitter } from './splitter.connect';

export function useSplitter(options: SplitterOptions = {}) {
  splitterRange(options);
  const [controlled] = useState(options.size !== undefined);
  const id = useStableId('iris-splitter', options.id);
  const dir = useDirection(options.dir);
  const service = useMachine(splitterMachine, { props: { ...options, dir } });
  const { send, getProps, getSnapshot } = service;
  const origin = useRef({ coordinate: 0, size: 0 });
  const drag = usePointerDrag({
    disabled: options.disabled || options.fixed,
    onStart(event) {
      const separator = (event.target as Element).closest<HTMLElement>('[role="separator"]');
      if (!separator || separator.id !== `${id}-separator`) return false;
      const props = getProps();
      const rect = event.currentTarget.getBoundingClientRect();
      if ((props.orientation === 'horizontal' ? rect.height : rect.width) <= 0) return false;
      origin.current = {
        coordinate: props.orientation === 'horizontal' ? event.clientY : event.clientX,
        size: splitterSize(props, getSnapshot().context),
      };
      separator.focus({ preventScroll: true });
      send({ type: 'START' });
      return true;
    },
    onMove(event) {
      const props = getProps();
      const horizontal = props.orientation === 'horizontal';
      const rect = event.currentTarget.getBoundingClientRect();
      const length = horizontal ? rect.height : rect.width;
      if (length <= 0) return;
      const delta = (((horizontal ? event.clientY : event.clientX) - origin.current.coordinate) / length) * 100;
      send({ type: 'SET', size: origin.current.size + delta * (!horizontal && props.dir === 'rtl' ? -1 : 1) });
    },
    onEnd: () => send({ type: 'END' }),
  });
  if (controlled !== (options.size !== undefined)) throw new Error('Splitter cannot switch control modes.');
  return connectSplitter(service, { ...options, dir, id }, drag);
}
export type { SplitterOptions } from './splitter.machine';
export type { SplitterApi } from './splitter.connect';
