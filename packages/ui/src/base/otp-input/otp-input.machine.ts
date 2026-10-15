import { createMachine } from "../_shared/core/index";
import type { MachineArgs } from "../_shared/core/index";

export interface OtpInputBehaviorOptions {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  /** Pure predicate, called for each Unicode code point. Defaults to ASCII digits. */
  allowCharacter?: (character: string) => boolean;
  disabled?: boolean;
  readOnly?: boolean;
}
export function normalizeOtp(value: string, props: OtpInputBehaviorOptions) {
  return Array.from(value)
    .filter(props.allowCharacter ?? ((character) => /^[0-9]$/.test(character)))
    .slice(0, props.length ?? 6)
    .join('');
}
export interface OtpInputSchema {
  state: 'idle' | 'focused';
  props: OtpInputBehaviorOptions;
  context: {
    value: string | null;
    defaultValue: string;
    draft: string | null;
    draftBase: string | null;
    start: number;
    end: number;
    lastComplete: string | null;
    requested: string;
    notify: boolean;
    completed: string | null;
  };
  event:
    | { type: 'INPUT'; value: string }
    | { type: 'COMPOSITION_START'; value: string }
    | { type: 'COMPOSITION_END'; value: string }
    | { type: 'SELECT'; start: number; end: number }
    | { type: 'FOCUS' }
    | { type: 'BLUR' }
    | { type: 'RESET' };
}
export const otpValue = (props: OtpInputBehaviorOptions, context: OtpInputSchema['context']) =>
  normalizeOtp(props.value ?? context.value ?? '', props);
function completion(value: string, props: OtpInputBehaviorOptions, last: string | null) {
  return Array.from(value).length === (props.length ?? 6) && value !== last ? value : null;
}
const editable = ({ props }: MachineArgs<OtpInputSchema>) => !props.disabled && !props.readOnly;
const notify = ({ props, context }: MachineArgs<OtpInputSchema>) => {
  if (context.notify) props.onValueChange?.(context.requested);
  if (context.completed !== null) props.onComplete?.(context.completed);
};
function accept(value: string, props: OtpInputBehaviorOptions, context: OtpInputSchema['context']) {
  const requested = normalizeOtp(value, props);
  const completed = props.value === undefined ? completion(requested, props, context.lastComplete) : null;
  return {
    value: props.value === undefined ? requested : null,
    requested,
    notify: requested !== otpValue(props, context),
    completed,
    lastComplete: completed ?? context.lastComplete,
    draft: null,
    draftBase: null,
  };
}
export const otpInputMachine = createMachine<OtpInputSchema>({
  initial: 'idle',
  context: ({ props }) => {
    const value = normalizeOtp(props.value ?? props.defaultValue ?? '', props);
    return {
      value: props.value === undefined ? value : null,
      defaultValue: props.defaultValue ?? '',
      draft: null,
      draftBase: null,
      start: 0,
      end: 0,
      lastComplete: completion(value, props, null),
      requested: '',
      notify: false,
      completed: null,
    };
  },
  states: { idle: {}, focused: {} },
  onProps: {
    guard: ({ props, context }) =>
      (props.value === undefined && context.value !== otpValue(props, context)) ||
      completion(otpValue(props, context), props, context.lastComplete) !== null ||
      (context.draftBase !== null && context.draftBase !== otpValue(props, context)),
    assign: ({ props, context }) => {
      const requested = otpValue(props, context);
      const completed = completion(requested, props, context.lastComplete);
      return {
        value: props.value === undefined ? requested : null,
        requested,
        notify: props.value === undefined && requested !== context.value,
        completed,
        lastComplete: completed ?? context.lastComplete,
        draft: null,
        draftBase: null,
      };
    },
    actions: [notify],
  },
  on: {
    FOCUS: { guard: ({ props }) => !props.disabled, target: 'focused' },
    BLUR: { target: 'idle' },
    SELECT: { assign: ({ event }) => ({ start: event.start, end: event.end }) },
    INPUT: {
      guard: editable,
      assign: ({ props, context, event }) =>
        context.draft !== null ? { draft: event.value } : accept(event.value, props, context),
      actions: [
        (args) => {
          if (args.context.draft === null) notify(args);
        },
      ],
    },
    COMPOSITION_START: {
      guard: editable,
      assign: ({ props, context, event }) => ({ draft: event.value, draftBase: otpValue(props, context) }),
    },
    COMPOSITION_END: {
      guard: editable,
      assign: ({ props, context, event }) => accept(event.value, props, context),
      actions: [notify],
    },
    RESET: {
      assign: ({ props, context }) => ({
        ...accept(context.defaultValue, props, context),
        completed: null,
        lastComplete: completion(normalizeOtp(props.value ?? context.defaultValue, props), props, null),
      }),
      actions: [notify],
    },
  },
});
