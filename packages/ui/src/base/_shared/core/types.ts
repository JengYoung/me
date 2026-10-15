import type { MachineError } from "./errors";

export interface EventObject {
  readonly type: string;
}

/** Declare the complete, finite state union and a discriminated event union. */
export interface MachineSchema {
  state: string;
  context: object;
  event: EventObject;
  props: object;
}

export type LifecycleEvent = { readonly type: '@iris.start' } | { readonly type: '@iris.stop' };
export interface PropsEvent<S extends MachineSchema> {
  readonly type: '@iris.props';
  readonly previous: Readonly<S['props']>;
}
export type MachineEvent<S extends MachineSchema> = S['event'] | LifecycleEvent | PropsEvent<S>;

export interface Snapshot<S extends MachineSchema> {
  readonly value: S['state'];
  readonly context: Readonly<S['context']>;
  readonly status: 'not-started' | 'active' | 'stopped' | 'error';
  readonly error: MachineError | null;
}

export interface MachineArgs<S extends MachineSchema, E = MachineEvent<S>> {
  readonly value: S['state'];
  readonly context: Readonly<S['context']>;
  readonly props: Readonly<S['props']>;
  readonly event: E;
}

/** Guards and assignments must be synchronous and pure. */
export type Guard<S extends MachineSchema, E = MachineEvent<S>> = (args: MachineArgs<S, E>) => boolean;
export type Assignment<S extends MachineSchema, E = MachineEvent<S>> = (
  args: MachineArgs<S, E>,
) => Partial<S['context']>;
export type Action<S extends MachineSchema, E = MachineEvent<S>> = (
  args: MachineArgs<S, E> & { readonly send: (event: S['event']) => void },
) => void;

export interface EffectArgs<S extends MachineSchema> extends MachineArgs<S> {
  readonly signal: AbortSignal;
  /** Sends from a disposed effect, including late async results, are ignored. */
  send(event: S['event']): void;
  /** A one-shot event timer owned by this effect; disposal cancels it automatically. */
  schedule(event: S['event'], delay: number): () => void;
  getSnapshot(): Snapshot<S>;
  getProps(): Readonly<S['props']>;
  reportError(cause: unknown): void;
}

/** Setup is synchronous. Start async work inside and use signal/send/reportError. */
export type Effect<S extends MachineSchema> = (args: EffectArgs<S>) => void | (() => void);

export interface Transition<S extends MachineSchema, E = MachineEvent<S>> {
  readonly target?: S['state'];
  readonly guard?: Guard<S, E>;
  readonly assign?: Assignment<S, E>;
  readonly actions?: readonly Action<S, E>[];
  /** Same-state targets are internal unless reenter is explicitly true. */
  readonly reenter?: boolean;
}
export type TransitionList<S extends MachineSchema, E = MachineEvent<S>> =
  | Transition<S, E>
  | readonly Transition<S, E>[];
export type TransitionMap<S extends MachineSchema> = {
  readonly [K in S['event']['type']]?: TransitionList<S, Extract<S['event'], { type: K }>>;
};

export interface StateNode<S extends MachineSchema> {
  readonly on?: TransitionMap<S>;
  readonly entry?: readonly Action<S>[];
  readonly exit?: readonly Action<S>[];
  readonly effects?: readonly Effect<S>[];
}

export interface MachineDefinition<S extends MachineSchema> {
  readonly id?: string;
  readonly context: (args: { readonly props: Readonly<S['props']> }) => S['context'];
  readonly initial:
    | S['state']
    | ((args: { readonly props: Readonly<S['props']>; readonly context: Readonly<S['context']> }) => S['state']);
  readonly states: { readonly [K in S['state']]: StateNode<S> };
  readonly on?: TransitionMap<S>;
  readonly onProps?: TransitionList<S, PropsEvent<S>>;
  readonly entry?: readonly Action<S>[];
  readonly exit?: readonly Action<S>[];
  readonly effects?: readonly Effect<S>[];
}

export type Machine<S extends MachineSchema> = Readonly<MachineDefinition<S>>;

/** Implementations must schedule asynchronously, just like the platform timer. */
export interface Clock {
  setTimeout(callback: () => void, delay: number): unknown;
  clearTimeout(handle: unknown): void;
}

export interface ActorOptions<S extends MachineSchema> {
  props: S['props'];
  clock?: Clock;
  onError?: (error: MachineError) => void;
  /** Bounds synchronous reentrant loops; defaults to 1,000 commands per drain. */
  maxSteps?: number;
}

export interface Actor<S extends MachineSchema> {
  getSnapshot(): Snapshot<S>;
  getInitialSnapshot(): Snapshot<S>;
  getProps(): Readonly<S['props']>;
  send(event: S['event']): void;
  updateProps(props: S['props']): void;
  start(): void;
  stop(): void;
  restart(): void;
  subscribe(listener: (snapshot: Snapshot<S>) => void): () => void;
}
