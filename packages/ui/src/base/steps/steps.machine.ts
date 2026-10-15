import { createMachine } from "../_shared/core/index";
import type { MachineArgs } from "../_shared/core/index";

export type StepsLabels<Name extends string = string> = Readonly<Record<Name, string>>;
export type StepsValue<Name extends string = string> = Name | null;
export interface StepsChangeDetails<Name extends string = string> {
  from: StepsValue<Name>;
  to: StepsValue<Name>;
  reason: 'go' | 'reset';
}
export interface StepsOptions<Name extends string = string> {
  value?: StepsValue<Name>;
  defaultValue?: StepsValue<Name>;
  onValueChange?: (value: StepsValue<Name>, details: StepsChangeDetails<Name>) => void;
  disabled?: boolean;
  disabledSteps?: readonly Name[];
  canChange?: (details: StepsChangeDetails<Name>) => boolean;
  id?: string;
}
export interface StepsMachineProps extends StepsOptions {
  labels: StepsLabels;
}
export interface StepsSchema {
  state: 'idle';
  context: {
    value: StepsValue;
    initial: StepsValue;
    complete: boolean;
    initialComplete: boolean;
    visited: readonly string[];
  };
  props: StepsMachineProps;
  event: { type: 'GO'; value: StepsValue } | { type: 'RESET' } | { type: 'CHANGE'; details: StepsChangeDetails };
}

export function validateSteps(labels: StepsLabels) {
  for (const [name, label] of Object.entries(labels)) {
    if (!name.trim() || typeof label !== 'string' || !label.trim())
      throw new Error('Steps requires nonempty step names and text labels.');
  }
}
export const isStepEnabled = (props: StepsMachineProps, name: string) =>
  Object.hasOwn(props.labels, name) && !props.disabledSteps?.includes(name);
const firstStep = (props: StepsMachineProps) =>
  Object.keys(props.labels).find((name) => isStepEnabled(props, name)) ?? null;
const normalize = (props: StepsMachineProps, value: StepsValue, complete: boolean) =>
  value === null ? (complete ? null : firstStep(props)) : isStepEnabled(props, value) ? value : firstStep(props);
export const stepsValue = (props: StepsMachineProps, context: Readonly<StepsSchema['context']>) =>
  props.value === undefined
    ? normalize(props, context.value, context.complete)
    : normalize(props, props.value, props.value === null);
export function stepsVisited(props: StepsMachineProps, context: Readonly<StepsSchema['context']>) {
  const current = stepsValue(props, context);
  return [
    ...new Set([
      ...context.visited.filter((name) => Object.hasOwn(props.labels, name)),
      ...(current === null ? [] : [current]),
    ]),
  ];
}
type RequestEvent = Exclude<StepsSchema['event'], { type: 'CHANGE' }>;
const request = {
  guard: ({ props }: MachineArgs<StepsSchema, RequestEvent>) => !props.disabled,
  actions: [
    ({
      props,
      context,
      event,
      send,
    }: MachineArgs<StepsSchema, RequestEvent> & { send: (event: StepsSchema['event']) => void }) => {
      const from = stepsValue(props, context);
      const to = event.type === 'RESET' ? normalize(props, context.initial, context.initialComplete) : event.value;
      if (to === from && !(event.type === 'RESET' && context.visited.length > 1)) return;
      if (to !== null && !isStepEnabled(props, to)) return;
      send({ type: 'CHANGE', details: { from, to, reason: event.type === 'RESET' ? 'reset' : 'go' } });
    },
  ],
};
const change = {
  guard: ({ props, context, event }: MachineArgs<StepsSchema, Extract<StepsSchema['event'], { type: 'CHANGE' }>>) =>
    !props.disabled &&
    stepsValue(props, context) === event.details.from &&
    (event.details.to === null || isStepEnabled(props, event.details.to)) &&
    (props.canChange?.(event.details) ?? true),
  assign: ({ props, context, event }: MachineArgs<StepsSchema, Extract<StepsSchema['event'], { type: 'CHANGE' }>>) => {
    if (props.value !== undefined) return {};
    const value = event.details.to;
    return {
      value,
      complete: event.details.reason === 'reset' ? context.initialComplete : value === null,
      visited:
        event.details.reason === 'reset'
          ? value === null
            ? []
            : [value]
          : [...new Set([...context.visited, ...(value === null ? [] : [value])])],
    };
  },
  actions: [
    ({ props, event }: MachineArgs<StepsSchema, Extract<StepsSchema['event'], { type: 'CHANGE' }>>) =>
      props.onValueChange?.(event.details.to, event.details),
  ],
};
export const stepsMachine = createMachine<StepsSchema>({
  initial: 'idle',
  context: ({ props }) => {
    validateSteps(props.labels);
    const initialComplete = props.defaultValue === null;
    const initial = normalize(
      props,
      props.defaultValue === undefined ? firstStep(props) : props.defaultValue,
      initialComplete,
    );
    const value = props.value === undefined ? initial : normalize(props, props.value, props.value === null);
    return {
      value: props.value === undefined ? initial : null,
      initial,
      complete: initialComplete,
      initialComplete,
      visited: value === null ? [] : [value],
    };
  },
  states: { idle: {} },
  onProps: {
    guard: ({ props, context }) => {
      const visited = stepsVisited(props, context);
      return (
        (props.value === undefined && context.value !== stepsValue(props, context)) ||
        visited.length !== context.visited.length ||
        visited.some((name, index) => name !== context.visited[index])
      );
    },
    assign: ({ props, context }) => ({
      value: props.value === undefined ? stepsValue(props, context) : context.value,
      visited: stepsVisited(props, context),
    }),
  },
  on: { GO: request, RESET: request, CHANGE: change },
});
