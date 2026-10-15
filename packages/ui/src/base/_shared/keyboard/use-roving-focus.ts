'use client';

import {
  getNavigationIntent,
  getNavigationTarget,
  isItemEnabled,
  recoverValue,
  validateCollection,
} from '../core/index';
import type { CollectionItem } from '../core/index';
import { mergeProps, useDirectionContext, useMachine } from '../react/index';
import type { PartProps } from '../react/index';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent, RefCallback } from 'react';
import { rovingMachine, rovingValue } from './roving.machine';
import type { RovingFocusOptions } from './roving.machine';

export type { RovingFocusOptions } from './roving.machine';
const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

export function useRovingFocus(options: RovingFocusOptions) {
  const inheritedDirection = useDirectionContext();
  const dir = options.dir ?? inheritedDirection;
  validateCollection(options.items);
  const [controlled] = useState(options.value !== undefined);
  const service = useMachine(rovingMachine, { props: { ...options, dir } });
  const { getProps } = service;
  const root = useRef<HTMLDivElement | null>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  const refs = useRef(new Map<string, RefCallback<HTMLElement>>());
  const lastFocus = useRef<{ value: string; items: readonly CollectionItem[]; element: HTMLElement } | null>(null);
  const inside = useRef(false);
  const value = rovingValue(options, service.state.context.value);

  const ordered = useCallback(() => {
    const props = getProps();
    return props.items
      .filter((item) => {
        const element = elements.current.get(item.value);
        return (
          !props.disabled &&
          !item.disabled &&
          element?.isConnected &&
          !element.closest('[hidden]') &&
          !element.matches(':disabled')
        );
      })
      .sort((first, second) => {
        const position = elements.current
          .get(first.value)!
          .compareDocumentPosition(elements.current.get(second.value)!);
        return position & 4 ? -1 : position & 2 ? 1 : 0;
      });
  }, [getProps]);

  const focus = useCallback(
    (next: string): boolean => {
      if (!ordered().some((item) => item.value === next)) return false;
      const element = elements.current.get(next)!;
      element.focus();
      return element.ownerDocument.activeElement === element;
    },
    [ordered],
  );

  function itemRef(itemValue: string): RefCallback<HTMLElement> {
    const existing = refs.current.get(itemValue);
    if (existing) return existing;
    const ref: RefCallback<HTMLElement> = (element) => {
      if (!element) return;
      const previous = elements.current.get(itemValue);
      if (previous && previous !== element) throw new Error(`Duplicate mounted collection item: ${itemValue}`);
      elements.current.set(itemValue, element);
      return () => {
        if (elements.current.get(itemValue) === element) elements.current.delete(itemValue);
      };
    };
    refs.current.set(itemValue, ref);
    return ref;
  }

  useCommitEffect(() => {
    const items = ordered();
    const previous = lastFocus.current;
    if (
      inside.current &&
      previous &&
      (!items.some((item) => item.value === previous.value) ||
        elements.current.get(previous.value) !== previous.element)
    ) {
      const document = previous.element.ownerDocument;
      const active = document.activeElement;
      if (
        active === previous.element ||
        active === document.body ||
        active === root.current ||
        (getProps().focusWithin && previous.element.contains(active))
      ) {
        const requested = getProps().value ?? null;
        const next = isItemEnabled(items, requested) ? requested : recoverValue(items, previous.items, previous.value);
        if (next !== null) focus(next);
        else root.current?.focus();
      }
    }
    if (lastFocus.current && items.some((item) => item.value === lastFocus.current!.value))
      lastFocus.current.items = items;
    for (const key of refs.current.keys()) {
      if (!options.items.some((item) => item.value === key) && !elements.current.has(key)) refs.current.delete(key);
    }
  });

  function onKeyDown(itemValue: string, event: KeyboardEvent<HTMLElement>) {
    if (
      event.target !== event.currentTarget ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    const props = service.getProps();
    if (props.keyboard === false) return;
    const dir =
      props.dir ??
      (event.currentTarget.ownerDocument.defaultView?.getComputedStyle(event.currentTarget).direction === 'rtl'
        ? 'rtl'
        : 'ltr');
    const intent = getNavigationIntent(event.key, { orientation: props.orientation, dir, homeEnd: props.homeEnd });
    if (!intent) return;
    const next = getNavigationTarget(ordered(), itemValue, intent, props.loop);
    if (next !== null && focus(next)) {
      event.preventDefault();
      props.onNavigate?.(next);
    }
  }

  if (controlled !== (options.value !== undefined)) throw new Error('Roving focus cannot switch control modes.');
  return {
    value,
    dir,
    focus,
    getItemElement: (itemValue: string) => elements.current.get(itemValue) ?? null,
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ref: root,
        tabIndex: -1,
        dir,
        onBlur: (event) => {
          if (event.currentTarget.contains(event.relatedTarget)) return;
          if (event.relatedTarget) inside.current = false;
          service.send({ type: 'LEAVE' });
        },
      });
    },
    getItemProps<Tag extends 'button' | 'input' | 'div' | 'article' = 'button'>(
      itemValue: string,
      props: PartProps<Tag> = {} as PartProps<Tag>,
    ): PartProps<Tag> {
      const item = options.items.find((entry) => entry.value === itemValue);
      if (!item) throw new Error(`Unknown collection item: ${itemValue}`);
      return mergeProps<Tag>(props, {
        ref: itemRef(itemValue),
        tabIndex: value === itemValue && !item.disabled && !options.disabled ? 0 : -1,
        onFocus: (event: FocusEvent<HTMLElement>) => {
          if ((event.target !== event.currentTarget && !options.focusWithin) || item.disabled || options.disabled)
            return;
          const element = elements.current.get(itemValue);
          if (element)
            lastFocus.current = {
              value: itemValue,
              items: ordered(),
              element,
            };
          inside.current = true;
          service.send({ type: 'FOCUS', value: itemValue });
        },
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => onKeyDown(itemValue, event),
      } as PartProps<Tag>);
    },
  };
}

export type RovingFocusApi = ReturnType<typeof useRovingFocus>;
