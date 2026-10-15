import type { Point } from "../ccw/index";

export const polygonArea = (points: Point[]) => {
  let doubledArea = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    doubledArea += current.x * next.y - current.y * next.x;
  }

  return Math.abs(doubledArea) / 2;
};
