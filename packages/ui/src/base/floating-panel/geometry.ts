export interface PanelPoint {
  x: number;
  y: number;
}
export interface PanelSize {
  width: number;
  height: number;
}
export interface PanelRect extends PanelPoint, PanelSize {}
export type PanelResizeEdge = 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
export interface PanelConstraints {
  minSize?: PanelSize;
  maxSize?: PanelSize;
  /** A rectangle in viewport coordinates, intersected with the visible viewport. */
  boundary?: PanelRect;
}
export const panelEdges: readonly PanelResizeEdge[] = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'];
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function panelBounds(options: PanelConstraints, viewport: PanelRect | null): PanelRect | null {
  const boundary = options.boundary;
  if (!boundary) return viewport;
  if (!viewport) return boundary;
  const x = clamp(boundary.x, viewport.x, viewport.x + viewport.width);
  const y = clamp(boundary.y, viewport.y, viewport.y + viewport.height);
  return {
    x,
    y,
    width: Math.max(0, Math.min(boundary.x + boundary.width, viewport.x + viewport.width) - x),
    height: Math.max(0, Math.min(boundary.y + boundary.height, viewport.y + viewport.height) - y),
  };
}

export function panelLimits(options: PanelConstraints, bounds: PanelRect | null) {
  const maxWidth = Math.min(options.maxSize?.width ?? Infinity, bounds?.width ?? Infinity);
  const maxHeight = Math.min(options.maxSize?.height ?? Infinity, bounds?.height ?? Infinity);
  return {
    minWidth: Math.min(options.minSize?.width ?? 180, maxWidth),
    minHeight: Math.min(options.minSize?.height ?? 100, maxHeight),
    maxWidth,
    maxHeight,
  };
}

export function constrainPanel(rect: PanelRect, options: PanelConstraints, bounds: PanelRect | null): PanelRect {
  const limits = panelLimits(options, bounds);
  const width = clamp(rect.width, limits.minWidth, limits.maxWidth);
  const height = clamp(rect.height, limits.minHeight, limits.maxHeight);
  return {
    x: bounds ? clamp(rect.x, bounds.x, bounds.x + bounds.width - width) : rect.x,
    y: bounds ? clamp(rect.y, bounds.y, bounds.y + bounds.height - height) : rect.y,
    width,
    height,
  };
}

/** Resize around the opposite edge; constraints never translate that fixed edge. */
export function resizePanel(
  rect: PanelRect,
  edge: PanelResizeEdge,
  dx: number,
  dy: number,
  options: PanelConstraints,
  bounds: PanelRect | null,
): PanelRect {
  const limits = panelLimits(options, bounds);
  const west = edge.includes('w');
  const north = edge.includes('n');
  const availableWidth = bounds ? (west ? rect.x + rect.width - bounds.x : bounds.x + bounds.width - rect.x) : Infinity;
  const availableHeight = bounds
    ? north
      ? rect.y + rect.height - bounds.y
      : bounds.y + bounds.height - rect.y
    : Infinity;
  const width =
    edge.includes('e') || west
      ? clamp(
          rect.width + (west ? -dx : dx),
          Math.min(limits.minWidth, availableWidth),
          Math.min(limits.maxWidth, availableWidth),
        )
      : rect.width;
  const height =
    edge.includes('s') || north
      ? clamp(
          rect.height + (north ? -dy : dy),
          Math.min(limits.minHeight, availableHeight),
          Math.min(limits.maxHeight, availableHeight),
        )
      : rect.height;
  return {
    x: west ? rect.x + rect.width - width : rect.x,
    y: north ? rect.y + rect.height - height : rect.y,
    width,
    height,
  };
}

export function validatePanelGeometry(
  options: PanelConstraints & {
    position?: PanelPoint;
    defaultPosition?: PanelPoint;
    size?: PanelSize;
    defaultSize?: PanelSize;
  },
) {
  for (const point of [options.position, options.defaultPosition, options.boundary])
    if (point && (!Number.isFinite(point.x) || !Number.isFinite(point.y)))
      throw new Error('Floating Panel coordinates must be finite.');
  for (const size of [options.size, options.defaultSize, options.minSize, options.maxSize, options.boundary])
    if (size && (!Number.isFinite(size.width) || !Number.isFinite(size.height) || size.width <= 0 || size.height <= 0))
      throw new Error('Floating Panel sizes must be finite and positive.');
  if (
    (options.minSize?.width ?? 180) > (options.maxSize?.width ?? Infinity) ||
    (options.minSize?.height ?? 100) > (options.maxSize?.height ?? Infinity)
  )
    throw new Error('Floating Panel minimum size cannot exceed maximum size.');
}
