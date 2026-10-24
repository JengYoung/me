import { describe, expect, it } from 'vitest';
import { GRID_LIMITS, GridPhysics, measureGrid } from './grid-physics';

function seededRandom(seed = 42) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };
}

describe('grid performance budgets', () => {
  it.each([
    [390, 844, 3],
    [1920, 1080, 2],
    [3840, 2160, 2],
    [7680, 4320, 3],
    [160, 12000, 2],
  ])('preserves every cell at %i×%i and DPR %i within the rendering and collision budgets', (width, height, dpr) => {
    const grid = measureGrid(width, height, dpr);
    const physics = new GridPhysics(grid, seededRandom());
    expect(grid.count).toBeLessThanOrEqual(GRID_LIMITS.cells);
    expect(grid.pixelWidth * grid.pixelHeight).toBeLessThanOrEqual(GRID_LIMITS.pixels);
    expect(grid.cols * grid.cell).toBeGreaterThanOrEqual(width);
    expect(grid.rows * grid.cell).toBeGreaterThanOrEqual(height);
    expect(grid.cell).toBeGreaterThanOrEqual(24);
    expect(physics.count).toBe(grid.count);
    expect(physics.foregroundCount).toBe(Math.ceil(grid.count / 3));
    expect(physics.foregroundCount).toBeLessThanOrEqual(800);
    expect(physics.x).toHaveLength(physics.count);
    expect(new Set(physics.source).size).toBe(physics.count);
    expect([...physics.source].every((index) => index >= 0 && index < grid.count)).toBe(true);
  });
});

describe('grid depth flight', () => {
  it('starts every fragment at its original cell and draws far fragments first', () => {
    const grid = measureGrid(480, 320);
    const physics = new GridPhysics(grid, seededRandom());
    for (let i = 0; i < physics.count; i += 1) {
      const source = physics.source[i]!;
      expect(physics.screenX[i]!).toBe(((source % grid.cols) + 0.5) * grid.cell);
      expect(physics.screenY[i]!).toBe((Math.floor(source / grid.cols) + 0.5) * grid.cell);
      expect(physics.scale[i]!).toBe(1);
      expect(physics.opacity[i]!).toBe(1);
    }
    for (let frame = 0; frame < 30; frame += 1) physics.step();
    const depths = [...physics.drawOrder].map((index) => physics.z[index]!);
    expect(depths).toEqual([...depths].sort((a, b) => b - a));
  });

  it('retreats in depth without making the retained fragments transparent', () => {
    const physics = new GridPhysics(measureGrid(3840, 2160), seededRandom());
    for (let frame = 0; frame < 6; frame += 1) physics.step();
    const previousDepth = [...physics.z];
    const previousScale = [...physics.scale];
    const previousAlpha = [...physics.opacity];
    physics.step();
    for (let i = 0; i < physics.count; i += 1) {
      expect(physics.z[i]!).toBeGreaterThan(previousDepth[i]!);
      expect(physics.vy[i]!).toBeGreaterThanOrEqual(0);
      expect(physics.scale[i]!).toBeLessThan(previousScale[i]!);
      expect(physics.opacity[i]!).toBeLessThanOrEqual(previousAlpha[i]!);
      expect(physics.opacity[i]!).toBeLessThan(1);
      expect(physics.opacity[i]!).toBeGreaterThan(0.6);
      expect(physics.scale[i]!).toBeCloseTo(physics.focalLength / (physics.focalLength + physics.z[i]!), 5);
      expect(Number.isFinite(physics.screenX[i]! + physics.screenY[i]!)).toBe(true);
    }
  });

  it.each([
    [390, 844],
    [3840, 2160],
  ])('keeps all cells piled at the bottom of %i×%i without bouncing or disappearing', (width, height) => {
    const physics = new GridPhysics(measureGrid(width, height), seededRandom());
    const resting = new Map<number, [number, number, number]>();
    let upwardSteps = 0;
    let movedAfterResting = 0;
    for (let frame = 0; frame < 480 && physics.awake; frame += 1) {
      physics.step();
      for (let i = 0; i < physics.count; i += 1) {
        if (physics.vy[i]! < 0) upwardSteps += 1;
        const rest = resting.get(i);
        if (rest) {
          if (physics.x[i]! !== rest[0]! || physics.y[i]! !== rest[1]! || physics.angle[i]! !== rest[2]!)
            movedAfterResting += 1;
        } else if (physics.sleeping[i]!) {
          resting.set(i, [physics.x[i]!, physics.y[i]!, physics.angle[i]!]);
        }
      }
    }
    expect(upwardSteps).toBe(0);
    expect(movedAfterResting).toBe(0);
    expect(physics.awake).toBe(0);
    expect(physics.age).toBeLessThan(2);
    expect(physics.count).toBe(physics.grid.count);
    expect([...physics.opacity].filter((alpha) => alpha > 0.6)).toHaveLength(physics.count);
    expect([...physics.sleeping].every((value) => value === 1)).toBe(true);
    expect([...physics.y].every((y, i) => y > height * 0.5 && y <= physics.floorAt(physics.scale[i]!))).toBe(true);
    const positions = [...physics.y];
    const age = physics.age;
    for (let frame = 0; frame < 120; frame += 1) physics.step();
    expect([...physics.y]).toEqual(positions);
    expect(physics.age).toBe(age);
  });

  it('connects the front third and rear two thirds with continuous sizes on one projected floor', () => {
    const physics = new GridPhysics(measureGrid(1920, 1080), seededRandom());
    for (let frame = 0; frame < 120 && physics.awake; frame += 1) physics.step();
    const foreground = physics.scale.slice(0, physics.foregroundCount);
    const background = physics.scale.slice(physics.foregroundCount);
    expect(background).toHaveLength(physics.count - Math.ceil(physics.count / 3));
    expect(Math.max(...background)).toBeLessThan(Math.min(...foreground));
    // 가장 먼 앞쪽 조각과 가장 가까운 뒤쪽 조각 사이에 눈에 띄는 크기 단절이 없어야 합니다.
    expect(Math.min(...foreground) - Math.max(...background)).toBeLessThan(0.01);
    expect(Math.min(...background)).toBeGreaterThan(0.57);
    const nearestDepth = Math.max(...physics.z.slice(0, physics.foregroundCount));
    expect(Math.min(...physics.z.slice(physics.foregroundCount))).toBeGreaterThan(nearestDepth);
    const groundClearance = [];
    for (let i = 0; i < physics.count; i += 1) {
      const projectedFloor = physics.floorAt(physics.scale[i]!);
      groundClearance.push(projectedFloor - physics.y[i]! - physics.extentY[i]!);
    }
    // 가장 먼 지면까지 뷰포트 밖에 있어 블록 밑으로 흰 바닥 띠가 드러나지 않습니다.
    const floors = Array.from(physics.scale, (scale) => physics.floorAt(scale));
    expect(Math.min(...floors)).toBeGreaterThan(physics.grid.height + physics.side * 0.3);
    expect(Math.max(...floors) - Math.min(...floors)).toBeLessThan(physics.side * 0.2);
    expect(groundClearance.every((distance) => distance >= -0.001)).toBe(true);
    expect(groundClearance.slice(physics.foregroundCount).some((distance) => distance > physics.side)).toBe(true);
    expect(groundClearance.slice(0, physics.foregroundCount).some((distance) => distance > physics.side)).toBe(true);
  });

  it('scatters the rear fragments across continuous depths and positions instead of fixed planes and columns', () => {
    const physics = new GridPhysics(measureGrid(1920, 1080), seededRandom());
    for (let frame = 0; frame < 120 && physics.awake; frame += 1) physics.step();
    const start = physics.foregroundCount;
    const count = physics.count - start;
    const depths = new Set(Array.from(physics.z.subarray(start), (z) => Math.round((z / physics.focalLength) * 100)));
    const positions = new Set(Array.from(physics.x.subarray(start), (x) => x.toFixed(2)));
    const angles = new Set(Array.from(physics.angle.subarray(start), (angle) => Math.round(angle * 10)));
    expect(depths.size).toBeGreaterThan(35);
    expect(positions.size).toBeGreaterThan(count * 0.95);
    expect(angles.size).toBeGreaterThan(12);
    expect(new Set(physics.view.subarray(start)).size).toBeGreaterThan(24);
    expect(physics.x.subarray(start).every((x) => x > -physics.side && x < physics.grid.width + physics.side)).toBe(
      true,
    );
  });

  it('keeps the drawing order correct while fragments overtake each other in depth', () => {
    const physics = new GridPhysics(measureGrid(640, 360), seededRandom());
    for (let frame = 0; frame < 30; frame += 1) {
      physics.step();
      const depths = [...physics.drawOrder].map((index) => physics.z[index]!);
      expect(depths).toEqual([...depths].sort((a, b) => b - a));
    }
  });

  it.each([
    [3840, 2160, 17],
    [3840, 2160, 42],
    [3840, 2160, 1337],
    [3840, 2160, 65537],
    [1920, 1080, 327685],
    [1920, 1080, 720907],
    [1920, 1080, 917518],
  ])('stops every rotation on real, stable supports at %i×%i (seed %i)', (width, height, seed) => {
    const physics = new GridPhysics(measureGrid(width, height), seededRandom(seed));
    let sliding = 0;
    for (let frame = 0; frame < 180 && physics.awake; frame += 1) {
      physics.step();
      sliding += physics.vx.filter((speed) => Math.abs(speed) > physics.grid.cell).length;
    }
    expect(sliding).toBeGreaterThan(0);
    expect(physics.awake).toBe(0);
    expect(physics.age).toBeLessThan(2.5);
    expect(physics.spin.every((spin) => spin === 0)).toBe(true);
    expect(physics.balanced.every((balanced) => balanced === 1)).toBe(true);
    const contacts = Array.from(physics.support, (support, i) => {
      if (support < 0)
        return Math.abs(physics.y[i]! + physics.extentY[i]! - physics.floorAt(physics.scale[i]!)) < 0.002;
      return (
        physics.sleeping[support]! === 1 &&
        physics.y[i]! < physics.y[support]! &&
        Math.hypot(physics.x[i]! - physics.x[support]!, physics.y[i]! - physics.y[support]!) <=
          physics.contactRadius[i]! + physics.contactRadius[support]! + 0.002
      );
    });
    expect(contacts.every(Boolean)).toBe(true);
    const positions = [...physics.x, ...physics.y, ...physics.angle];
    for (let frame = 0; frame < 120; frame += 1) physics.step();
    expect([...physics.x, ...physics.y, ...physics.angle]).toEqual(positions);
  });

  it('shows the retained pile immediately for reduced motion', () => {
    const physics = new GridPhysics(measureGrid(480, 320), seededRandom());
    physics.finish();
    physics.step();
    expect(physics.awake).toBe(0);
    expect(physics.age).toBe(0);
    expect([...physics.opacity].every((alpha) => alpha > 0.6)).toBe(true);
    expect([...physics.y].every((y, i) => y > 160 && y <= physics.floorAt(physics.scale[i]!))).toBe(true);
  });
});
