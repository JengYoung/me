'use client';
import type { PartProps } from '../_shared/react/index';
import { useButton } from './use-button';
import type { ButtonOptions } from './use-button';

export type ButtonProps = PartProps<'button'> & ButtonOptions;
export function Button({ toggle, pressed, defaultPressed, onPressedChange, onPress, disabled, ...props }: ButtonProps) {
  const api = useButton({ toggle, pressed, defaultPressed, onPressedChange, onPress, disabled });
  return <button {...api.getButtonProps(props)} />;
}
