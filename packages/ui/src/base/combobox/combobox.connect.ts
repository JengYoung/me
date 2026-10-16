import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { ListboxApi } from '../listbox/index';
import type { KeyboardEvent, RefObject } from 'react';
import { comboboxInput, comboboxValue } from './combobox.machine';
import type { ComboboxOptions, ComboboxSchema } from './combobox.machine';

export interface ComboboxElements {
  root: RefObject<HTMLDivElement | null>;
  input: RefObject<HTMLInputElement | null>;
  trigger: RefObject<HTMLButtonElement | null>;
  composing: RefObject<boolean>;
}
export function connectCombobox(
  service: MachineApi<ComboboxSchema>,
  listbox: ListboxApi,
  options: ComboboxOptions & { id: string },
  elements: ComboboxElements,
) {
  const open = !options.disabled && (options.open ?? service.state.value === 'open');
  const value = comboboxValue(options, service.state.context);
  const inputValue = comboboxInput(options, service.state.context);
  const selectOnly = options.mode === 'select-only';
  const controlId = `${options.id}-control`;
  const popupId = `${options.id}-listbox`;
  const setOpen = (next: boolean) => {
    service.send({ type: 'OPEN', open: next });
    if (!next) {
      listbox.resetSearch();
      listbox.setActiveValue(comboboxValue(service.getProps(), service.getSnapshot().context));
    }
  };
  const focus = () =>
    (service.getProps().mode === 'select-only' ? elements.trigger.current : elements.input.current)?.focus();
  const choose = (next: string) => {
    service.send({ type: 'SELECT', value: next });
    focus();
  };
  function keydown(event: KeyboardEvent<HTMLElement>) {
    if (
      event.target !== event.currentTarget ||
      event.nativeEvent.isComposing ||
      event.keyCode === 229 ||
      elements.composing.current ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    const props = service.getProps();
    if (props.disabled) return;
    const expanded = props.open ?? service.getSnapshot().value === 'open';
    const only = props.mode === 'select-only';
    if (event.altKey) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(event.key === 'ArrowDown');
      }
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      listbox.move(
        !expanded ? (event.key === 'ArrowDown' ? 'first' : 'last') : event.key === 'ArrowDown' ? 'next' : 'previous',
      );
    } else if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === 'Enter' || (only && event.key === ' ')) {
      if (expanded && listbox.activeValue !== null) {
        event.preventDefault();
        choose(listbox.activeValue);
      } else if (only) {
        event.preventDefault();
        setOpen(true);
        listbox.move('first');
      }
    } else if (event.key === 'Tab') {
      if (only && expanded && listbox.activeValue !== null)
        service.send({ type: 'SELECT', value: listbox.activeValue });
      setOpen(false);
    } else if (only && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault();
      setOpen(true);
      listbox.move(event.key === 'Home' ? 'first' : 'last');
    } else if (only && [...event.key].length === 1) {
      event.preventDefault();
      setOpen(true);
      listbox.typeahead(event.key);
    } else if (!only && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) listbox.setActiveValue(null);
  }
  const control = {
    id: controlId,
    role: 'combobox',
    'aria-haspopup': 'listbox' as const,
    'aria-expanded': open,
    'aria-controls': popupId,
    'aria-activedescendant': open && listbox.activeValue !== null ? listbox.optionId(listbox.activeValue) : undefined,
    'aria-required': options.required || undefined,
    'data-scope': 'combobox',
    'data-part': 'control',
    'data-state': open ? 'open' : 'closed',
    onKeyDown: keydown,
  };
  return {
    open,
    value,
    inputValue,
    activeValue: listbox.activeValue,
    items: options.items,
    setOpen,
    setValue: (next: string | null) => service.send({ type: 'SET_VALUE', value: next }),
    setInputValue: (next: string) => service.send({ type: 'INPUT', value: next }),
    setActiveValue: listbox.setActiveValue,
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ref: elements.root,
        dir: options.dir,
        'data-scope': 'combobox',
        'data-part': 'root',
        onBlur: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        },
      });
    },
    getLabelProps(props: PartProps<'label'> = {}): PartProps<'label'> {
      return mergeProps<'label'>(props, {
        id: `${options.id}-label`,
        htmlFor: controlId,
        'data-scope': 'combobox',
        'data-part': 'label',
      });
    },
    getInputProps(props: PartProps<'input'> = {}): PartProps<'input'> {
      if (selectOnly)
        throw new Error('Combobox.Input is only available in editable mode. Use Trigger for select-only mode.');
      return mergeProps<'input'>(props, {
        ...control,
        ref: elements.input,
        type: 'text',
        value: inputValue,
        disabled: options.disabled,
        autoComplete: 'off',
        'aria-autocomplete': options.autocomplete ?? 'list',
        onChange: (event) => {
          listbox.setActiveValue(null);
          service.send({ type: 'INPUT', value: event.currentTarget.value });
        },
        onCompositionStart: () => {
          elements.composing.current = true;
        },
        onCompositionEnd: () => {
          elements.composing.current = false;
        },
      });
    },
    getTriggerProps(props: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(props, {
        ...(selectOnly
          ? control
          : {
              'aria-haspopup': 'listbox',
              'aria-expanded': open,
              'aria-controls': popupId,
              tabIndex: -1,
              'aria-label': props['aria-label'] ?? 'Show suggestions',
            }),
        ref: elements.trigger,
        type: 'button',
        disabled: options.disabled,
        children:
          props.children ??
          (selectOnly ? (options.items.find((item) => item.value === value)?.label ?? '') : undefined),
        'data-scope': 'combobox',
        'data-part': 'trigger',
        onMouseDown: (event) => event.preventDefault(),
        onClick: () => {
          focus();
          setOpen(!open);
          if (!open) listbox.move('first');
        },
      });
    },
    getListboxProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(listbox.getRootProps(props), {
        id: popupId,
        hidden: !open,
        tabIndex: -1,
        'aria-labelledby': props['aria-label'] ? undefined : (props['aria-labelledby'] ?? `${options.id}-label`),
      });
    },
    getOptionProps(next: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(listbox.getOptionProps(next, props), {
        'aria-selected': listbox.activeValue === next,
        'data-state': listbox.activeValue === next ? 'selected' : 'unselected',
      });
    },
    getGroupProps: listbox.getGroupProps,
    getGroupLabelProps: listbox.getGroupLabelProps,
  };
}
export type ComboboxApi = ReturnType<typeof connectCombobox>;
