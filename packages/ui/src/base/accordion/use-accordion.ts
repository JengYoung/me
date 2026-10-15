'use client';
import { validateCollection } from "../_shared/core/index";
import { mergeProps, useMachine, useStableId } from "../_shared/react/index";
import { useRovingFocus } from "../_shared/keyboard/index";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FocusEvent } from 'react';
import { accordionMachine, accordionValue } from "./accordion.machine";
import type { AccordionOptions } from "./accordion.machine";
import { connectAccordion } from "./accordion.connect";

const useCommitEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
export function useAccordion(options: AccordionOptions) {
  validateCollection(options.items);
  const [controlled] = useState(options.value !== undefined);
  const id = useStableId('iris-accordion', options.id);
  const service = useMachine(accordionMachine, { props: options });
  const root = useRef<HTMLDivElement | null>(null);
  const panelFocus = useRef<{ value: string; element: HTMLDivElement } | null>(null);
  const roving = useRovingFocus({
    items: options.items,
    orientation: 'vertical',
    dir: options.dir,
    loop: options.loop,
    disabled: options.disabled,
  });
  const value = accordionValue(options, service.state.context);
  useCommitEffect(() => {
    const previous = panelFocus.current;
    if (!previous || value.includes(previous.value)) return;
    const active = previous.element.ownerDocument.activeElement;
    if (previous.element.contains(active) || active === previous.element.ownerDocument.body) {
      if (!roving.focus(previous.value)) {
        const next = options.items.find((item) => !item.disabled);
        if (!next || !roving.focus(next.value)) root.current?.focus();
      }
    }
    panelFocus.current = null;
  });
  if (controlled !== (options.value !== undefined)) throw new Error('Accordion cannot switch control modes.');
  // Event callbacks capture refs but never read them during render.
  /* oxlint-disable react/refs */
  const api = connectAccordion(
    service,
    roving,
    { ...options, id },
    {
      focus: (itemValue: string, event: FocusEvent<HTMLDivElement>) => {
        panelFocus.current = { value: itemValue, element: event.currentTarget };
      },
      blur: (event: FocusEvent<HTMLDivElement>) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) panelFocus.current = null;
      },
    },
  );
  /* oxlint-enable react/refs */
  return {
    ...api,
    getRootProps: (props: Parameters<typeof api.getRootProps>[0] = {}) =>
      api.getRootProps(mergeProps<'div'>(props, { ref: root })),
  };
}
export type { AccordionOptions } from "./accordion.machine";
export type AccordionApi = ReturnType<typeof useAccordion>;
