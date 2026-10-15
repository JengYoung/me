import { mergeProps } from "../_shared/react/index";
import type { PartProps } from "../_shared/react/index";
import type { TextFieldApi, TextFieldInputProps } from "../text-field/index";
import type { MouseEvent, RefCallback } from 'react';
import type { PasswordInputOptions } from "./use-password-input";

export function connectPasswordInput(
  text: TextFieldApi,
  options: PasswordInputOptions & { visible: boolean },
  actions: {
    ref: RefCallback<HTMLInputElement>;
    show(): void;
    hide(): void;
    toggle(): void;
    preserveFocus(event: MouseEvent<HTMLButtonElement>): void;
    clearSelection(): void;
  },
) {
  const data = (part: string) => ({
    'data-scope': 'password-input',
    'data-part': part,
    'data-state': options.visible ? 'visible' : 'hidden',
  });
  return {
    ids: text.ids,
    visible: options.visible,
    getValue: text.getValue,
    show: actions.show,
    hide: actions.hide,
    toggle: actions.toggle,
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
        ref: actions.ref,
        onInput: actions.clearSelection,
        onBlur: actions.clearSelection,
        onPointerDown: actions.clearSelection,
        onKeyDown: actions.clearSelection,
      });
    },
    getToggleProps(user: PartProps<'button'> = {}): PartProps<'button'> {
      return mergeProps<'button'>(user, {
        ...data('toggle'),
        type: 'button',
        disabled: !!options.disabled,
        'aria-label': user['aria-label'] ?? options.toggleLabel ?? '비밀번호 표시',
        'aria-pressed': options.visible,
        'aria-controls': text.ids.control,
        // Cancel focus transfer, while retaining the click synthesized by touch browsers.
        onMouseDown(event) {
          if (!options.disabled) actions.preserveFocus(event);
        },
        onClick() {
          if (!options.disabled) actions.toggle();
        },
      });
    },
  };
}
export type PasswordInputApi = ReturnType<typeof connectPasswordInput>;
