import { mergeProps } from '../_shared/react/index';
import type { PropGetter } from '../_shared/react/index';
import type { RefCallback } from 'react';
import { presenceState } from './presence.machine';
import type { PresenceOptions, PresenceState } from './presence.machine';

export interface PresenceApi {
  readonly present: boolean;
  readonly mounted: boolean;
  readonly state: PresenceState;
  readonly ref: RefCallback<HTMLDivElement>;
  getPresenceProps: PropGetter<'div'>;
}

export function connectPresence(
  value: PresenceState,
  options: PresenceOptions,
  ref: RefCallback<HTMLDivElement>,
): PresenceApi {
  const state = presenceState(value, options);
  return {
    present: options.present,
    mounted: !!options.forceMount || state !== 'unmounted',
    state,
    ref,
    getPresenceProps(user = {}) {
      return mergeProps<'div'>(user, {
        ref,
        'data-scope': 'presence',
        'data-part': 'root',
        'data-state': state,
        'data-present': options.present,
      });
    },
  };
}
