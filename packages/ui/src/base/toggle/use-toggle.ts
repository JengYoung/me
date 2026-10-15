'use client';

import { useBooleanState } from "../_shared/react/index";
import { connectToggle } from "./toggle.connect";

export type { ToggleApi } from "./toggle.connect";

export interface ToggleOptions {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
}

export function useToggle(options: ToggleOptions = {}) {
  const state = useBooleanState({
    value: options.pressed,
    defaultValue: options.defaultPressed,
    onValueChange: options.onPressedChange,
  });
  return connectToggle(state, { disabled: options.disabled });
}
