/** 렌더링과 접촉 판정이 반드시 공유하는 입체 블록의 투영 규격입니다. */
export const BLOCK_VIEWS = 32;
export const BLOCK_TILE_PIXELS = 48;
export const BLOCK_DRAW_SCALE = 1.3;
export const BLOCK_UNIT_PIXELS = (BLOCK_TILE_PIXELS - 4) / 1.7;

type Point = readonly [number, number, number];
const VERTICES: readonly Point[] = [
  [-0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5],
  [0.5, 0.5, -0.5],
  [-0.5, 0.5, -0.5],
  [-0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5],
  [0.5, 0.5, 0.5],
  [-0.5, 0.5, 0.5],
];
const FACES: readonly { corners: readonly number[]; normal: Point }[] = [
  { corners: [0, 3, 2, 1], normal: [0, 0, -1] },
  { corners: [4, 5, 6, 7], normal: [0, 0, 1] },
  { corners: [0, 4, 7, 3], normal: [-1, 0, 0] },
  { corners: [1, 2, 6, 5], normal: [1, 0, 0] },
  { corners: [0, 1, 5, 4], normal: [0, -1, 0] },
  { corners: [3, 7, 6, 2], normal: [0, 1, 0] },
];

/** 시점별 정점·법선·실루엣 내부 반지름은 앱 수명 중 32번만 계산합니다. */
export const BLOCK_POSES = Array.from({ length: BLOCK_VIEWS }, (_, view) => {
  const yaw = (view / BLOCK_VIEWS) * Math.PI * 2 + 0.3;
  // 낮은 시선에서 조금 올려다보는 각도입니다. 넓은 윗면 대신 앞면/옆면과
  // 얇은 아랫면이 보이게 하며, 접촉 실루엣도 같은 정점에서 다시 계산합니다.
  const pitch = 0.12 + Math.sin(yaw * 2) * 0.035;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const rotate = ([x, y, z]: Point): Point => {
    const depth = -x * sy + z * cy;
    return [x * cy + z * sy, y * cp - depth * sp, y * sp + depth * cp];
  };
  const vertices = VERTICES.map(rotate);
  const faces = FACES.map((face) => ({ ...face, normal: rotate(face.normal) }))
    .filter((face) => face.normal[2] > 0)
    // oxlint-disable-next-line unicorn/no-array-sort -- 생성한 배열·TypedArray 버퍼를 제자리 정렬해 할당을 제한한다.
    .sort((a, b) => a.normal[2] - b.normal[2]);
  const factor = (BLOCK_UNIT_PIXELS / BLOCK_TILE_PIXELS) * BLOCK_DRAW_SCALE;
  // oxlint-disable-next-line unicorn/no-array-sort -- 생성한 배열·TypedArray 버퍼를 제자리 정렬해 할당을 제한한다.
  const points = vertices.map(([x, y]) => [x * factor, y * factor] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (a: readonly [number, number], b: readonly [number, number], c: readonly [number, number]) =>
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const hull: (readonly [number, number])[] = [];
  for (const point of points) {
    while (hull.length > 1 && cross(hull[hull.length - 2]!, hull[hull.length - 1]!, point) <= 0) hull.pop();
    hull.push(point);
  }
  const lower = hull.length;
  for (let i = points.length - 2; i >= 0; i -= 1) {
    const point = points[i]!;
    while (hull.length > lower && cross(hull[hull.length - 2]!, hull[hull.length - 1]!, point) <= 0) hull.pop();
    hull.push(point);
  }
  hull.pop();
  let radius = Infinity;
  for (let i = 0; i < hull.length; i += 1) {
    const a = hull[i]!;
    const b = hull[(i + 1) % hull.length]!;
    radius = Math.min(radius, Math.abs(a[0] * b[1] - a[1] * b[0]) / Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  // 원은 눈에 보이는 육각 실루엣 안에 완전히 들어갑니다. 두 원이 닿으면 실제
  // 그림도 반드시 닿거나 조금 겹치므로, 투명한 텍스처 여백 위에 쌓일 수 없습니다.
  return { vertices, faces, hull, radius };
});

export function blockView(source: number, angle: number) {
  return (((source + Math.round(angle * 6)) % BLOCK_VIEWS) + BLOCK_VIEWS) % BLOCK_VIEWS;
}
