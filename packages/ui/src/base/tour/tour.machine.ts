import { createMachine } from '../_shared/core/index';
import type { MachineArgs, Transition } from '../_shared/core/index';

export type TourStatus = 'idle' | 'waiting' | 'running' | 'timed-out' | 'error' | 'completed' | 'skipped' | 'closed';
export type TourChangeReason = 'start' | 'next' | 'previous' | 'go' | 'completed' | 'skipped' | 'closed';
export interface TourChangeDetails {
  reason: TourChangeReason;
  previousStepId: string | null;
}
export interface TourTargetError {
  stepId: string;
  reason: 'timeout' | 'resolver-error';
  message?: string;
}
export interface TourStateOptions {
  stepId?: string | null;
  defaultStepId?: string | null;
  onStepChange?: (stepId: string | null, details: TourChangeDetails) => void;
  targetTimeout?: number;
  onTargetError?: (error: TourTargetError) => void;
}
export interface TourMachineProps extends TourStateOptions {
  stepIds: readonly string[];
}
type EndStatus = 'completed' | 'skipped' | 'closed';
export interface TourSchema {
  state: TourStatus;
  props: TourMachineProps;
  context: {
    stepId: string | null;
    observed: string | null;
    revision: number;
    pending: EndStatus | null;
    error: string | null;
  };
  event:
    | { type: 'START'; stepId?: string }
    | { type: 'NEXT' }
    | { type: 'PREVIOUS' }
    | { type: 'GO'; stepId: string }
    | { type: 'END'; reason: EndStatus }
    | { type: 'REQUEST'; stepId: string | null; reason: TourChangeReason; previousStepId: string | null }
    | { type: 'FOUND'; revision: number }
    | { type: 'LOST'; revision: number }
    | { type: 'TIMEOUT'; revision: number }
    | { type: 'FAIL'; revision: number; message: string }
    | { type: 'RETRY' };
}
export function tourStepId(props: TourMachineProps, context: TourSchema['context']) {
  const id = props.stepId === undefined ? context.stepId : props.stepId;
  return id !== null && props.stepIds.includes(id) ? id : null;
}
export function validateTourState(props: TourMachineProps) {
  if (props.stepIds.some((id) => !id.trim()) || new Set(props.stepIds).size !== props.stepIds.length)
    throw new Error('Tour step IDs must be nonempty and unique.');
  if (
    props.targetTimeout !== undefined &&
    (!Number.isFinite(props.targetTimeout) || props.targetTimeout < 0 || props.targetTimeout > 2_147_483_647)
  )
    throw new Error('Tour targetTimeout must be between 0 and 2147483647 ms.');
}
type Request = Extract<TourSchema['event'], { type: 'REQUEST' }>;
const notify = ({ props, event }: MachineArgs<TourSchema, Request>) =>
  props.onStepChange?.(event.stepId, { reason: event.reason, previousStepId: event.previousStepId });
const accepted = ({ context, event }: MachineArgs<TourSchema, Request>) => ({
  stepId: event.stepId,
  observed: event.stepId,
  revision: context.revision + 1,
  pending: null,
  error: null,
});
const validRequest = ({ props, context, event }: MachineArgs<TourSchema, Request>) =>
  tourStepId(props, context) !== event.stepId && (event.stepId === null || props.stepIds.includes(event.stepId));
const ends = ['completed', 'skipped', 'closed'] as const;
const terminalRequests: Transition<TourSchema, Request>[] = ends.map((status) => ({
  guard: (args) => validRequest(args) && args.event.stepId === null && args.event.reason === status,
  target: status,
  assign: accepted,
  actions: [notify],
}));

export const tourMachine = createMachine<TourSchema>({
  context: ({ props }) => {
    validateTourState(props);
    const initial = props.stepId !== undefined ? props.stepId : (props.defaultStepId ?? null);
    const observed = initial !== null && props.stepIds.includes(initial) ? initial : null;
    return { stepId: props.defaultStepId ?? null, observed, revision: 0, pending: null, error: null };
  },
  initial: ({ context }) => (context.observed === null ? 'idle' : 'waiting'),
  states: {
    idle: {},
    running: {},
    'timed-out': {},
    error: {},
    completed: {},
    skipped: {},
    closed: {},
    waiting: {
      effects: [
        ({ schedule, props, context }) => {
          schedule({ type: 'TIMEOUT', revision: context.revision }, props.targetTimeout ?? 5000);
        },
      ],
      on: {
        FOUND: { guard: ({ context, event }) => event.revision === context.revision, target: 'running' },
        TIMEOUT: {
          guard: ({ context, event }) => event.revision === context.revision,
          target: 'timed-out',
          actions: [
            ({ props, context }) => {
              if (context.observed) props.onTargetError?.({ stepId: context.observed, reason: 'timeout' });
            },
          ],
        },
        FAIL: {
          guard: ({ context, event }) => event.revision === context.revision,
          target: 'error',
          assign: ({ event }) => ({ error: event.message }),
          actions: [
            ({ props, context, event }) => {
              if (context.observed)
                props.onTargetError?.({ stepId: context.observed, reason: 'resolver-error', message: event.message });
            },
          ],
        },
      },
    },
  },
  onProps: [
    ...ends.map((status): Transition<TourSchema, import('../_shared/core/index').PropsEvent<TourSchema>> => ({
      guard: ({ props, context }) =>
        context.observed !== null && tourStepId(props, context) === null && (context.pending ?? 'closed') === status,
      target: status,
      assign: ({ props, context }) => ({
        observed: null,
        stepId: props.stepId === undefined ? null : context.stepId,
        revision: context.revision + 1,
        pending: null,
        error: null,
      }),
    })),
    {
      guard: ({ props, context }) => tourStepId(props, context) !== context.observed,
      target: 'waiting',
      reenter: true,
      assign: ({ props, context }) => ({
        observed: tourStepId(props, context),
        revision: context.revision + 1,
        pending: null,
        error: null,
      }),
    },
  ],
  on: {
    START: {
      actions: [
        ({ props, context, event, send }) => {
          const stepId = event.stepId ?? props.stepIds[0];
          if (stepId !== undefined)
            send({ type: 'REQUEST', stepId, previousStepId: tourStepId(props, context), reason: 'start' });
        },
      ],
    },
    GO: {
      actions: [
        ({ props, context, event, send }) =>
          send({ type: 'REQUEST', stepId: event.stepId, previousStepId: tourStepId(props, context), reason: 'go' }),
      ],
    },
    NEXT: {
      actions: [
        ({ props, context, send }) => {
          const previousStepId = tourStepId(props, context);
          if (previousStepId === null) return;
          const stepId = props.stepIds[props.stepIds.indexOf(previousStepId) + 1] ?? null;
          send({ type: 'REQUEST', stepId, previousStepId, reason: stepId === null ? 'completed' : 'next' });
        },
      ],
    },
    PREVIOUS: {
      actions: [
        ({ props, context, send }) => {
          const previousStepId = tourStepId(props, context);
          if (previousStepId === null) return;
          const stepId = props.stepIds[props.stepIds.indexOf(previousStepId) - 1];
          if (stepId !== undefined) send({ type: 'REQUEST', stepId, previousStepId, reason: 'previous' });
        },
      ],
    },
    END: {
      actions: [
        ({ props, context, event, send }) =>
          send({ type: 'REQUEST', stepId: null, previousStepId: tourStepId(props, context), reason: event.reason }),
      ],
    },
    REQUEST: [
      {
        guard: (args) => args.props.stepId !== undefined && validRequest(args),
        assign: ({ event }) => ({ pending: event.stepId === null ? (event.reason as EndStatus) : null }),
        actions: [notify],
      },
      ...terminalRequests,
      { guard: validRequest, target: 'waiting', reenter: true, assign: accepted, actions: [notify] },
    ],
    LOST: {
      guard: ({ value, context, event }) => value === 'running' && context.revision === event.revision,
      target: 'waiting',
      reenter: true,
      assign: ({ context }) => ({ revision: context.revision + 1, error: null }),
    },
    RETRY: {
      guard: ({ props, context }) => tourStepId(props, context) !== null,
      target: 'waiting',
      reenter: true,
      assign: ({ context }) => ({ revision: context.revision + 1, error: null }),
    },
  },
});
