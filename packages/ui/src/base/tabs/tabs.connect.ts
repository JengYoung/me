import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RovingFocusApi } from "../_shared/keyboard/index";
import { tabsValue } from "./tabs.machine";
import type { TabsOptions, TabsSchema } from "./tabs.machine";

export function connectTabs(
  service: MachineApi<TabsSchema>,
  roving: RovingFocusApi,
  props: TabsOptions & { id: string },
  interaction: { pointerStart(): void; pointerEnd(): void; focus(value: string): void },
) {
  const value = tabsValue(props, service.state.context);
  const tabId = (item: string) => `${props.id}-tab-${encodeURIComponent(item)}`;
  const panelId = (item: string) => `${props.id}-panel-${encodeURIComponent(item)}`;
  const item = (itemValue: string) => {
    const found = props.items.find((entry) => entry.value === itemValue);
    if (!found) throw new Error(`Unknown tab: ${itemValue}`);
    return found;
  };
  return {
    value,
    focusedValue: roving.value,
    setValue: (next: string) => service.send({ type: 'SELECT', value: next }),
    focus: roving.focus,
    getRootProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(user, {
        id: props.id,
        dir: roving.dir,
        'data-scope': 'tabs',
        'data-part': 'root',
        'data-orientation': props.orientation ?? 'horizontal',
      });
    },
    getListProps(user: PartProps<'div'> = {}): PartProps<'div'> {
      return roving.getRootProps(
        mergeProps<'div'>(user, {
          role: 'tablist',
          'aria-orientation': props.orientation ?? 'horizontal',
          'data-scope': 'tabs',
          'data-part': 'list',
        }),
      );
    },
    getTriggerProps(itemValue: string, user: PartProps<'button'> = {}): PartProps<'button'> {
      const disabled = !!props.disabled || !!item(itemValue).disabled;
      return roving.getItemProps<'button'>(
        itemValue,
        mergeProps<'button'>(user, {
          id: tabId(itemValue),
          type: 'button',
          role: 'tab',
          disabled,
          'aria-selected': value === itemValue,
          'aria-controls': panelId(itemValue),
          'data-scope': 'tabs',
          'data-part': 'trigger',
          'data-state': value === itemValue ? 'active' : 'inactive',
          'data-value': itemValue,
          onPointerDown: interaction.pointerStart,
          onPointerUp: interaction.pointerEnd,
          onPointerCancel: interaction.pointerEnd,
          onFocus: () => interaction.focus(itemValue),
          onClick: () => {
            interaction.pointerEnd();
            if (!disabled) service.send({ type: 'SELECT', value: itemValue });
          },
        }),
      );
    },
    getContentProps(itemValue: string, user: PartProps<'div'> = {}): PartProps<'div'> {
      item(itemValue);
      return mergeProps<'div'>(user, {
        id: panelId(itemValue),
        role: 'tabpanel',
        'aria-labelledby': tabId(itemValue),
        hidden: value !== itemValue,
        tabIndex: user.tabIndex ?? 0,
        'data-scope': 'tabs',
        'data-part': 'content',
        'data-state': value === itemValue ? 'active' : 'inactive',
      });
    },
  };
}

export type TabsApi = ReturnType<typeof connectTabs>;
