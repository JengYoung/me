import { createMachine } from "../_shared/core/index";
import type { MachineArgs, Snapshot, Transition } from "../_shared/core/index";

export type CheckedState = boolean | 'mixed';
export interface CheckboxOptions {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  form?: string;
  id?: string;
}
export interface CheckboxSchema {
  state: 'controlled' | 'checked' | 'unchecked' | 'mixed';
  context: { defaultChecked: CheckedState };
  props: CheckboxOptions;
  event: { type: 'SET'; checked: CheckedState } | { type: 'TOGGLE' } | { type: 'RESET' };
}
export const checkboxChecked = (
  props: CheckboxOptions,
  snapshot: Pick<Snapshot<CheckboxSchema>, 'value'>,
): CheckedState =>
  props.checked !== undefined ? props.checked : snapshot.value === 'mixed' ? 'mixed' : snapshot.value === 'checked';
const stateOf = (checked: CheckedState) => (checked === 'mixed' ? 'mixed' : checked ? 'checked' : 'unchecked');
function requested(args: MachineArgs<CheckboxSchema, CheckboxSchema['event']>): CheckedState {
  if (args.event.type === 'RESET') return args.context.defaultChecked;
  if (args.event.type === 'SET') return args.event.checked;
  return checkboxChecked(args.props, args) !== true;
}
const transitions: readonly Transition<CheckboxSchema, CheckboxSchema['event']>[] = [
  {
    guard: (args) =>
      args.value === 'controlled' &&
      (args.event.type === 'RESET' || !args.props.disabled) &&
      requested(args) !== args.props.checked,
    actions: [(args) => args.props.onCheckedChange?.(requested(args))],
  },
  ...([false, true, 'mixed'] as const).map((checked): Transition<CheckboxSchema, CheckboxSchema['event']> => ({
    target: stateOf(checked),
    guard: (args) =>
      args.value !== 'controlled' &&
      (args.event.type === 'RESET' || !args.props.disabled) &&
      requested(args) === checked &&
      checkboxChecked(args.props, args) !== checked,
    actions: [({ props }) => props.onCheckedChange?.(checked)],
  })),
];
export const checkboxMachine = createMachine<CheckboxSchema>({
  initial: ({ props }) => (props.checked !== undefined ? 'controlled' : stateOf(props.defaultChecked ?? false)),
  context: ({ props }) => ({ defaultChecked: props.defaultChecked ?? false }),
  states: { controlled: {}, checked: {}, unchecked: {}, mixed: {} },
  on: { SET: transitions, TOGGLE: transitions, RESET: transitions },
});
