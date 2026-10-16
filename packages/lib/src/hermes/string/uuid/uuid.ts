// Node 18 이하라면
import { randomUUID } from "node:crypto";

export const uuid = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return randomUUID();
};
