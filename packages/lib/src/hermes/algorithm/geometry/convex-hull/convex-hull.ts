import { type Point, ccw } from "../ccw/index";

const comparePoint = (a: Point, b: Point) => {
  if (a.x !== b.x) {
    return a.x - b.x;
  }

  return a.y - b.y;
};

const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

export const convexHull = (points: Point[]) => {
  const sorted = [...points].sort(comparePoint).filter((point, index, values) => {
    return index === 0 || !samePoint(point, values[index - 1]);
  });

  if (sorted.length <= 1) {
    return sorted;
  }

  const lower: Point[] = [];
  for (const point of sorted) {
    while (lower.length >= 2 && ccw(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }

  const upper: Point[] = [];
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const point = sorted[index];
    while (upper.length >= 2 && ccw(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }

  lower.pop();
  upper.pop();

  return [...lower, ...upper];
};
