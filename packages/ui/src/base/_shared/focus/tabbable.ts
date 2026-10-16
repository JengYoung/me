const candidateSelector =
  'a[href],area[href],button,input,select,textarea,summary,iframe,object,embed,audio[controls],video[controls],[tabindex],[contenteditable]:not([contenteditable="false"])';

const tabOrder = (element: HTMLElement) =>
  !element.hasAttribute('tabindex') &&
  (element.isContentEditable || element.matches('details > summary:first-of-type,audio[controls],video[controls]'))
    ? 0
    : element.tabIndex;

export function isVisible(element: HTMLElement): boolean {
  if (!element.isConnected || element.closest('[hidden]')) return false;
  const view = element.ownerDocument.defaultView;
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const style = view?.getComputedStyle(node);
    if (
      style?.display === 'none' ||
      style?.visibility === 'hidden' ||
      style?.visibility === 'collapse' ||
      style?.contentVisibility === 'hidden'
    )
      return false;
    if (node.parentElement?.matches('details:not([open])') && !node.matches('summary:first-of-type')) return false;
  }
  return true;
}

export function isAvailable(element: HTMLElement): boolean {
  return !element.matches(':disabled') && !element.closest('[inert]') && isVisible(element);
}

/** Native radio groups contribute one Tab stop. Positive tabindex follows browser order. */
export function getTabbableElements(content: HTMLElement): HTMLElement[] {
  const candidates = [...content.querySelectorAll<HTMLElement>(candidateSelector)].filter(
    (element) => tabOrder(element) >= 0 && !element.matches('input[type="hidden"]') && isAvailable(element),
  );
  return candidates
    .filter((element) => {
      if (!element.matches('input[type="radio"][name]')) return true;
      const radio = element as HTMLInputElement;
      if (!radio.name) return true;
      const group = candidates.filter(
        (item) =>
          item.matches('input[type="radio"]') &&
          (item as HTMLInputElement).name === radio.name &&
          (item as HTMLInputElement).form === radio.form,
      ) as HTMLInputElement[];
      return (group.find((item) => item.checked) ?? group[0]) === radio;
    })
    .sort((first, second) => (tabOrder(first) || Infinity) - (tabOrder(second) || Infinity));
}

export function focusElement(element: HTMLElement | null | undefined): boolean {
  if (!element || !isAvailable(element)) return false;
  element.focus({ preventScroll: true });
  return element.ownerDocument.activeElement === element;
}
