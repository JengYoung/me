import { mergeProps } from '../_shared/react/index';
import type { BooleanStateApi, PropGetter } from '../_shared/react/index';

export interface DisclosureApi {
  readonly open: boolean;
  setOpen: BooleanStateApi['setValue'];
  toggle(): void;
  getTriggerProps: PropGetter<'button'>;
  getContentProps: PropGetter<'div'>;
}

/** Internal DOM binding shared by hook-only consumers and every headless part. */
export function connectDisclosure(state: BooleanStateApi, options: { id: string; disabled?: boolean }): DisclosureApi {
  const { id } = options;
  return {
    open: state.value,
    setOpen: state.setValue,
    toggle: () => state.setValue((open) => !open),
    getTriggerProps(props = {}) {
      const disabled = options.disabled || props.disabled;
      return mergeProps<'button'>(props, {
        id: `${id}-trigger`,
        type: props.type ?? 'button',
        disabled,
        'aria-expanded': state.value,
        'aria-controls': `${id}-content`,
        'data-scope': 'disclosure',
        'data-part': 'trigger',
        'data-state': state.value ? 'open' : 'closed',
        onClick: () => {
          if (!disabled) state.setValue((open) => !open);
        },
      });
    },
    getContentProps(props = {}) {
      return mergeProps<'div'>(props, {
        id: `${id}-content`,
        hidden: !state.value,
        'data-scope': 'disclosure',
        'data-part': 'content',
        'data-state': state.value ? 'open' : 'closed',
      });
    },
  };
}
