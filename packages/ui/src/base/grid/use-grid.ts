'use client';
import { useMachine, useStableId, useDirectionContext } from "../_shared/react/index";
import { useRovingFocus } from "../_shared/keyboard/index";
import { useState } from 'react';
import { gridMachine, gridFocused } from "./grid.machine";
import { gridItems, validateGrid } from "./grid.model";
import type { GridOptions } from "./grid.model";
import { connectGrid } from "./grid.connect";
export function useGrid(options: GridOptions) {
  validateGrid(options);
  const inherited = useDirectionContext();
  const props = { ...options, dir: options.dir ?? inherited };
  const id = useStableId('iris-grid', options.id);
  const [controlled] = useState(options.selectedRows !== undefined);
  const service = useMachine(gridMachine, { props });
  const roving = useRovingFocus({
    items: gridItems(options.rows),
    value: gridFocused(options, service.state.context),
    disabled: options.disabled,
    dir: props.dir,
    loop: false,
    keyboard: false,
    focusWithin: true,
    onValueChange: (key) => {
      if (key !== null) service.send({ type: 'FOCUS', key });
    },
  });
  if (controlled !== (options.selectedRows !== undefined))
    throw new Error('Grid cannot switch selection control modes.');
  return connectGrid(service, roving, { ...props, id });
}
export type { GridOptions, GridRow, GridCell, GridPosition } from "./grid.model";
export type { GridApi } from "./grid.connect";
