'use client';
import { useMachine, useStableId } from '../_shared/react/index';
import { useRovingFocus } from '../_shared/keyboard/index';
import { useRef } from 'react';
import { feedMachine, feedFocused, validateFeed } from './feed.machine';
import type { FeedOptions } from './feed.machine';
import { connectFeed } from './feed.connect';
export function useFeed(options: FeedOptions) {
  validateFeed(options);
  const id = useStableId('iris-feed', options.id);
  const service = useMachine(feedMachine, { props: options });
  const root = useRef<HTMLDivElement | null>(null);
  const roving = useRovingFocus({
    items: options.items,
    value: feedFocused(options, service.state.context),
    keyboard: false,
    focusWithin: true,
    onValueChange: (value) => {
      if (value !== null) service.send({ type: 'FOCUS', value });
    },
  });
  // connect only reads this DOM ref in committed event handlers.
  // oxlint-disable-next-line react/refs
  return connectFeed(service, roving, { ...options, id }, root);
}
export type { FeedOptions, FeedItem } from './feed.machine';
export type { FeedApi } from './feed.connect';
