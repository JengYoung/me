import type { Rect } from "../_shared/positioning/index";

/** Inert targets are still valid visual anchors for a modal tour. */
export function isTourTargetAvailable(element: HTMLElement, document: Document) {
  if (!element.isConnected || element.ownerDocument !== document) return false;
  const view = document.defaultView!;
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const style = view.getComputedStyle(node);
    if (
      node.hidden ||
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.visibility === 'collapse' ||
      style.contentVisibility === 'hidden'
    )
      return false;
  }
  return true;
}

export function targetRect(element: HTMLElement): Rect {
  const { x, y, width, height } = element.getBoundingClientRect();
  return { x, y, width, height };
}
export const equalRect = (a: Rect | null, b: Rect) =>
  a?.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
