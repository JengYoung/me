import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RefObject } from 'react';
import type { MessageScrollerOptions, MessageScrollerSchema, MessageScrollPosition } from "./message-scroller.machine";

export interface MessageScrollOptions {
  behavior?: 'instant' | 'smooth';
  align?: 'start' | 'center' | 'end';
}
export interface MessageScrollerBindings {
  refs: { viewport: RefObject<HTMLDivElement | null>; content: RefObject<HTMLDivElement | null> };
  viewportRef: (element: HTMLDivElement | null) => void;
  contentRef: (element: HTMLDivElement | null) => void;
  onScroll: () => void;
  interrupt: () => void;
  measure: () => void;
  scrollToMessage: (id: string, options?: MessageScrollOptions) => boolean;
  scrollToLatest: (options?: Pick<MessageScrollOptions, 'behavior'>) => void;
  getScrollPosition: () => MessageScrollPosition | null;
  restoreScrollPosition: (position: MessageScrollPosition) => boolean;
}
export function connectMessageScroller(
  service: MachineApi<MessageScrollerSchema>,
  options: MessageScrollerOptions & { id: string },
  dom: MessageScrollerBindings,
) {
  const following = service.state.value === 'following';
  return {
    following,
    ...service.state.context,
    refs: dom.refs,
    measure: dom.measure,
    scrollToMessage: dom.scrollToMessage,
    scrollToLatest: dom.scrollToLatest,
    getScrollPosition: dom.getScrollPosition,
    restoreScrollPosition: dom.restoreScrollPosition,
    getViewportProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ref: dom.viewportRef,
        id: options.id,
        role: 'region',
        tabIndex: 0,
        'aria-live': 'off',
        'data-scope': 'message-scroller',
        'data-part': 'viewport',
        'data-following': following,
        'data-new-messages': service.state.context.hasNewMessages,
        onScroll: (event) => {
          if (event.target === event.currentTarget) dom.onScroll();
        },
        onWheel: (event) => {
          if (
            event.target instanceof Node &&
            (event.target as Element).closest?.('[data-scope="message-scroller"][data-part="viewport"]') !==
              event.currentTarget
          )
            return;
          dom.interrupt();
          if (event.deltaY < 0) service.send({ type: 'FOLLOW', following: false });
        },
        onTouchStart: dom.interrupt,
        onPointerDown: dom.interrupt,
        onKeyDown: (event) => {
          if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
          if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) dom.interrupt();
          if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) service.send({ type: 'FOLLOW', following: false });
        },
      });
    },
    getContentProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ref: dom.contentRef,
        'data-scope': 'message-scroller',
        'data-part': 'content',
      });
    },
    getMessageProps(messageId: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      if (!options.messageIds.includes(messageId)) throw new Error(`Unknown Message Scroller message: ${messageId}`);
      return mergeProps<'div'>(props, {
        id: `${options.id}-message-${encodeURIComponent(messageId)}`,
        'data-scope': 'message-scroller',
        'data-part': 'message',
        'data-message-id': messageId,
      });
    },
    getLatestButtonProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(props, {
        type: 'button',
        'aria-controls': options.id,
        'aria-disabled': following && service.state.context.atBottom,
        'aria-label': props['aria-label'] ?? 'Scroll to latest',
        'data-scope': 'message-scroller',
        'data-part': 'latest-button',
        'data-new-messages': service.state.context.hasNewMessages,
        onClick: () => dom.scrollToLatest(),
      });
    },
    /** Append completed messages here; transcript scrolling never mutates this live region. */
    getAnnouncerProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        role: 'log',
        'aria-live': 'polite',
        'aria-atomic': false,
        'aria-relevant': 'additions',
        'data-scope': 'message-scroller',
        'data-part': 'announcer',
      });
    },
  };
}
export type MessageScrollerApi = ReturnType<typeof connectMessageScroller>;
