'use client';

import type { PartProps } from '../_shared/react/index';
import { useToggle } from './use-toggle';
import type { ToggleOptions } from './use-toggle';

export type ToggleProps = PartProps<'button'> & ToggleOptions;

export function Toggle({ pressed, defaultPressed, onPressedChange, disabled, ...props }: ToggleProps) {
  const api = useToggle({ pressed, defaultPressed, onPressedChange, disabled });
  return <button {...api.getButtonProps(props)} />;
}
