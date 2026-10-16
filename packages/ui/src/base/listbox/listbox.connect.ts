import { getNavigationIntent } from '../_shared/core/index';
import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { RefObject } from 'react';
import { listboxActive, listboxValue } from './listbox.machine';
import type { ListboxOptions, ListboxSchema } from './listbox.machine';

export function connectListbox(
  service: MachineApi<ListboxSchema>,
  options: ListboxOptions & { id: string },
  root: RefObject<HTMLDivElement | null>,
) {
  const value = listboxValue(options, service.state.context);
  const activeValue = listboxActive(options, service.state.context);
  const optionId = (item: string) => `${options.id}-option-${encodeURIComponent(item)}`;
  const setActiveValue = (next: string | null) => service.send({ type: 'ACTIVE', value: next });
  const select = (next: string) => service.send({ type: 'SELECT', value: next });
  const move = (intent: 'first' | 'last' | 'next' | 'previous') => service.send({ type: 'MOVE', intent });
  return {
    value,
    activeValue,
    optionId,
    setActiveValue,
    select,
    move,
    setValue: (next: readonly string[]) => service.send({ type: 'SET', value: next }),
    typeahead: (character: string) => service.send({ type: 'TYPE', character }),
    resetSearch: () => service.send({ type: 'CLEAR_SEARCH' }),
    focus() {
      if (service.getProps().disabled) return false;
      root.current?.focus();
      return !!root.current && root.current.ownerDocument.activeElement === root.current;
    },
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        ref: root,
        id: options.id,
        role: 'listbox',
        tabIndex: options.disabled || options.virtualFocus ? -1 : 0,
        dir: options.dir,
        'aria-multiselectable': !!options.multiple,
        'aria-disabled': options.disabled || undefined,
        'aria-orientation': options.orientation ?? 'vertical',
        'aria-activedescendant': !options.virtualFocus && activeValue !== null ? optionId(activeValue) : undefined,
        'data-scope': 'listbox',
        'data-part': 'root',
        onFocus: (event) => {
          if (event.target !== event.currentTarget || service.getProps().virtualFocus) return;
          const current = service.getProps();
          const selected = listboxValue(current, service.getSnapshot().context).find((v) =>
            current.items.some((item) => item.value === v && !item.disabled),
          );
          if (selected) setActiveValue(selected);
          else if (listboxActive(current, service.getSnapshot().context) === null) move('first');
        },
        onBlur: () => service.send({ type: 'CLEAR_SEARCH' }),
        onKeyDown: (event) => {
          if (
            event.target !== event.currentTarget ||
            event.nativeEvent.isComposing ||
            event.keyCode === 229 ||
            event.altKey ||
            event.metaKey
          )
            return;
          const current = service.getProps();
          if (current.disabled || current.virtualFocus) return;
          if (event.ctrlKey && current.multiple && event.key.toLowerCase() === 'a') {
            event.preventDefault();
            service.send({
              type: 'SET',
              value: current.items.filter((item) => !item.disabled).map((item) => item.value),
            });
            return;
          }
          if (event.ctrlKey || event.shiftKey) return;
          const dir =
            current.dir ??
            (event.currentTarget.ownerDocument.defaultView?.getComputedStyle(event.currentTarget).direction === 'rtl'
              ? 'rtl'
              : 'ltr');
          const intent = getNavigationIntent(event.key, { orientation: current.orientation ?? 'vertical', dir });
          if (intent) {
            event.preventDefault();
            move(intent);
          } else if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            const active = listboxActive(current, service.getSnapshot().context);
            if (active !== null) select(active);
          } else if ([...event.key].length === 1) {
            event.preventDefault();
            service.send({ type: 'TYPE', character: event.key });
          }
        },
      });
    },
    getOptionProps(itemValue: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      const item = options.items.find((entry) => entry.value === itemValue);
      if (!item) throw new Error(`Unknown listbox option: ${itemValue}`);
      return mergeProps<'div'>(props, {
        id: optionId(itemValue),
        role: 'option',
        tabIndex: -1,
        'aria-selected': value.includes(itemValue),
        'aria-disabled': !!options.disabled || !!item.disabled || undefined,
        'data-scope': 'listbox',
        'data-part': 'option',
        'data-value': itemValue,
        'data-active': activeValue === itemValue || undefined,
        'data-state': value.includes(itemValue) ? 'selected' : 'unselected',
        onMouseDown: (event) => {
          if (event.button === 0) event.preventDefault();
        },
        onPointerMove: (event) => {
          if (event.pointerType !== 'touch') setActiveValue(itemValue);
        },
        onClick: () => {
          if (!service.getProps().virtualFocus) root.current?.focus();
          setActiveValue(itemValue);
          select(itemValue);
        },
      });
    },
    getGroupProps(group: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        role: 'group',
        'aria-labelledby': props['aria-label'] ? undefined : `${options.id}-group-${encodeURIComponent(group)}`,
        'data-scope': 'listbox',
        'data-part': 'group',
      });
    },
    getGroupLabelProps(group: string, props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        id: `${options.id}-group-${encodeURIComponent(group)}`,
        'data-scope': 'listbox',
        'data-part': 'group-label',
      });
    },
  };
}
export type ListboxApi = ReturnType<typeof connectListbox>;
