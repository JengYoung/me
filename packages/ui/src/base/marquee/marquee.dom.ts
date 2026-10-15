/** Copies are inert visual DOM snapshots, never React mounts of the source's children. */
export function syncMarqueeCopy(source: HTMLDivElement, copy: HTMLDivElement) {
  const fragment = source.ownerDocument.createDocumentFragment();
  for (const node of source.childNodes) fragment.append(node.cloneNode(true));
  for (const element of fragment.querySelectorAll('*')) {
    if (element.matches('script,style,link,iframe,object,embed,audio,video')) {
      element.remove();
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      if (
        attribute.name === 'id' ||
        attribute.name === 'name' ||
        attribute.name === 'for' ||
        attribute.name === 'form' ||
        attribute.name === 'autofocus' ||
        attribute.name === 'contenteditable' ||
        attribute.name.startsWith('aria-') ||
        attribute.name.startsWith('on')
      )
        element.removeAttribute(attribute.name);
    }
    if (element.matches('a,area,button,input,select,textarea,summary,[tabindex]'))
      element.setAttribute('tabindex', '-1');
  }
  copy.replaceChildren(fragment);
}
