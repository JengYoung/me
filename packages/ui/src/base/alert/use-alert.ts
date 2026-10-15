'use client';
import { useStableId } from "../_shared/react/index";
import { connectAlert } from "./alert.connect";

export interface AlertOptions {
  id?: string;
}
/** Keep an empty region mounted and update its children when a message arrives. */
export function useAlert(options: AlertOptions = {}) {
  return connectAlert(useStableId('iris-alert', options.id));
}
export type { AlertApi } from "./alert.connect";
