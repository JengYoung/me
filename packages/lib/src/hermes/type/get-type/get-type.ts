export type TypeofResult =
  | "undefined"
  | "object"
  | "boolean"
  | "number"
  | "bigint"
  | "string"
  | "symbol"
  | "function"
  | "array"
  | "null";

export const getType = (target: unknown): TypeofResult => {
  if (typeof target !== "object") {
    return typeof target;
  }

  if (target === null) {
    return "null";
  }

  if (Array.isArray(target)) {
    return "array";
  }

  return "object";
};
