import type { Machine, MachineDefinition, MachineSchema } from "./types";

export function record(value: unknown, label: string): Record<string, unknown> {
  if (
    value === null ||
    typeof value !== 'object' ||
    (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
  )
    throw new TypeError(`${label} must be a plain object.`);
  return value as Record<string, unknown>;
}

function fields(value: Record<string, unknown>, allowed: string[], label: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new TypeError(`Unsupported ${label} field: ${key}`);
  }
}

function functions(value: unknown, label: string): readonly unknown[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'function'))
    throw new TypeError(`${label} must be an array of synchronous functions.`);
  return Object.freeze([...value]);
}

/** Validate and copy the graph so later edits to the input definition cannot change an actor. */
export function createMachine<S extends MachineSchema>(definition: MachineDefinition<S>): Machine<S> {
  const source = record(definition, 'Machine');
  fields(source, ['id', 'initial', 'context', 'states', 'on', 'onProps', 'entry', 'exit', 'effects'], 'machine');
  if (source.id !== undefined && (typeof source.id !== 'string' || source.id.length === 0))
    throw new TypeError('Machine id must be a nonempty string.');
  if (typeof source.context !== 'function') throw new TypeError('Context must be a per-actor factory.');
  const states = record(source.states, 'States');
  if (Object.keys(states).length === 0 || Object.keys(states).some((key) => key.trim().length === 0))
    throw new TypeError('Define at least one named state.');
  if (
    typeof source.initial !== 'function' &&
    (typeof source.initial !== 'string' || !Object.hasOwn(states, source.initial))
  )
    throw new TypeError(`Unknown initial state: ${String(source.initial)}`);

  function transitions(value: unknown): unknown {
    const entries: unknown[] = Array.isArray(value) ? value : [value];
    if (entries.length === 0) throw new TypeError('A transition list cannot be empty. Use {} to ignore an event.');
    const result = entries.map((entry, index) => {
      const transition = record(entry, 'Transition');
      fields(transition, ['target', 'guard', 'assign', 'actions', 'reenter'], 'transition');
      if (
        transition.target !== undefined &&
        (typeof transition.target !== 'string' || !Object.hasOwn(states, transition.target))
      )
        throw new TypeError(`Unknown transition target: ${String(transition.target)}`);
      for (const field of ['guard', 'assign']) {
        if (transition[field] !== undefined && typeof transition[field] !== 'function')
          throw new TypeError(`${field} must be a synchronous function.`);
      }
      if (transition.reenter !== undefined && typeof transition.reenter !== 'boolean')
        throw new TypeError('reenter must be boolean.');
      if (transition.guard === undefined && index !== entries.length - 1)
        throw new TypeError('An unconditional transition must be the last candidate.');
      return Object.freeze({ ...transition, actions: functions(transition.actions, 'Actions') });
    });
    return Array.isArray(value) ? Object.freeze(result) : result[0];
  }

  function on(value: unknown): unknown {
    if (value === undefined) return undefined;
    return Object.freeze(
      Object.fromEntries(
        Object.entries(record(value, 'Event map')).map(([type, entry]) => {
          if (type.trim().length === 0 || type.startsWith('@iris.'))
            throw new TypeError(`Invalid or reserved event type: ${type}`);
          return [type, transitions(entry)];
        }),
      ),
    );
  }

  const copiedStates = Object.fromEntries(
    Object.entries(states).map(([name, value]) => {
      const node = record(value, `State ${name}`);
      fields(node, ['on', 'entry', 'exit', 'effects'], 'state (flat states only)');
      return [
        name,
        Object.freeze({
          on: on(node.on),
          entry: functions(node.entry, 'Entry actions'),
          exit: functions(node.exit, 'Exit actions'),
          effects: functions(node.effects, 'Effects'),
        }),
      ];
    }),
  );
  return Object.freeze({
    ...source,
    states: Object.freeze(copiedStates),
    on: on(source.on),
    onProps: source.onProps === undefined ? undefined : transitions(source.onProps),
    entry: functions(source.entry, 'Entry actions'),
    exit: functions(source.exit, 'Exit actions'),
    effects: functions(source.effects, 'Effects'),
  }) as unknown as Machine<S>;
}
