import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { ListboxApi } from "../listbox/index";
import type { TextFieldApi, TextFieldInputProps } from "../text-field/index";
import type { RefObject } from 'react';
import { commandQuery } from "./command.machine";
import type { CommandSchema } from "./command.machine";
import type { CommandOptions } from "./use-command";

export function connectCommand(
  text: TextFieldApi,
  listbox: ListboxApi,
  service: MachineApi<CommandSchema>,
  options: CommandOptions & { id: string },
  actions: {
    input: RefObject<HTMLInputElement | null>;
    setQuery(query: string): void;
    clear(): void;
    execute(id: string): void;
    focus(): void;
  },
) {
  const items = options.items;
  const activeId = options.disabled ? null : (listbox.activeValue ?? items.find((item) => !item.disabled)?.id ?? null);
  const data = (part: string) => ({ 'data-scope': 'command', 'data-part': part });
  const listId = `${options.id}-list`;
  return {
    query: commandQuery(options, service.state.context),
    items,
    activeId,
    empty: items.length === 0,
    ids: { ...text.ids, list: listId },
    setQuery: actions.setQuery,
    clear: actions.clear,
    execute: actions.execute,
    focus: actions.focus,
    setActiveId: listbox.setActiveValue,
    getRootProps(user: PartProps<'div'> = {}) {
      return mergeProps<'div'>(text.getRootProps(user), data('root'));
    },
    getLabelProps(user: PartProps<'label'> = {}) {
      return mergeProps<'label'>(text.getLabelProps(user), data('label'));
    },
    getDescriptionProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(text.getDescriptionProps(user), data('description'));
    },
    getErrorProps(user: PartProps<'span'> = {}) {
      return mergeProps<'span'>(text.getErrorProps(user), data('error'));
    },
    getInputProps(user: TextFieldInputProps = {}): PartProps<'input'> {
      return mergeProps<'input'>(text.getInputProps(user), {
        ...data('input'),
        ref: actions.input,
        role: 'combobox',
        autoComplete: 'off',
        'aria-autocomplete': 'list',
        'aria-haspopup': 'listbox',
        'aria-expanded': !options.disabled,
        'aria-controls': listId,
        'aria-activedescendant': activeId === null ? undefined : listbox.optionId(activeId),
        onCompositionStart() {
          service.send({ type: 'COMPOSITION', active: true });
        },
        onCompositionEnd() {
          service.send({ type: 'COMPOSITION', active: false });
        },
        onKeyDown(event) {
          if (
            options.disabled ||
            event.nativeEvent.isComposing ||
            event.keyCode === 229 ||
            service.getSnapshot().value === 'composing' ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey ||
            event.shiftKey
          )
            return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (listbox.activeValue === null && activeId !== null) listbox.setActiveValue(activeId);
            listbox.move(event.key === 'ArrowDown' ? 'next' : 'previous');
          } else if (event.key === 'Enter') {
            event.preventDefault();
            if (!event.repeat && activeId !== null) actions.execute(activeId);
          } else if (event.key === 'Escape' && commandQuery(service.getProps(), service.getSnapshot().context)) {
            event.preventDefault();
            event.stopPropagation();
            actions.clear();
          }
        },
      });
    },
    getListProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(listbox.getRootProps(user), {
        ...data('list'),
        'aria-labelledby': user['aria-label'] ? undefined : (user['aria-labelledby'] ?? text.ids.label),
      });
    },
    getItemProps(id: string, user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(listbox.getOptionProps(id, user), {
        ...data('item'),
        'data-active': id === activeId ? '' : undefined,
        'aria-selected': id === activeId,
        onClick: actions.focus,
      });
    },
    getGroupProps(group: string, user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(listbox.getGroupProps(group, user), {
        ...data('group'),
        hidden: !items.some((item) => item.group === group),
      });
    },
    getGroupLabelProps(group: string, user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(listbox.getGroupLabelProps(group, user), data('group-label'));
    },
    getEmptyProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        ...data('empty'),
        role: 'status',
        'aria-live': 'polite',
        hidden: items.length !== 0,
      });
    },
  };
}
export type CommandApi = ReturnType<typeof connectCommand>;
