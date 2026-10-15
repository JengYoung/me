import { MachineError } from "./errors";
import type { ErrorPhase } from "./errors";
import { record } from "./machine";
import type {
  Action,
  Actor,
  ActorOptions,
  Clock,
  Effect,
  Machine,
  MachineArgs,
  MachineEvent,
  MachineSchema,
  Snapshot,
  Transition,
  TransitionList,
  TransitionMap,
} from "./types";

const platformClock: Clock = {
  setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
};

interface Scope {
  active: boolean;
  controller: AbortController;
  cleanup?: () => void;
  timers: Set<() => void>;
}

type Command<S extends MachineSchema> =
  | { kind: 'event'; event: S['event']; scope?: Scope }
  | { kind: 'props'; props: Readonly<S['props']> }
  | { kind: 'start' | 'stop' | 'restart' }
  | { kind: 'error'; cause: unknown; scope: Scope };

function copy<T extends object>(value: T, label: string): Readonly<T> {
  return Object.freeze({ ...record(value, label) }) as Readonly<T>;
}

function equal(first: object, second: object): boolean {
  const keys = Reflect.ownKeys(first);
  return (
    keys.length === Reflect.ownKeys(second).length &&
    keys.every((key) => Object.hasOwn(second, key) && Object.is(Reflect.get(first, key), Reflect.get(second, key)))
  );
}

function synchronous(value: unknown): void {
  if (
    value &&
    (typeof value === 'object' || typeof value === 'function') &&
    'then' in value &&
    typeof value.then === 'function'
  ) {
    // Consume rejected promises as well: async callbacks are a contract error, not an unhandled rejection.
    void Promise.resolve(value).catch(() => {});
    throw new TypeError('Machine callbacks must be synchronous. Start async work inside an effect.');
  }
}

function eventCopy<E extends { type: string }>(event: E): E {
  const source = record(event, 'Event');
  if (typeof source.type !== 'string' || source.type.trim().length === 0 || source.type.startsWith('@iris.'))
    throw new TypeError('Events need a nonempty type outside the reserved @iris. namespace.');
  return Object.freeze({ ...source }) as E;
}

/** Creating an actor is side-effect free. start() acquires resources; stop() releases them. */
export function createActor<S extends MachineSchema>(machine: Machine<S>, options: ActorOptions<S>): Actor<S> {
  const clock = options.clock ?? platformClock;
  const maxSteps = options.maxSteps ?? 1_000;
  if (!Number.isSafeInteger(maxSteps) || maxSteps < 1) throw new TypeError('maxSteps must be a positive integer.');
  let props = copy(options.props, 'Props');

  function initialize(): Snapshot<S> {
    const initialContext = machine.context({ props });
    synchronous(initialContext);
    const context = copy(initialContext, 'Context');
    const value = typeof machine.initial === 'function' ? machine.initial({ props, context }) : machine.initial;
    synchronous(value);
    if (typeof value !== 'string' || !Object.hasOwn(machine.states, value))
      throw new TypeError(`Unknown initial state: ${String(value)}`);
    return Object.freeze({ value, context, status: 'not-started', error: null });
  }

  let snapshot = initialize();
  const initialSnapshot = snapshot;
  const queue: Command<S>[] = [];
  const listeners = new Set<{ listener: (snapshot: Snapshot<S>) => void }>();
  const rootScopes: Scope[] = [],
    stateScopes: Scope[] = [];
  let processing = false;
  let currentEvent: MachineEvent<S> | undefined;

  const getSnapshot = () => snapshot;
  const getProps = () => props;

  function error(phase: ErrorPhase, cause: unknown): MachineError {
    return cause instanceof MachineError ? cause : new MachineError(phase, snapshot.value, currentEvent?.type, cause);
  }

  function report(failure: MachineError): void {
    try {
      if (options.onError) synchronous(options.onError(failure));
      else console.error(failure);
    } catch (observerError) {
      console.error(observerError);
    }
  }

  function call<T>(phase: ErrorPhase, callback: () => T): T {
    try {
      const result = callback();
      synchronous(result);
      return result;
    } catch (cause) {
      throw error(phase, cause);
    }
  }

  function notify(): void {
    const currentListeners = [...listeners];
    for (const entry of currentListeners) {
      if (!listeners.has(entry)) continue;
      try {
        synchronous(entry.listener(snapshot));
      } catch (cause) {
        report(error('subscriber', cause));
      }
    }
  }

  function args(): MachineArgs<S> {
    return { value: snapshot.value, context: snapshot.context, props, event: currentEvent! };
  }

  function actions(entries: readonly Action<S>[] | undefined): void {
    for (const action of entries ?? []) call('action', () => action({ ...args(), send }));
  }

  function dispose(scopes: Scope[]): MachineError[] {
    const failures: MachineError[] = [];
    const active = scopes.splice(0).reverse();
    // Invalidate every sender before invoking any user cleanup.
    for (const scope of active) scope.active = false;
    for (const scope of active) {
      const cleanups = [() => scope.controller.abort(), ...scope.timers, ...(scope.cleanup ? [scope.cleanup] : [])];
      for (const cleanup of cleanups) {
        try {
          call('cleanup', cleanup);
        } catch (cause) {
          failures.push(error('cleanup', cause));
        }
      }
      scope.timers.clear();
    }
    return failures;
  }

  function release(scopes: Scope[]): void {
    const failures = dispose(scopes);
    if (failures.length)
      throw new MachineError('cleanup', snapshot.value, currentEvent?.type, new AggregateError(failures));
  }

  function effects(entries: readonly Effect<S>[] | undefined, scopes: Scope[]): void {
    for (const effect of entries ?? []) {
      const scope: Scope = { active: true, controller: new AbortController(), timers: new Set() };
      scopes.push(scope);
      const active = () => scope.active && snapshot.status === 'active';
      const sendScoped = (event: S['event']) => {
        if (active()) enqueue({ kind: 'event', event: eventCopy(event), scope });
      };
      const cleanup = call('effect', () =>
        effect({
          ...args(),
          signal: scope.controller.signal,
          getSnapshot,
          getProps,
          send: sendScoped,
          reportError: (cause) => {
            if (active()) enqueue({ kind: 'error', cause, scope });
          },
          schedule(event, delay) {
            if (!Number.isFinite(delay) || delay < 0 || delay > 2_147_483_647)
              throw new TypeError('Timer delay must be between 0 and 2147483647 milliseconds.');
            const captured = eventCopy(event);
            if (!active()) return () => {};
            let pending = true,
              handle: unknown;
            const cancel = () => {
              if (!pending) return;
              pending = false;
              scope.timers.delete(cancel);
              clock.clearTimeout(handle);
            };
            scope.timers.add(cancel);
            handle = clock.setTimeout(() => {
              if (!pending) return;
              pending = false;
              scope.timers.delete(cancel);
              sendScoped(captured);
            }, delay);
            return cancel;
          },
        }),
      );
      if (cleanup !== undefined && typeof cleanup !== 'function')
        throw error('effect', new TypeError('Effects must return a cleanup function or undefined.'));
      scope.cleanup = typeof cleanup === 'function' ? cleanup : undefined;
    }
  }

  function lookup(map: TransitionMap<S> | undefined, type: string): TransitionList<S> | undefined {
    return map && Object.hasOwn(map, type) ? (map as unknown as Record<string, TransitionList<S>>)[type] : undefined;
  }

  function transition(candidates: TransitionList<S> | undefined): void {
    if (!candidates) return;
    const entries: readonly Transition<S>[] = Array.isArray(candidates) ? candidates : [candidates as Transition<S>];
    const selected = entries.find((entry) => {
      if (!entry.guard) return true;
      return call('guard', () => {
        const allowed = entry.guard!(args());
        if (typeof allowed !== 'boolean') {
          synchronous(allowed);
          throw new TypeError('Guards must return boolean.');
        }
        return allowed;
      });
    });
    if (!selected) return;
    const value = selected.target ?? snapshot.value;
    let context = snapshot.context;
    if (selected.assign) {
      context = call('assign', () => {
        const patch = selected.assign!(args());
        synchronous(patch);
        const next = { ...snapshot.context, ...record(patch, 'Context assignment') };
        return equal(snapshot.context, next) ? snapshot.context : Object.freeze(next);
      });
    }
    const reenter = value !== snapshot.value || selected.reenter === true;
    if (reenter) {
      release(stateScopes);
      actions(machine.states[snapshot.value].exit);
    }
    if (value !== snapshot.value || context !== snapshot.context)
      snapshot = Object.freeze({ ...snapshot, value, context });
    actions(selected.actions);
    if (reenter) {
      actions(machine.states[snapshot.value].entry);
      effects(machine.states[snapshot.value].effects, stateScopes);
    }
  }

  function start(): void {
    enqueue({ kind: 'start' });
  }
  function stop(): void {
    enqueue({ kind: 'stop' });
  }

  function startNow(): void {
    if (snapshot.status === 'active' || snapshot.status === 'error') return;
    currentEvent = { type: '@iris.start' };
    snapshot = Object.freeze({ ...snapshot, status: 'active' });
    actions(machine.entry);
    actions(machine.states[snapshot.value].entry);
    effects(machine.effects, rootScopes);
    effects(machine.states[snapshot.value].effects, stateScopes);
  }

  function stopNow(): void {
    // Cancel work from the previous lifetime while preserving ordered props/lifecycle commands.
    for (let index = queue.length - 1; index >= 0; index--)
      if (queue[index]!.kind === 'event' || queue[index]!.kind === 'error') queue.splice(index, 1);
    if (snapshot.status === 'stopped' || snapshot.status === 'error') return;
    const wasActive = snapshot.status === 'active';
    currentEvent = { type: '@iris.stop' };
    snapshot = Object.freeze({ ...snapshot, status: 'stopped' });
    if (!wasActive) return;
    const failures = dispose(stateScopes);
    try {
      actions(machine.states[snapshot.value].exit);
    } catch (cause) {
      failures.push(error('action', cause));
    }
    failures.push(...dispose(rootScopes));
    try {
      actions(machine.exit);
    } catch (cause) {
      failures.push(error('action', cause));
    }
    if (failures.length)
      throw new MachineError('cleanup', snapshot.value, currentEvent.type, new AggregateError(failures));
  }

  function fail(failure: MachineError): void {
    queue.length = 0;
    snapshot = Object.freeze({ ...snapshot, status: 'error', error: failure });
    const cleanupErrors = [...dispose(stateScopes), ...dispose(rootScopes)];
    report(failure);
    cleanupErrors.forEach(report);
  }

  function process(command: Command<S>): void {
    switch (command.kind) {
      case 'start':
        startNow();
        break;
      case 'stop':
        stopNow();
        break;
      case 'restart':
        stopNow();
        snapshot = call('initialization', initialize);
        startNow();
        break;
      case 'props': {
        if (equal(props, command.props)) return;
        const previous = props;
        props = command.props;
        currentEvent = { type: '@iris.props', previous };
        if (snapshot.status === 'active') transition(machine.onProps as TransitionList<S> | undefined);
        break;
      }
      case 'event': {
        if (snapshot.status !== 'active' || (command.scope && !command.scope.active)) return;
        currentEvent = command.event;
        const local = lookup(machine.states[snapshot.value].on, command.event.type);
        transition(local ?? lookup(machine.on, command.event.type));
        break;
      }
      case 'error':
        if (command.scope.active && snapshot.status === 'active') throw error('effect', command.cause);
    }
  }

  function enqueue(command: Command<S>): void {
    queue.push(command);
    if (processing) return;
    processing = true;
    let steps = 0;
    try {
      while (queue.length) {
        if (++steps > maxSteps) {
          fail(error('queue', new Error(`Exceeded ${maxSteps} synchronous commands.`)));
          notify();
          break;
        }
        const previous = snapshot;
        currentEvent = undefined;
        try {
          process(queue.shift()!);
        } catch (cause) {
          fail(error('action', cause));
        }
        if (snapshot !== previous) notify();
      }
    } finally {
      processing = false;
      currentEvent = undefined;
      queue.length = 0;
    }
  }

  function send(event: S['event']): void {
    const captured = eventCopy(event);
    if (snapshot.status === 'active') enqueue({ kind: 'event', event: captured });
  }

  return {
    getSnapshot,
    getInitialSnapshot: () => initialSnapshot,
    getProps,
    send,
    start,
    stop,
    restart: () => enqueue({ kind: 'restart' }),
    updateProps: (value) => enqueue({ kind: 'props', props: copy(value, 'Props') }),
    subscribe(listener) {
      const entry = { listener };
      listeners.add(entry);
      return () => {
        listeners.delete(entry);
      };
    },
  };
}
