import { createMachine } from "../_shared/core/index";
import type { MachineArgs, Transition } from "../_shared/core/index";

export interface EditableBehaviorOptions {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  onValueCommit?: (value: string) => void;
  /** Synchronous, pure validation. false keeps the draft open and marks it invalid. */
  validate?: (value: string) => boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}
export interface EditableSchema {
  state: 'idle' | 'editing' | 'controlled';
  props: EditableBehaviorOptions;
  context: {
    value: string | null;
    defaultValue: string;
    draft: string | null;
    draftBase: string | null;
    invalid: boolean;
    composing: boolean;
    requested: string;
    notify: boolean;
    closeRequested: boolean;
  };
  event:
    | { type: 'EDIT' }
    | { type: 'INPUT'; value: string }
    | { type: 'COMPOSITION'; active: boolean }
    | { type: 'COMMIT' }
    | { type: 'CANCEL' }
    | { type: 'RESET' };
}
export const editableValue = (props: EditableBehaviorOptions, context: EditableSchema['context']) =>
  props.value ?? context.value ?? '';
export const editableEditing = (props: EditableBehaviorOptions, state: EditableSchema['state']) =>
  props.editing ?? state === 'editing';
export const editableDraft = (props: EditableBehaviorOptions, context: EditableSchema['context']) =>
  context.draft !== null && context.draftBase === editableValue(props, context)
    ? context.draft
    : editableValue(props, context);
const canEdit = ({ props }: MachineArgs<EditableSchema>) => !props.disabled && !props.readOnly;
const isEditing = ({ props, value }: MachineArgs<EditableSchema>) => editableEditing(props, value);
const canCommit = (args: MachineArgs<EditableSchema>) => canEdit(args) && isEditing(args) && !args.context.composing;
const cleared = { draft: null, draftBase: null, invalid: false, composing: false };
const notifyValue = ({ props, context }: MachineArgs<EditableSchema>) => {
  if (context.notify) props.onValueChange?.(context.requested);
};
const notifyClose = ({ props, context }: MachineArgs<EditableSchema>) => {
  if (context.closeRequested) props.onEditingChange?.(false);
};

function finish(controlled: boolean, reset: boolean): Transition<EditableSchema> {
  return {
    guard: (args) => (args.props.editing !== undefined) === controlled && (reset || canCommit(args)),
    target: controlled ? 'controlled' : 'idle',
    assign: ({ props, context, value }) => {
      const requested = reset ? context.defaultValue : editableDraft(props, context);
      return {
        ...cleared,
        value: props.value === undefined ? requested : null,
        // A controlled editing owner can refuse closing. Keep its draft until acceptance/cancel.
        ...(controlled && !reset ? { draft: requested, draftBase: editableValue(props, context) } : {}),
        requested,
        notify: requested !== editableValue(props, context),
        closeRequested: editableEditing(props, value),
      };
    },
    actions: reset
      ? [notifyValue, notifyClose]
      : [notifyValue, ({ props, context }) => props.onValueCommit?.(context.requested), notifyClose],
  };
}
function cancel(controlled: boolean): Transition<EditableSchema> {
  return {
    guard: (args) => (args.props.editing !== undefined) === controlled && isEditing(args),
    target: controlled ? 'controlled' : 'idle',
    assign: () => ({ ...cleared, closeRequested: true }),
    actions: [notifyClose],
  };
}

export const editableMachine = createMachine<EditableSchema>({
  initial: ({ props }) => (props.editing !== undefined ? 'controlled' : props.defaultEditing ? 'editing' : 'idle'),
  context: ({ props }) => ({
    value: props.value === undefined ? (props.defaultValue ?? '') : null,
    defaultValue: props.defaultValue ?? '',
    ...cleared,
    requested: '',
    notify: false,
    closeRequested: false,
  }),
  states: { idle: {}, editing: {}, controlled: {} },
  onProps: {
    guard: ({ props, context, value }) =>
      (context.draft !== null || context.invalid || context.composing) &&
      (!editableEditing(props, value) ||
        (context.draftBase !== null && context.draftBase !== editableValue(props, context))),
    assign: () => cleared,
  },
  on: {
    EDIT: [
      {
        guard: (args) => canEdit(args) && !isEditing(args) && args.props.editing !== undefined,
        actions: [({ props }) => props.onEditingChange?.(true)],
      },
      {
        guard: (args) => canEdit(args) && !isEditing(args),
        target: 'editing',
        assign: ({ props, context }) => ({
          ...cleared,
          draft: editableValue(props, context),
          draftBase: editableValue(props, context),
        }),
        actions: [({ props }) => props.onEditingChange?.(true)],
      },
    ],
    INPUT: {
      guard: (args) => canEdit(args) && isEditing(args),
      assign: ({ props, context, event }) => ({
        draft: event.value,
        draftBase: editableValue(props, context),
        invalid: false,
      }),
    },
    COMPOSITION: {
      guard: (args) => canEdit(args) && isEditing(args),
      assign: ({ event }) => ({ composing: event.active }),
    },
    COMMIT: [
      {
        guard: (args) =>
          canCommit(args) &&
          ((!!args.props.required && editableDraft(args.props, args.context) === '') ||
            args.props.validate?.(editableDraft(args.props, args.context)) === false),
        assign: () => ({ invalid: true }),
      },
      finish(true, false),
      finish(false, false),
    ],
    CANCEL: [cancel(true), cancel(false)],
    RESET: [finish(true, true), finish(false, true)],
  },
});
