'use client';

import { DirectionProvider, mergeProps, useDirection } from "../_shared/react/index";
import type { Direction, PartProps } from "../_shared/react/index";

export type DirectionRootProps = Omit<PartProps<'div'>, 'dir'> & { dir?: Direction };

/** An optional DOM boundary sharing exactly the same resolved context as useDirection. */
export function DirectionRoot({ dir: explicit, ...props }: DirectionRootProps) {
  const dir = useDirection(explicit);
  return (
    <DirectionProvider dir={dir}>
      <div {...mergeProps<'div'>(props, { dir, 'data-scope': 'direction', 'data-part': 'root' })} />
    </DirectionProvider>
  );
}
