import { createMachine, recoverValue, sameCollection, validateCollection } from '../_shared/core/index';
export interface FeedItem {
  readonly value: string;
  readonly position?: number;
  readonly description?: boolean;
}
export interface FeedOptions {
  items: readonly FeedItem[];
  totalSize?: number;
  busy?: boolean;
  hasMore?: boolean;
  loadAhead?: number;
  onLoadMore?: () => void;
  onFocusChange?: (value: string) => void;
  beforeId?: string;
  afterId?: string;
  id?: string;
}
export interface FeedSchema {
  state: 'idle' | 'loading';
  props: FeedOptions;
  context: { focused: string | null; items: readonly FeedItem[]; requested: boolean; wasBusy: boolean };
  event: { type: 'FOCUS'; value: string } | { type: 'REQUEST_MORE' };
}
export function validateFeed(props: FeedOptions) {
  validateCollection(props.items);
  if (
    props.totalSize !== undefined &&
    props.totalSize !== -1 &&
    (!Number.isInteger(props.totalSize) || props.totalSize < 0)
  )
    throw new Error('Feed totalSize must be a nonnegative integer or -1.');
  if (props.loadAhead !== undefined && (!Number.isInteger(props.loadAhead) || props.loadAhead < 1))
    throw new Error('Feed loadAhead must be a positive integer.');
  let previous = 0;
  for (const [index, item] of props.items.entries()) {
    const position = item.position ?? index + 1;
    if (
      !Number.isInteger(position) ||
      position <= previous ||
      (props.totalSize !== undefined && props.totalSize !== -1 && position > props.totalSize)
    )
      throw new Error('Feed positions must increase and fit totalSize.');
    previous = position;
  }
}
export const feedFocused = (props: FeedOptions, context: FeedSchema['context']) =>
  recoverValue(props.items, context.items, context.focused);
function reconcile(props: FeedOptions, context: FeedSchema['context']) {
  const same = sameCollection(props.items, context.items);
  return {
    focused: feedFocused(props, context),
    items: same ? context.items : props.items,
    requested: !same || (context.wasBusy && !props.busy) ? false : context.requested,
    wasBusy: !!props.busy,
  };
}
export const feedMachine = createMachine<FeedSchema>({
  initial: ({ props }) => (props.busy ? 'loading' : 'idle'),
  context: ({ props }) => {
    validateFeed(props);
    return { focused: null, items: props.items, requested: false, wasBusy: !!props.busy };
  },
  states: { idle: {}, loading: {} },
  onProps: [
    {
      guard: ({ props }) => !!props.busy,
      target: 'loading',
      assign: ({ props, context }) => reconcile(props, context),
    },
    { target: 'idle', assign: ({ props, context }) => reconcile(props, context) },
  ],
  on: {
    FOCUS: {
      guard: ({ props, event }) => props.items.some((item) => item.value === event.value),
      assign: ({ event }) => ({ focused: event.value }),
      actions: [
        ({ props, event, send }) => {
          props.onFocusChange?.(event.value);
          if (
            props.items.findIndex((item) => item.value === event.value) >=
            props.items.length - (props.loadAhead ?? 1)
          )
            send({ type: 'REQUEST_MORE' });
        },
      ],
    },
    REQUEST_MORE: {
      guard: ({ props, context }) => !!props.hasMore && !!props.onLoadMore && !props.busy && !context.requested,
      assign: () => ({ requested: true }),
      actions: [({ props }) => props.onLoadMore?.()],
    },
  },
});
