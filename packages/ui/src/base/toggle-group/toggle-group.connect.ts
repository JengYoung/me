import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { RovingFocusApi } from '../_shared/keyboard/index';
import { toggleGroupValue } from './toggle-group.machine';
import type { ToggleGroupOptions, ToggleGroupSchema } from './toggle-group.machine';

export function connectToggleGroup(
  service: MachineApi<ToggleGroupSchema>,
  roving: RovingFocusApi,
  options: ToggleGroupOptions & { id: string },
) {
  const value = toggleGroupValue(options, service.state.context);
  return {
    value,
    focusedValue: roving.value,
    toggle: (key: string) => service.send({ type: 'TOGGLE', value: key }),
    setValue: (next: readonly string[]) => service.send({ type: 'SET', value: next }),
    focus: roving.focus,
    getRootProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return roving.getRootProps(
        mergeProps<'div'>(user, {
          id: options.id,
          role: 'group',
          'data-scope': 'toggle-group',
          'data-part': 'root',
          'data-orientation': options.orientation ?? 'horizontal',
        }),
      );
    },
    getItemProps(key: string, user: PartProps<'button'> = {}): PartProps<'button'> {
      const item = options.items.find((entry) => entry.value === key);
      if (!item) throw new Error(`Unknown toggle group item: ${key}`);
      const disabled = !!options.disabled || !!item.disabled;
      const pressed = value.includes(key);
      const locked = options.allowEmpty === false && pressed && value.length === 1;
      const { role: _role, 'aria-checked': _checked, ...props } = user;
      return mergeProps<'button'>(roving.getItemProps(key, props), {
        id: `${options.id}-item-${encodeURIComponent(key)}`,
        type: 'button',
        disabled,
        tabIndex: disabled ? -1 : options.rovingFocus === false ? 0 : roving.value === key ? 0 : -1,
        'aria-pressed': pressed,
        'aria-disabled': disabled || locked,
        'data-scope': 'toggle-group',
        'data-part': 'item',
        'data-state': pressed ? 'on' : 'off',
        'data-value': key,
        onClick: () => service.send({ type: 'TOGGLE', value: key }),
      });
    },
  };
}
export type ToggleGroupApi = ReturnType<typeof connectToggleGroup>;
