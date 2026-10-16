export type Point = {
  x: number;
  y: number;
};

export const ccw = (a: Point, b: Point, c: Point) => {
  const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

  if (cross > 0) {
    return 1;
  }

  if (cross < 0) {
    return -1;
  }

  return 0;
};

export const distanceSquare = (a: Point, b: Point) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return dx * dx + dy * dy;
};
