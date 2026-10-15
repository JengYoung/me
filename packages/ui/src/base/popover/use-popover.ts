'use client';
import { useState } from 'react';
import { useBooleanState, useDirection, useStableId } from "../_shared/react/index";
import { useLayerFocus } from "../_shared/focus/index";
import type { LayerFocusOptions } from "../_shared/focus/index";
import { usePosition } from "../_shared/positioning/index";
import type { PositionOptions } from "../_shared/positioning/index";
import { connectPopover } from "./popover.connect";

export interface PopoverOptions extends PositionOptions, Omit<LayerFocusOptions, 'open' | 'onDismiss' | 'trigger'> {
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  describedBy?: string | null;
}
export function usePopover(options: PopoverOptions = {}) {
  const id = useStableId('iris-popover', options.id);
  const dir = useDirection(options.dir);
  const state = useBooleanState({
    value: options.open,
    defaultValue: options.defaultOpen,
    onValueChange: options.onOpenChange,
  });
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  const focus = useLayerFocus({
    ...options,
    open: state.value,
    modal: options.modal ?? false,
    trigger: () => trigger,
    returnFocus: () => options.returnFocus?.() ?? trigger,
    closeOnOutside: options.closeOnOutside ?? true,
    onDismiss: () => state.setValue(false),
  });
  const position = usePosition({
    ...options,
    dir,
    open: state.value,
    anchor: anchor ?? trigger,
    content,
    onAnchorHidden: () => state.setValue(false),
  });
  return connectPopover(state, focus, position, { ...options, id, dir }, { setTrigger, setAnchor, setContent });
}
export type { PopoverApi } from "./popover.connect";
