import { createMachine } from '../core/index';

export interface BooleanStateOptions {
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (value: boolean) => void;
}

interface BooleanSchema {
  state: 'controlled' | 'on' | 'off';
  context: Record<string, never>;
  props: BooleanStateOptions;
  event: { type: 'SET'; value: boolean };
}

// Internal source shared by React hooks; the definition has no React or DOM dependency.
export const booleanMachine = createMachine<BooleanSchema>({
  initial: ({ props }) => (props.value !== undefined ? 'controlled' : props.defaultValue ? 'on' : 'off'),
  context: () => ({}),
  states: { controlled: {}, on: {}, off: {} },
  on: {
    SET: [
      {
        guard: ({ value, props, event }) => value === 'controlled' && event.value !== props.value,
        actions: [({ props, event }) => props.onValueChange?.(event.value)],
      },
      {
        guard: ({ value, event }) => value === 'off' && event.value,
        target: 'on',
        actions: [({ props }) => props.onValueChange?.(true)],
      },
      {
        guard: ({ value, event }) => value === 'on' && !event.value,
        target: 'off',
        actions: [({ props }) => props.onValueChange?.(false)],
      },
    ],
  },
});
