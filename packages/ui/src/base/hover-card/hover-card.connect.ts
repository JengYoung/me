import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RefObject } from 'react';
import type { ModalFocusApi } from "../_shared/focus/index";
import type { usePosition } from "../_shared/positioning/index";
import type { HoverCardSchema } from "./hover-card.machine";
export function connectHoverCard(
  state: { open: boolean; setOpen: (open: boolean) => void; dismiss: () => void; service: MachineApi<HoverCardSchema> },
  focus: ModalFocusApi,
  position: ReturnType<typeof usePosition>,
  options: { id: string; dir: 'ltr' | 'rtl' },
  refs: {
    trigger: HTMLAnchorElement | null;
    content: HTMLDivElement | null;
    setTrigger: (node: HTMLAnchorElement | null) => void;
    setContent: (node: HTMLDivElement | null) => void;
    touch: RefObject<boolean>;
  },
) {
  const { send } = state.service;
  const attributes = (part: string) => ({
    'data-scope': 'hover-card',
    'data-part': part,
    'data-state': state.open ? 'open' : 'closed',
  });
  const inside = (node: EventTarget | null) =>
    node instanceof (refs.trigger?.ownerDocument.defaultView?.Node ?? Node) &&
    (refs.trigger?.contains(node) || refs.content?.contains(node));
  return {
    open: state.open,
    setOpen: state.setOpen,
    dismiss: state.dismiss,
    scope: focus.scope,
    placement: position.placement,
    updatePosition: position.update,
    getTriggerProps(props: PartProps<'a'> = {}): PartProps<'a'> {
      return mergeProps<'a'>(props, {
        ...attributes('trigger'),
        id: `${options.id}-trigger`,
        ref: refs.setTrigger,
        'aria-controls': state.open ? `${options.id}-content` : undefined,
        onPointerEnter: (event) => {
          if (event.pointerType !== 'touch') send({ type: 'HOVER', part: 'trigger', hovered: true });
        },
        onPointerLeave: (event) => {
          if (event.pointerType !== 'touch') send({ type: 'HOVER', part: 'trigger', hovered: false });
        },
        onPointerDown: (event) => {
          refs.touch.current = event.pointerType === 'touch';
          if (refs.touch.current) state.dismiss();
        },
        onFocus: () => {
          if (!refs.touch.current) send({ type: 'FOCUS', focused: true });
        },
        onBlur: (event) => {
          refs.touch.current = false;
          if (!inside(event.relatedTarget)) send({ type: 'FOCUS', focused: false });
        },
        onClick: state.dismiss,
        onKeyDown: (event) => {
          if (event.key === 'Escape' && !event.nativeEvent.isComposing) {
            event.preventDefault();
            event.stopPropagation();
            state.dismiss();
          }
        },
      });
    },
    getContentProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return focus.getContentProps(
        mergeProps<'div'>(props, {
          ...attributes('content'),
          id: `${options.id}-content`,
          ref: refs.setContent,
          role: 'group',
          'aria-labelledby': props['aria-labelledby'] ?? (props['aria-label'] ? undefined : `${options.id}-trigger`),
          hidden: !state.open,
          dir: options.dir,
          style: position.style,
          'data-placement': position.placement,
          onPointerEnter: (event) => {
            if (event.pointerType !== 'touch') send({ type: 'HOVER', part: 'content', hovered: true });
          },
          onPointerLeave: (event) => {
            if (event.pointerType !== 'touch') send({ type: 'HOVER', part: 'content', hovered: false });
          },
          onFocus: () => send({ type: 'FOCUS', focused: true }),
          onBlur: (event) => {
            if (!inside(event.relatedTarget)) send({ type: 'FOCUS', focused: false });
          },
        }),
      );
    },
  };
}
export type HoverCardApi = ReturnType<typeof connectHoverCard>;
