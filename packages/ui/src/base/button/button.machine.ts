import { createMachine } from "../_shared/core/index";
import type { MachineArgs, Snapshot, Transition } from "../_shared/core/index";

export interface ButtonOptions {
  toggle?: boolean;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
}
export interface ButtonSchema {
  state: 'command' | 'controlled' | 'pressed' | 'released';
  context: Record<string, never>;
  props: ButtonOptions;
  event: { type: 'ACTIVATE' } | { type: 'SET'; pressed: boolean };
}
export const buttonPressed = (props: ButtonOptions, snapshot: Pick<Snapshot<ButtonSchema>, 'value'>) =>
  !!props.toggle && (props.pressed ?? snapshot.value === 'pressed');
const requested = (args: MachineArgs<ButtonSchema, ButtonSchema['event']>) =>
  args.event.type === 'SET' ? args.event.pressed : !buttonPressed(args.props, args);
const press = ({ props, event }: MachineArgs<ButtonSchema, ButtonSchema['event']>) => {
  if (event.type === 'ACTIVATE') props.onPress?.();
};
const transitions: readonly Transition<ButtonSchema, ButtonSchema['event']>[] = [
  {
    guard: ({ value, props, event }) => value === 'command' && !props.disabled && event.type === 'ACTIVATE',
    actions: [press],
  },
  {
    guard: (args) => args.value === 'controlled' && !args.props.disabled && requested(args) !== args.props.pressed,
    actions: [(args) => args.props.onPressedChange?.(requested(args)), press],
  },
  ...([false, true] as const).map((pressed): Transition<ButtonSchema, ButtonSchema['event']> => ({
    target: pressed ? 'pressed' : 'released',
    guard: (args) =>
      (args.value === 'pressed' || args.value === 'released') &&
      !args.props.disabled &&
      requested(args) === pressed &&
      buttonPressed(args.props, args) !== pressed,
    actions: [({ props }) => props.onPressedChange?.(pressed), press],
  })),
];
export const buttonMachine = createMachine<ButtonSchema>({
  initial: ({ props }) =>
    !props.toggle
      ? 'command'
      : props.pressed !== undefined
        ? 'controlled'
        : props.defaultPressed
          ? 'pressed'
          : 'released',
  context: () => ({}),
  states: { command: {}, controlled: {}, pressed: {}, released: {} },
  on: { ACTIVATE: transitions, SET: transitions },
});
