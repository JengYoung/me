import { createMachine } from "../_shared/core/index";
import type { MachineArgs, Snapshot, Transition } from "../_shared/core/index";

export interface SwitchOptions {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  form?: string;
  id?: string;
}
export interface SwitchSchema {
  state: 'controlled' | 'on' | 'off';
  context: { defaultChecked: boolean };
  props: SwitchOptions;
  event: { type: 'SET'; checked: boolean } | { type: 'TOGGLE' } | { type: 'RESET' };
}
export const switchChecked = (props: SwitchOptions, snapshot: Pick<Snapshot<SwitchSchema>, 'value'>) =>
  props.checked ?? snapshot.value === 'on';
function requested(args: MachineArgs<SwitchSchema, SwitchSchema['event']>): boolean {
  if (args.event.type === 'RESET') return args.context.defaultChecked;
  if (args.event.type === 'SET') return args.event.checked;
  return !switchChecked(args.props, args);
}
const transitions: readonly Transition<SwitchSchema, SwitchSchema['event']>[] = [
  {
    guard: (args) =>
      args.value === 'controlled' &&
      (args.event.type === 'RESET' || !args.props.disabled) &&
      requested(args) !== args.props.checked,
    actions: [(args) => args.props.onCheckedChange?.(requested(args))],
  },
  ...([false, true] as const).map((checked): Transition<SwitchSchema, SwitchSchema['event']> => ({
    target: checked ? 'on' : 'off',
    guard: (args) =>
      args.value !== 'controlled' &&
      (args.event.type === 'RESET' || !args.props.disabled) &&
      requested(args) === checked &&
      switchChecked(args.props, args) !== checked,
    actions: [({ props }) => props.onCheckedChange?.(checked)],
  })),
];
export const switchMachine = createMachine<SwitchSchema>({
  initial: ({ props }) => (props.checked !== undefined ? 'controlled' : props.defaultChecked ? 'on' : 'off'),
  context: ({ props }) => ({ defaultChecked: props.defaultChecked ?? false }),
  states: { controlled: {}, on: {}, off: {} },
  on: { SET: transitions, TOGGLE: transitions, RESET: transitions },
});
