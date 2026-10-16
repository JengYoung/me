export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Placement = Side | `${Side}-start` | `${Side}-end`;
export interface PositionOptions {
  placement?: Placement;
  offset?: number;
  collisionPadding?: number;
  dir?: 'ltr' | 'rtl';
}
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(min, max), Math.max(min, value));

/** Viewport coordinates for fixed-position content; logical alignment, flip then shift. */
export function computePosition(
  anchor: Rect,
  content: Pick<Rect, 'width' | 'height'>,
  viewport: Rect,
  options: PositionOptions = {},
) {
  const placement = options.placement ?? 'bottom-start';
  const [requested, alignment] = placement.split('-') as [Side, 'start' | 'end' | undefined];
  const gap = options.offset ?? 8;
  const pad = options.collisionPadding ?? 8;
  const left = viewport.x + pad;
  const top = viewport.y + pad;
  const right = viewport.x + viewport.width - pad;
  const bottom = viewport.y + viewport.height - pad;
  const room = {
    top: anchor.y - top - gap,
    bottom: bottom - anchor.y - anchor.height - gap,
    left: anchor.x - left - gap,
    right: right - anchor.x - anchor.width - gap,
  };
  const required = requested === 'top' || requested === 'bottom' ? content.height : content.width;
  const side =
    room[requested] < required && room[opposite[requested]] > room[requested] ? opposite[requested] : requested;
  const vertical = side === 'top' || side === 'bottom';
  const end = vertical && options.dir === 'rtl' ? alignment === 'start' : alignment === 'end';
  let x = anchor.x + (anchor.width - content.width) / 2;
  let y = anchor.y + (anchor.height - content.height) / 2;
  if (vertical) {
    if (alignment) x = end ? anchor.x + anchor.width - content.width : anchor.x;
    y = side === 'top' ? anchor.y - content.height - gap : anchor.y + anchor.height + gap;
  } else {
    if (alignment) y = end ? anchor.y + anchor.height - content.height : anchor.y;
    x = side === 'left' ? anchor.x - content.width - gap : anchor.x + anchor.width + gap;
  }
  return {
    x: clamp(x, left, right - content.width),
    y: clamp(y, top, bottom - content.height),
    placement: `${side}${alignment ? `-${alignment}` : ''}` as Placement,
    availableWidth: Math.max(0, vertical ? right - left : room[side]),
    availableHeight: Math.max(0, vertical ? room[side] : bottom - top),
    anchorWidth: anchor.width,
  };
}
