'use client';
import { validateCollection } from "../_shared/core/index";
import { useMachine, useStableId } from "../_shared/react/index";
import { useRovingFocus } from "../_shared/keyboard/index";
import { useState } from 'react';
import { toggleGroupMachine, toggleGroupValue } from "./toggle-group.machine";
import type { ToggleGroupOptions } from "./toggle-group.machine";
import { connectToggleGroup } from "./toggle-group.connect";

export function useToggleGroup(options: ToggleGroupOptions) {
  validateCollection(options.items);
  const [controlled] = useState(options.value !== undefined);
  const id = useStableId('iris-toggle-group', options.id);
  const service = useMachine(toggleGroupMachine, { props: options });
  const roving = useRovingFocus({
    items: options.items,
    defaultValue: toggleGroupValue(options, service.state.context)[0],
    orientation: options.orientation ?? 'horizontal',
    dir: options.dir,
    loop: options.loop,
    disabled: options.disabled,
    keyboard: options.rovingFocus !== false,
  });
  if (controlled !== (options.value !== undefined)) throw new Error('ToggleGroup cannot switch control modes.');
  return connectToggleGroup(service, roving, { ...options, id });
}
export type { ToggleGroupOptions } from "./toggle-group.machine";
export type { ToggleGroupApi } from "./toggle-group.connect";
