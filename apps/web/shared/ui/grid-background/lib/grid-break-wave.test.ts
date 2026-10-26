import { describe, expect, it } from 'vitest';
import { BREAK_WAVE, GridBreakWave } from './grid-break-wave';
import { measureGrid } from './grid-physics';

describe('centered break wave', () => {
  it.each([
    [640, 360],
    [390, 844],
    [3840, 2160],
  ])('activates a circular front from the viewport center at %i×%i', (width, height) => {
    const grid = measureGrid(width, height);
    const wave = new GridBreakWave(grid, 17);
    const distances = Array.from({ length: grid.count }, (_, index) => {
      const left = (index % grid.cols) * grid.cell;
      const top = Math.floor(index / grid.cols) * grid.cell;
      return Math.hypot(
        (left + Math.min(left + grid.cell, width)) / 2 - width / 2,
        (top + Math.min(top + grid.cell, height)) / 2 - height / 2,
      );
    });
    wave.advance(BREAK_WAVE.duration * 0.4);
    const active = new Set(wave.order.slice(0, wave.active));
    const radius = Math.max(...distances) * 0.4;
    expect(active.size).toBeGreaterThan(0);
    expect(active.size).toBeLessThan(grid.count);
    for (let index = 0; index < grid.count; index += 1) {
      expect(active.has(index)).toBe(distances[index]! <= radius);
    }
    const ordered = [...wave.order].map((index) => distances[index]!);
    // Float32 저장과 Math.hypot의 대칭 좌표 반올림 차이는 0.001px 이내로 허용합니다.
    expect(ordered.every((distance, index) => index === 0 || distance >= ordered[index - 1]! - 0.001)).toBe(true);
    const bands = new Map<number, number>();
    let sameBandColor = true;
    for (let index = 0; index < grid.count; index += 1) {
      const band = Math.floor(distances[index]! / grid.cell);
      if (bands.has(band)) sameBandColor &&= wave.tints[index]! === bands.get(band);
      else bands.set(band, wave.tints[index]!);
    }
    expect(sameBandColor).toBe(true);
    expect(bands.size).toBeGreaterThan(5);
    const orderedTints = [...wave.order].map((index) => wave.tints[index]!);
    expect(orderedTints.every((tint, i) => i === 0 || tint >= orderedTints[i - 1]!)).toBe(true);
    expect(orderedTints[0]!).toBe(0);
    expect(orderedTints.at(-1)).toBe(16);
    expect(new Set(orderedTints).size).toBeGreaterThan(10);
  });

  it('keeps the same ordered gradient through activation, falling, and repeated breaks', () => {
    const grid = measureGrid(1920, 1080);
    const wave = new GridBreakWave(grid, 17);
    const colors = [...wave.tints];
    expect(new Set(colors).size).toBe(17);
    expect(new Set(colors.slice(0, grid.cols)).size).toBeGreaterThan(1);
    wave.advance(BREAK_WAVE.duration / 2);
    wave.finish();
    expect([...wave.tints]).toEqual(colors);
    expect([...new GridBreakWave(grid, 17).tints]).toEqual(colors);
  });

  it('allows falling only after every cell is filled and the completed frame has been held', () => {
    const grid = measureGrid(1920, 1080);
    const wave = new GridBreakWave(grid, 48);
    wave.advance(BREAK_WAVE.duration - 0.01);
    expect(wave.active).toBeLessThan(grid.count);
    expect(wave.ready).toBe(false);
    wave.advance(0.01);
    expect(wave.active).toBe(grid.count);
    expect(wave.ready).toBe(false);
    wave.advance(BREAK_WAVE.hold / 2);
    expect(wave.ready).toBe(false);
    wave.advance(BREAK_WAVE.hold / 2);
    expect(wave.ready).toBe(true);
  });

  it('fills every cell immediately for reduced motion', () => {
    const grid = measureGrid(390, 844);
    const wave = new GridBreakWave(grid, 48);
    wave.finish();
    expect(wave.active).toBe(grid.count);
    expect(wave.ready).toBe(true);
  });
});
