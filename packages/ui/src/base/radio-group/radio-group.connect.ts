import { mergeProps } from "../_shared/react/index";
import type { MachineApi, PartProps } from "../_shared/react/index";
import type { RovingFocusApi } from "../_shared/keyboard/index";
import { radioGroupValue } from "./radio-group.machine";
import type { RadioGroupOptions, RadioGroupSchema } from "./radio-group.machine";

export function connectRadioGroup(
  service: MachineApi<RadioGroupSchema>,
  roving: RovingFocusApi,
  options: RadioGroupOptions & { id: string },
) {
  const value = radioGroupValue(options, service.state.context);
  return {
    value,
    focusedValue: roving.value,
    setValue: (next: string) => service.send({ type: 'SELECT', value: next }),
    focus: roving.focus,
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return roving.getRootProps(
        mergeProps<'div'>(props, {
          id: options.id,
          role: 'radiogroup',
          'aria-required': options.required || undefined,
          'aria-disabled': options.disabled || undefined,
          dir: options.dir,
          'data-scope': 'radio-group',
          'data-part': 'root',
        }),
      );
    },
    getItemProps(itemValue: string, props: PartProps<'input'> = {}): PartProps<'input'> {
      const item = options.items.find((entry) => entry.value === itemValue);
      if (!item) throw new Error(`Unknown radio: ${itemValue}`);
      const { defaultChecked: _defaultChecked, ...user } = props;
      const bound = roving.getItemProps<'input'>(
        itemValue,
        mergeProps<'input'>(user, {
          id: `${options.id}-radio-${encodeURIComponent(itemValue)}`,
          type: 'radio',
          value: itemValue,
          name: options.name ?? options.id,
          form: options.form,
          checked: value === itemValue,
          disabled: !!options.disabled || !!item.disabled || !!props.disabled,
          required: options.required,
          'data-scope': 'radio-group',
          'data-part': 'item',
          'data-state': value === itemValue ? 'checked' : 'unchecked',
          onChange: (event) => {
            if (event.currentTarget.checked) service.send({ type: 'SELECT', value: itemValue });
          },
        }),
      );
      if (!options.inToolbar) return bound;
      // Keep input refs for native form reset, while toolbar props own focus and navigation.
      const { onKeyDown: _rovingKeyDown, ...withoutNavigation } = bound;
      return {
        ...withoutNavigation,
        tabIndex: props.tabIndex ?? -1,
        onKeyDown: (event) => {
          props.onKeyDown?.(event);
          if (!event.defaultPrevented && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key))
            event.preventDefault();
        },
      };
    },
  };
}

export type RadioGroupApi = ReturnType<typeof connectRadioGroup>;
