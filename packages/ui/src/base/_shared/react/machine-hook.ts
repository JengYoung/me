'use client';

import { createActor } from '../core/index';
import type { Actor, ActorOptions, Machine, MachineSchema, Snapshot } from '../core/index';
import { useState, useSyncExternalStore } from 'react';
import { useCommitEffect } from './use-commit-effect';

export interface MachineApi<S extends MachineSchema> extends Pick<Actor<S>, 'send' | 'getSnapshot' | 'getProps'> {
  readonly state: Snapshot<S>;
}

/** Capture the definition/options once; synchronize props only after a committed render. */
export function useMachine<S extends MachineSchema>(machine: Machine<S>, options: ActorOptions<S>): MachineApi<S> {
  const [actor] = useState(() => createActor(machine, options));
  const state = useSyncExternalStore(actor.subscribe, actor.getSnapshot, actor.getInitialSnapshot);
  useCommitEffect(() => actor.updateProps(options.props), [actor, options.props]);
  useCommitEffect(() => {
    actor.start();
    return actor.stop;
  }, [actor]);
  return { state, send: actor.send, getSnapshot: actor.getSnapshot, getProps: actor.getProps };
}
