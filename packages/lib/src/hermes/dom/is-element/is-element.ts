export const isElement = (value: unknown, tagName?: string): value is Element => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as {
    nodeName?: unknown;
    nodeType?: unknown;
  };

  if (candidate.nodeType !== 1 || typeof candidate.nodeName !== "string") {
    return false;
  }

  if (tagName === undefined) {
    return true;
  }

  return candidate.nodeName.toLowerCase() === tagName.trim().toLowerCase();
};
