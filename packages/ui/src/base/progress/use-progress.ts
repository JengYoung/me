'use client';
import { useStableId } from "../_shared/react/index";
import { connectProgress } from "./progress.connect";
import type { ProgressOptions } from "./progress.connect";
export function useProgress(options: ProgressOptions = {}) {
  return connectProgress({ ...options, id: useStableId('iris-progress', options.id) });
}
export type { ProgressApi, ProgressOptions } from "./progress.connect";
