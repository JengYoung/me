'use client';
import { useMachine } from "../_shared/react/index";
import { useState } from 'react';
import { buttonMachine } from "./button.machine";
import type { ButtonOptions } from "./button.machine";
import { connectButton } from "./button.connect";

export function useButton(options: ButtonOptions = {}) {
  const [mode] = useState({ toggle: !!options.toggle, controlled: options.pressed !== undefined });
  const service = useMachine(buttonMachine, { props: options });
  if (mode.toggle !== !!options.toggle || mode.controlled !== (options.pressed !== undefined))
    throw new Error('Button cannot switch toggle or control modes. Remount with a new key.');
  return connectButton(service, options);
}
export type { ButtonOptions } from "./button.machine";
export type { ButtonApi } from "./button.connect";
