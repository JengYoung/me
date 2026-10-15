'use client';
import { useStableId } from "../_shared/react/index";
import { connectLandmark } from "./landmarks.connect";
import type { LandmarkKind, LandmarkOptions } from "./landmarks.connect";

export function useLandmark<Kind extends LandmarkKind>(options: LandmarkOptions<Kind>) {
  return connectLandmark({ ...options, id: useStableId('iris-landmark', options.id) });
}
export type { LandmarkApi, LandmarkElement, LandmarkKind, LandmarkOptions } from "./landmarks.connect";
