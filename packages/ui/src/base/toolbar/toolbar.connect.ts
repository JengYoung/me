import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RovingFocusApi } from "../_shared/keyboard/index";
import type { ToolbarOptions, ToolbarSchema } from "./toolbar.machine";

export function connectToolbar(
  service: MachineApi<ToolbarSchema>,
  roving: RovingFocusApi,
  options: ToolbarOptions & { id: string },
) {
  const focused = service.state.value === 'focused';
  return {
    value: roving.value,
    focus: roving.focus,
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      const bound = roving.getRootProps(
        mergeProps<'div'>(props, {
          id: options.id,
          role: 'toolbar',
          'aria-orientation': options.orientation ?? 'horizontal',
          'aria-disabled': options.disabled || undefined,
          'data-scope': 'toolbar',
          'data-part': 'root',
          'data-orientation': options.orientation ?? 'horizontal',
        }),
      );
      // Firefox/WebKit skip unchecked native radios on Tab when a sibling is checked.
      // Enter via the root while outside, then hand focus to the remembered control.
      return mergeProps<'div'>(bound, {
        tabIndex: !focused && roving.value !== null ? 0 : -1,
        onFocus: (event) => {
          if (event.target === event.currentTarget && roving.value !== null) roving.focus(roving.value);
        },
      });
    },
    getItemProps<Tag extends 'button' | 'input' = 'button'>(
      value: string,
      props: PartProps<Tag> = {} as PartProps<Tag>,
    ): PartProps<Tag> {
      const item = options.items.find((entry) => entry.value === value);
      if (!item) throw new Error(`Unknown toolbar item: ${value}`);
      const disabled = !!options.disabled || !!item.disabled || !!props.disabled;
      const bound = roving.getItemProps<Tag>(
        value,
        mergeProps<'button' | 'input'>(props, {
          type: props.type ?? 'button',
          disabled,
          'aria-disabled': disabled,
          'data-scope': 'toolbar',
          'data-part': 'item',
          'data-value': value,
          onClick: (event: { preventDefault(): void }) => {
            if (disabled) event.preventDefault();
          },
        }) as PartProps<Tag>,
      );
      bound.tabIndex = focused ? bound.tabIndex : -1;
      return bound;
    },
  };
}
export type ToolbarApi = ReturnType<typeof connectToolbar>;
