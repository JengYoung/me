type ClassNameInput = string | readonly string[];

const normalizeClassNames = (classNames: ClassNameInput): string[] => {
  const values =
    typeof classNames === "string" ? classNames.split(/\s+/) : classNames.flatMap((name) => name.split(/\s+/));

  return values.map((name) => name.trim()).filter((name) => name.length > 0);
};

export const hasClass = (element: Element, className: string): boolean => {
  const [normalizedClassName, extraClassName] = normalizeClassNames(className);

  if (normalizedClassName === undefined || extraClassName !== undefined) {
    return false;
  }

  return element.classList.contains(normalizedClassName);
};

export const addClass = <T extends Element>(element: T, classNames: ClassNameInput): T => {
  const normalizedClassNames = normalizeClassNames(classNames);

  if (normalizedClassNames.length > 0) {
    element.classList.add(...normalizedClassNames);
  }

  return element;
};

export const removeClass = <T extends Element>(element: T, classNames: ClassNameInput): T => {
  const normalizedClassNames = normalizeClassNames(classNames);

  if (normalizedClassNames.length > 0) {
    element.classList.remove(...normalizedClassNames);
  }

  return element;
};

export const toggleClass = (element: Element, className: string, force?: boolean): boolean => {
  const [normalizedClassName, extraClassName] = normalizeClassNames(className);

  if (normalizedClassName === undefined || extraClassName !== undefined) {
    return false;
  }

  return element.classList.toggle(normalizedClassName, force);
};
