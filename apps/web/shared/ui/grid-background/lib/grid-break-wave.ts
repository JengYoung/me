import type { GridGeometry } from './grid-physics';

export const BREAK_WAVE = { duration: 0.24, hold: 0.04 } as const;

/**
 * Break의 첫 단계입니다. 화면 중앙에서 가까운 셀부터 한 번씩 켜며,
 * 마지막 셀까지 채운 화면을 잠시 보여 준 뒤에만 낙하를 허용합니다.
 * 거리 정렬과 동심원 띠별 그라데이션 배정은 생성 시 한 번뿐입니다. 프레임마다
 * 전체 격자를 검색하거나 색을 다시 계산하지 않아 큰 화면에서도 비용이 일정합니다.
 */
export class GridBreakWave {
  readonly order: Uint16Array;
  readonly tints: Uint8Array;
  private readonly distances: Float32Array;
  private readonly radius: number;
  age = 0;
  active = 0;

  constructor(
    readonly grid: GridGeometry,
    paletteSize: number,
  ) {
    this.order = new Uint16Array(grid.count);
    this.tints = new Uint8Array(grid.count);
    this.distances = new Float32Array(grid.count);
    let radius = 0;
    for (let i = 0; i < grid.count; i += 1) {
      const left = (i % grid.cols) * grid.cell;
      const top = Math.floor(i / grid.cols) * grid.cell;
      // 가장자리의 잘린 셀도 실제 보이는 부분의 중심으로 계산합니다.
      // 가로/세로를 각각 정규화하지 않아 넓은 화면에서도 원형 파동을 유지합니다.
      const x = (left + Math.min(left + grid.cell, grid.width)) / 2 - grid.width / 2;
      const y = (top + Math.min(top + grid.cell, grid.height)) / 2 - grid.height / 2;
      this.distances[i] = Math.hypot(x, y);
      radius = Math.max(radius, this.distances[i]!);
      this.order[i] = i;
    }
    this.radius = radius;
    // 같은 반경 level의 셀은 방향과 행/열에 관계없이 같은 색을 공유합니다.
    // 중심→가장자리 거리를 팔레트 전체에 한 번 대응시켜 진한 primary부터 밝은
    // primary까지 순서대로 이어집니다. 난수나 색상 순환 없이 단조로운 그라데이션을
    // 유지하므로 중간에 명도가 갑자기 되돌아가거나 다른 계열 색이 섞이지 않습니다.
    // 띠 폭을 한 셀로 좁혀 보간한 중간색도 충분히 드러냅니다. 셀별 색과 띠는
    // 생성 시 고정되므로 색 단계가 늘어나도 매 프레임 그리는 셀 수는 같습니다.
    const bandWidth = grid.cell;
    const lastBand = Math.max(1, Math.floor(radius / bandWidth));
    for (let i = 0; i < grid.count; i += 1) {
      const band = Math.floor(this.distances[i]! / bandWidth);
      this.tints[i] = Math.floor((band / lastBand) * Math.max(0, paletteSize - 1));
    }
    // oxlint-disable-next-line unicorn/no-array-sort -- 생성한 배열·TypedArray 버퍼를 제자리 정렬해 할당을 제한한다.
    this.order.sort((a, b) => this.distances[a]! - this.distances[b]!);
  }

  get ready() {
    return this.active === this.order.length && this.age >= BREAK_WAVE.duration + BREAK_WAVE.hold;
  }

  /** 이미 켜진 셀은 건너뛰고 이번 파면이 새로 통과한 구간만 활성화합니다. */
  advance(seconds: number) {
    this.age = Math.min(BREAK_WAVE.duration + BREAK_WAVE.hold, this.age + Math.max(0, seconds));
    const radius = Math.min(1, this.age / BREAK_WAVE.duration) * this.radius;
    while (this.active < this.order.length && this.distances[this.order[this.active]!]! <= radius) {
      this.active += 1;
    }
  }

  /** reduced-motion에서는 파동/대기 시간을 생략하되 각 동심원의 색은 그대로 보존합니다. */
  finish() {
    this.age = BREAK_WAVE.duration + BREAK_WAVE.hold;
    this.active = this.order.length;
  }
}
