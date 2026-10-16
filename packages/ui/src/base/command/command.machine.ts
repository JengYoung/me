import { createMachine } from '../_shared/core/index';

export interface CommandItemData {
  id: string;
  label: string;
  keywords?: readonly string[];
  group?: string;
  disabled?: boolean;
}
export interface CommandShortcut {
  key: string;
  modifier?: 'mod' | 'ctrl' | 'meta';
  allowInInput?: boolean;
}
export interface CommandBehaviorOptions {
  items: readonly CommandItemData[];
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  filter?: false | ((item: CommandItemData, query: string) => boolean);
  sort?: (a: CommandItemData, b: CommandItemData, query: string) => number;
  onExecute?: (id: string) => void;
  disabled?: boolean;
  loop?: boolean;
  shortcut?: CommandShortcut;
  onShortcut?: () => void;
}
export interface CommandSchema {
  state: 'ready' | 'composing';
  props: CommandBehaviorOptions;
  context: { query: string | null };
  event: { type: 'QUERY'; query: string } | { type: 'COMPOSITION'; active: boolean } | { type: 'EXECUTE'; id: string };
}
export const commandQuery = (props: CommandBehaviorOptions, context: CommandSchema['context']) =>
  props.query ?? context.query ?? '';
export function commandItems(props: CommandBehaviorOptions, query: string): CommandItemData[] {
  const search = query.trim().toLocaleLowerCase();
  const items = props.items.filter(
    (item) =>
      props.filter === false ||
      (props.filter
        ? props.filter(item, query)
        : [item.label, ...(item.keywords ?? [])].some((text) => text.toLocaleLowerCase().includes(search))),
  );
  // filter makes a new array; a consumer's items are never sorted in place.
  return props.sort ? items.sort((a, b) => props.sort!(a, b, query)) : items;
}
export const commandMachine = createMachine<CommandSchema>({
  initial: 'ready',
  context: ({ props }) => ({ query: props.query === undefined ? (props.defaultQuery ?? '') : null }),
  states: { ready: {}, composing: {} },
  on: {
    QUERY: {
      guard: ({ props, context, event }) => !props.disabled && event.query !== commandQuery(props, context),
      assign: ({ props, event }) => ({ query: props.query === undefined ? event.query : null }),
      actions: [({ props, event }) => props.onQueryChange?.(event.query)],
    },
    COMPOSITION: [{ guard: ({ event }) => event.active, target: 'composing' }, { target: 'ready' }],
    EXECUTE: {
      guard: ({ props, context, event, value }) =>
        !props.disabled &&
        value !== 'composing' &&
        commandItems(props, commandQuery(props, context)).some((item) => item.id === event.id && !item.disabled),
      actions: [({ props, event }) => props.onExecute?.(event.id)],
    },
  },
});
