import { createMachine } from '../_shared/core/index';

export interface MessageScrollPosition {
  messageId: string | null;
  /** Message top relative to the viewport's inner top edge, in CSS pixels. */
  offset: number;
  scrollTop: number;
  following: boolean;
}
export interface MessageScrollerOptions {
  messageIds: readonly string[];
  id?: string;
  defaultFollowing?: boolean;
  initialPosition?: MessageScrollPosition;
  bottomThreshold?: number;
  onFollowingChange?: (following: boolean) => void;
}
export interface MessageScrollerSchema {
  state: 'following' | 'detached';
  props: MessageScrollerOptions;
  context: { atBottom: boolean; hasNewMessages: boolean };
  event: { type: 'FOLLOW'; following: boolean } | { type: 'POSITION'; atBottom: boolean } | { type: 'CONTENT' };
}
export function validateMessageScroller(options: MessageScrollerOptions) {
  if (options.messageIds.some((id) => !id) || new Set(options.messageIds).size !== options.messageIds.length)
    throw new Error('Message IDs must be non-empty and unique.');
  if (
    options.bottomThreshold !== undefined &&
    (!Number.isFinite(options.bottomThreshold) || options.bottomThreshold < 0)
  )
    throw new Error('Message Scroller bottomThreshold must be finite and non-negative.');
  const position = options.initialPosition;
  if (position && (!Number.isFinite(position.offset) || !Number.isFinite(position.scrollTop)))
    throw new Error('Message scroll positions must be finite.');
}
export const messageScrollerMachine = createMachine<MessageScrollerSchema>({
  initial: ({ props }) =>
    (props.initialPosition?.following ?? props.defaultFollowing ?? true) ? 'following' : 'detached',
  context: () => ({ atBottom: false, hasNewMessages: false }),
  states: { following: {}, detached: {} },
  on: {
    FOLLOW: [
      {
        guard: ({ event, value }) => event.following && value !== 'following',
        target: 'following',
        assign: () => ({ hasNewMessages: false }),
        actions: [({ props }) => props.onFollowingChange?.(true)],
      },
      {
        guard: ({ event, value }) => !event.following && value !== 'detached',
        target: 'detached',
        actions: [({ props }) => props.onFollowingChange?.(false)],
      },
    ],
    POSITION: {
      assign: ({ event, context, value }) => ({
        atBottom: event.atBottom,
        hasNewMessages: value === 'following' && event.atBottom ? false : context.hasNewMessages,
      }),
    },
    CONTENT: { guard: ({ value }) => value === 'detached', assign: () => ({ hasNewMessages: true }) },
  },
});
