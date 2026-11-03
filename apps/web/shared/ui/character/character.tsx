'use client';

import { forwardRef, useId } from 'react';
import type { SVGProps } from 'react';
import { GHOST_PUPPY_ARTWORK, GHOST_PUPPY_PATHS, GHOST_PUPPY_VARIANTS } from './character.generated';
import type { CharacterExpression } from './character.generated';
import type { CharacterNode } from './character.types';

export type CharacterMotionPart =
  | 'character-motion'
  | 'ear-left-motion'
  | 'ear-right-motion'
  | 'eye-left-motion'
  | 'eye-right-motion';

export interface CharacterProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  expression?: CharacterExpression;
  size?: number;
  decorative?: boolean;
  showEffects?: boolean;
  motionTransforms?: Partial<Record<CharacterMotionPart, string>>;
}

function ArtworkNode({
  node,
  prefix,
  showEffects,
  motionTransforms,
}: {
  node: CharacterNode;
  prefix: string;
  showEffects: boolean;
  motionTransforms: CharacterProps['motionTransforms'];
}) {
  if (!showEffects && (node.id === 'effects' || node.id === 'face-effects')) return null;

  const attributes = { id: `${prefix}-${node.id}`, 'data-part': node.id };
  if (node.tag === 'path') {
    return <path {...attributes} d={GHOST_PUPPY_PATHS[node.path]} fill={node.fill} />;
  }

  return (
    <g
      {...attributes}
      transform={motionTransforms?.[node.id as CharacterMotionPart] ?? node.transform}
      opacity={node.opacity}
    >
      {node.children.map((child) => (
        <ArtworkNode
          key={child.id}
          node={child}
          prefix={prefix}
          showEffects={showEffects}
          motionTransforms={motionTransforms}
        />
      ))}
    </g>
  );
}

export const Character = forwardRef<SVGSVGElement, CharacterProps>(
  (
    {
      expression = 'neutral',
      size = 160,
      decorative = false,
      showEffects = true,
      motionTransforms,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref,
  ) => {
    const instanceId = useId();
    const prefix = `character-${instanceId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const titleId = `${prefix}-title`;
    const variant = GHOST_PUPPY_VARIANTS.find((item) => item.expression === expression)!;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        {...props}
        ref={ref}
        viewBox="0 0 1024 1024"
        role={decorative ? undefined : 'img'}
        aria-hidden={decorative ? true : undefined}
        aria-label={decorative ? undefined : ariaLabel}
        aria-labelledby={decorative ? undefined : (ariaLabelledBy ?? (ariaLabel ? undefined : titleId))}
        focusable="false"
        data-expression={expression}
      >
        {!decorative && <title id={titleId}>{variant.label} 젱영</title>}
        {GHOST_PUPPY_ARTWORK[expression].map((node) => (
          <ArtworkNode
            key={node.id}
            node={node}
            prefix={prefix}
            showEffects={showEffects}
            motionTransforms={motionTransforms}
          />
        ))}
      </svg>
    );
  },
);

Character.displayName = 'Character';
