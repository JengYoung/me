export type AttributeValue = string | number | boolean | null | undefined;

export const getAttributeValue = (element: Element, name: string): string | undefined => {
  return element.getAttribute(name) ?? undefined;
};

export const setAttributeValue = <T extends Element>(element: T, name: string, value: AttributeValue): T => {
  if (value === null || value === undefined) {
    element.removeAttribute(name);
    return element;
  }

  element.setAttribute(name, String(value));

  return element;
};

export const setAttributes = <T extends Element>(element: T, attributes: Record<string, AttributeValue>): T => {
  for (const [name, value] of Object.entries(attributes)) {
    setAttributeValue(element, name, value);
  }

  return element;
};
