import { mergeProps } from '../_shared/react/index';
import type { BooleanStateApi, PropGetter } from '../_shared/react/index';

export interface ToggleApi {
  readonly pressed: boolean;
  setPressed: BooleanStateApi['setValue'];
  toggle(): void;
  getButtonProps: PropGetter<'button'>;
}

/** Internal DOM binding; it owns neither React state nor effects. */
export function connectToggle(state: BooleanStateApi, options: { disabled?: boolean }): ToggleApi {
  return {
    pressed: state.value,
    setPressed: state.setValue,
    toggle: () => state.setValue((pressed) => !pressed),
    getButtonProps(props = {}) {
      const disabled = options.disabled || props.disabled;
      return mergeProps<'button'>(props, {
        type: props.type ?? 'button',
        disabled,
        'aria-pressed': state.value,
        'data-scope': 'toggle',
        'data-part': 'root',
        'data-state': state.value ? 'on' : 'off',
        onClick: () => {
          if (!disabled) state.setValue((pressed) => !pressed);
        },
      });
    },
  };
}
