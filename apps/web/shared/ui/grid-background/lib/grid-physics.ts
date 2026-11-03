import { BLOCK_POSES, blockView } from './grid-block-geometry';

/** 모든 셀을 보존하면서 Canvas 면적과 파편 수를 제한합니다. */
export const GRID_LIMITS = {
  cells: 2400,
  foregroundStride: 3,
  pixels: 2_000_000,
  lit: 180,
  step: 1 / 60,
  substeps: 2,
} as const;

export type GridGeometry = ReturnType<typeof measureGrid>;

/**
 * 4K/8K에서는 격자 간격을 넓혀 가장자리 행/열까지 셀 수 예산에 포함합니다.
 * CSS 격자는 원래 해상도, 움직이는 장식 Canvas만 DPR/픽셀 예산으로 줄입니다.
 */
export function measureGrid(width: number, height: number, dpr = 1, preferredCell = 24) {
  width = Math.max(1, width);
  height = Math.max(1, height);
  let cell = Math.max(16, preferredCell, Math.ceil(Math.sqrt((width * height) / GRID_LIMITS.cells)));
  while (Math.ceil(width / cell) * Math.ceil(height / cell) > GRID_LIMITS.cells) cell += 1;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const ratio = Math.min(dpr, 2, Math.sqrt(GRID_LIMITS.pixels / (width * height)));
  return {
    width,
    height,
    cell,
    cols,
    rows,
    count: cols * rows,
    pixelWidth: Math.max(1, Math.floor(width * ratio)),
    pixelHeight: Math.max(1, Math.floor(height * ratio)),
  };
}

/**
 * 외부 물리 엔진 없이 비행과 무반발 쌓임을 계산합니다. 앞쪽 1/3부터 뒤쪽 2/3까지
 * 하나의 카메라/연속 깊이를 씁니다. 착지는 바닥 또는 이미 정지한 실제 블록에만
 * 허용하며, 공중 높이 맵이나 보이지 않는 큰 사각형에 기대어 정지하지 않습니다.
 * 움직이는 블록끼리의 전체 충돌 대신 x/z 버킷의 정지한 이웃만 검사합니다.
 */
// 모든 버퍼는 count 길이로 할당하며, 읽기 단언은 이 범위를 유지하는 내부 루프에 한정한다.
export class GridPhysics {
  readonly count: number;
  readonly foregroundCount: number;
  readonly source: Uint16Array;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly z: Float32Array;
  readonly vx: Float32Array;
  readonly vy: Float32Array;
  readonly angle: Float32Array;
  readonly spin: Float32Array;
  readonly cos: Float32Array;
  readonly sin: Float32Array;
  readonly scale: Float32Array;
  readonly opacity: Float32Array;
  readonly screenX: Float32Array;
  readonly screenY: Float32Array;
  readonly drawOrder: Uint16Array;
  readonly sleeping: Uint8Array;
  readonly view: Uint8Array;
  /** 텍스처 여백을 제외한 실제 그림의 반폭/반높이와 내부 접촉 반지름입니다. */
  readonly extentX: Float32Array;
  readonly extentY: Float32Array;
  readonly contactRadius: Float32Array;
  /** -1은 바닥, 나머지는 이 블록을 실제로 받치는 정지한 블록 번호입니다. */
  readonly support: Int32Array;
  /** 양쪽에서 받치거나 무게중심 바로 아래에 지지 면이 있는지 기록합니다. */
  readonly balanced: Uint8Array;
  readonly focalLength: number;
  readonly vanishingY: number;
  private readonly targetZ: Float32Array;
  private readonly depthDuration: Float32Array;
  private readonly restX: Float32Array;
  private readonly worldX: Float32Array;
  private readonly worldY: Float32Array;
  private readonly fallOrder: Uint16Array;
  private readonly stableTime: Float32Array;
  private readonly heads: Int32Array;
  private readonly next: Int32Array;
  private readonly bucketSize: number;
  private readonly bucketCols: number;
  private readonly bucketRows: number;
  private lastDepthChange = 0;
  age = 0;
  awake: number;

  constructor(
    readonly grid: GridGeometry,
    random: () => number = Math.random,
  ) {
    this.count = grid.count;
    this.foregroundCount = Math.ceil(grid.count / GRID_LIMITS.foregroundStride);
    this.awake = this.count;
    this.focalLength = Math.max(grid.width, grid.height) * 0.75;
    // 소실점을 화면 하단보다 조금 아래에 둡니다. floorAt의 지면도 화면 밖에
    // 놓이므로 블록 밑의 흰 바닥이 드러나지 않고 본문이 더미 뒤에서 올라올 수 있습니다.
    // 간격은 셀 크기에 비례하며 Canvas 면적/파편 수/접촉 계산은 늘리지 않습니다.
    this.vanishingY = grid.height + this.side * 0.2;
    this.source = new Uint16Array(this.count);
    this.x = new Float32Array(this.count);
    this.y = new Float32Array(this.count);
    this.z = new Float32Array(this.count);
    this.vx = new Float32Array(this.count);
    this.vy = new Float32Array(this.count);
    this.angle = new Float32Array(this.count);
    this.spin = new Float32Array(this.count);
    this.cos = new Float32Array(this.count).fill(1);
    this.sin = new Float32Array(this.count);
    this.scale = new Float32Array(this.count).fill(1);
    this.opacity = new Float32Array(this.count).fill(1);
    this.screenX = this.x;
    this.screenY = this.y;
    this.drawOrder = new Uint16Array(this.count);
    this.sleeping = new Uint8Array(this.count);
    this.view = new Uint8Array(this.count);
    this.extentX = new Float32Array(this.count);
    this.extentY = new Float32Array(this.count);
    this.contactRadius = new Float32Array(this.count);
    this.support = new Int32Array(this.count).fill(-1);
    this.balanced = new Uint8Array(this.count);
    this.targetZ = new Float32Array(this.count);
    this.depthDuration = new Float32Array(this.count);
    this.restX = new Float32Array(this.count);
    this.worldX = new Float32Array(this.count);
    this.worldY = new Float32Array(this.count);
    this.fallOrder = new Uint16Array(this.count);
    this.stableTime = new Float32Array(this.count);
    this.next = new Int32Array(this.count);
    this.bucketSize = this.side * 1.5;
    this.bucketCols = Math.ceil(grid.width / this.bucketSize) + 2;
    this.bucketRows = Math.ceil((this.focalLength * 0.74) / this.bucketSize) + 2;
    this.heads = new Int32Array(this.bucketCols * this.bucketRows).fill(-1);

    // 세 칸마다 하나를 앞쪽에 배정하되 모든 원본 셀을 정확히 한 번 보존합니다.
    let background = this.foregroundCount;
    for (let i = 0; i < this.foregroundCount; i += 1) {
      const start = i * GRID_LIMITS.foregroundStride;
      const available = Math.min(GRID_LIMITS.foregroundStride, grid.count - start);
      const source = start + Math.floor(random() * available);
      this.source[i] = source;
      for (let offset = 0; offset < available; offset += 1) {
        if (start + offset !== source) this.source[background++] = start + offset;
      }
    }
    // 별개 두 평면 대신 연속 분포의 가까운 1/3을 앞쪽으로 분류합니다.
    for (let i = 0; i < this.count; i += 1) this.targetZ[i] = this.focalLength * (0.02 + random() ** 1.2 * 0.72);
    // oxlint-disable-next-line unicorn/no-array-sort -- 생성한 배열·TypedArray 버퍼를 제자리 정렬해 할당을 제한한다.
    this.targetZ.sort();
    for (let i = this.count - 1; i > 0; i -= 1) {
      const start = i < this.foregroundCount ? 0 : this.foregroundCount;
      const j = start + Math.floor(random() * (i - start + 1));
      const depth = this.targetZ[i]!;
      this.targetZ[i] = this.targetZ[j]!;
      this.targetZ[j] = depth;
    }
    for (let i = 0; i < this.count; i += 1) {
      const source = this.source[i]!;
      this.x[i] = ((source % grid.cols) + 0.5) * grid.cell;
      this.y[i] = (Math.floor(source / grid.cols) + 0.5) * grid.cell;
      this.worldX[i] = this.x[i]!;
      this.worldY[i] = this.y[i]!;
      const radialX = (this.x[i]! - grid.width / 2) / Math.max(grid.width / 2, grid.cell);
      const spread =
        this.x[i]! +
        radialX * (1 - Math.min(1, Math.abs(radialX))) * grid.width * 0.3 +
        (random() - 0.5) * grid.cell * 4;
      // 양쪽 벽도 한 블록만큼 화면 밖에 둡니다. 화면 안쪽으로 되밀던 여백을
      // 없애 가장자리 블록도 프레임 경계에서 잘리며 더미가 좌우 끝까지 이어집니다.
      this.restX[i] = Math.min(grid.width + this.side, Math.max(-this.side, spread));
      this.vy[i] = grid.cell * (8 + random() * 4);
      this.depthDuration[i] = 0.12 + (this.targetZ[i]! / this.focalLength) * 0.09 + random() * 0.1;
      this.lastDepthChange = Math.max(this.lastDepthChange, this.depthDuration[i]!);
      this.spin[i] = (random() - 0.5) * 8;
      this.drawOrder[i] = i;
      this.fallOrder[i] = i;
      this.measureShape(i);
    }
    // oxlint-disable-next-line unicorn/no-array-sort -- 생성한 배열·TypedArray 버퍼를 제자리 정렬해 할당을 제한한다.
    this.drawOrder.sort((a, b) => this.targetZ[b]! - this.targetZ[a]!);
    // 아래쪽 원본 셀부터 처리하면 같은 프레임 안에서도 바닥 지지체가 먼저 생깁니다.
    // oxlint-disable-next-line unicorn/no-array-sort -- 생성한 배열·TypedArray 버퍼를 제자리 정렬해 할당을 제한한다.
    this.fallOrder.sort((a, b) => this.source[b]! - this.source[a]!);
  }

  get side() {
    return (this.grid.cell - 1) * 1.12;
  }

  /**
   * 지면을 소실점보다 0.3블록 아래에 놓고 같은 원근 배율로 투영합니다.
   * 먼 쪽 지면까지 뷰포트 밖에 있어 최하단 블록은 화면 경계에서 자연스럽게 잘립니다.
   * 실제 접촉 위치를 이동하므로 화면에서만 임의로 밀어 블록끼리의 접촉을 어긋내지 않습니다.
   */
  floorAt(scale: number) {
    return this.vanishingY + this.side * 0.3 * scale;
  }

  private measureShape(i: number) {
    this.view[i] = blockView(this.source[i]!, this.angle[i]!);
    const pose = BLOCK_POSES[this.view[i]!]!;
    const size = this.side * this.scale[i]!;
    let extentX = 0;
    let extentY = 0;
    for (const [x, y] of pose.hull) {
      extentX = Math.max(extentX, Math.abs(x * this.cos[i]! - y * this.sin[i]!) * size);
      extentY = Math.max(extentY, Math.abs(x * this.sin[i]! + y * this.cos[i]!) * size);
    }
    this.extentX[i] = extentX;
    this.extentY[i] = extentY;
    this.contactRadius[i] = pose.radius * size;
  }

  step() {
    if (!this.awake) return;
    const depthChanging = this.age < this.lastDepthChange;
    this.advance(GRID_LIMITS.step / 2);
    this.advance(GRID_LIMITS.step / 2);
    // oxlint-disable-next-line unicorn/no-array-sort -- 생성한 배열·TypedArray 버퍼를 제자리 정렬해 할당을 제한한다.
    if (depthChanging) this.drawOrder.sort((a, b) => this.z[b]! - this.z[a]!);
  }

  private advance(dt: number) {
    if (!this.awake) return;
    this.age += dt;
    for (const i of this.fallOrder) {
      if (!this.sleeping[i]!) this.advanceBody(i, dt);
    }
  }

  private advanceBody(i: number, dt: number) {
    const progress = Math.min(1, this.age / this.depthDuration[i]!);
    const depth = 1 - (1 - progress) ** 3;
    this.z[i] = this.targetZ[i]! * depth;
    this.scale[i] = this.focalLength / (this.focalLength + this.z[i]!);
    this.opacity[i] = 0.88 + this.scale[i]! * 0.12;
    const sourceX = ((this.source[i]! % this.grid.cols) + 0.5) * this.grid.cell;
    if (progress < 1) this.worldX[i] = sourceX + (this.restX[i]! - sourceX) * depth;
    else this.worldX[i]! += this.vx[i]! * dt;
    const margin = -this.side;
    if (this.worldX[i]! < margin || this.worldX[i]! > this.grid.width - margin) {
      this.worldX[i] = Math.max(margin, Math.min(this.grid.width - margin, this.worldX[i]!));
      this.vx[i] = 0;
    }
    this.x[i] = this.grid.width / 2 + (this.worldX[i]! - this.grid.width / 2) * this.scale[i]!;
    this.angle[i]! += this.spin[i]! * dt;
    this.spin[i]! *= 0.992;
    this.cos[i] = Math.cos(this.angle[i]!);
    this.sin[i] = Math.sin(this.angle[i]!);
    this.measureShape(i);

    // 속도는 월드 좌표에서 적분하고 나중에 투영합니다. 원근 이동량이 반발 속도로
    // 바뀌지 않으며, 강한 중력/상한 속도로 낙하산처럼 늘어지는 낙하도 피합니다.
    const previousY = this.vanishingY + (this.worldY[i]! - this.vanishingY) * this.scale[i]!;
    this.vy[i] = Math.min(this.vy[i]! + this.grid.cell * 240 * dt, this.grid.cell * 90);
    this.worldY[i]! += this.vy[i]! * dt;
    this.y[i] = this.vanishingY + (this.worldY[i]! - this.vanishingY) * this.scale[i]!;
    const landing = this.landingY(i, previousY);
    if (this.y[i]! >= landing) {
      this.y[i] = landing;
      this.worldY[i] = this.vanishingY + (landing - this.vanishingY) / this.scale[i]!;
      this.vy[i] = 0;
      if (progress < 1) return;
      const support = this.support[i]!;
      const wallSupport =
        support >= 0 &&
        ((this.worldX[i]! <= margin + 0.01 && this.x[i]! < this.x[support]!) ||
          (this.worldX[i]! >= this.grid.width - margin - 0.01 && this.x[i]! > this.x[support]!));
      if (wallSupport) this.balanced[i] = 1;
      if (support >= 0 && !this.balanced[i]!) {
        // 접촉과 안정은 다릅니다. 무게중심이 지지 영역 밖이면 중력의 접선 성분으로
        // 옆으로 미끄러지며 회전합니다. 모서리에 닿았다고 허공의 탑을 고정하지 않습니다.
        const dx = this.x[i]! - this.x[support]!;
        const direction = dx < 0 ? -1 : 1;
        const slope = Math.min(1, Math.abs(dx) / (this.contactRadius[i]! + this.contactRadius[support]!));
        this.vx[i] = this.vx[i]! * 0.92 + direction * this.grid.cell * (25 + slope * 60) * dt;
        this.vx[i] = Math.max(-this.grid.cell * 3, Math.min(this.grid.cell * 3, this.vx[i]!));
        // 회전은 실제 미끄러지는 속도에만 연결합니다. 접촉 프레임마다 독립적인
        // 토크를 계속 더하면 양쪽에 끼인 블록에도 에너지가 누적되어 영원히 돕니다.
        this.spin[i] = this.vx[i]! / this.side;
        this.stableTime[i] = 0;
      } else {
        // 바닥 또는 무게중심을 받치는 면에서만 마찰과 회전 감쇠를 적용합니다.
        // 별도의 목표 각도로 계속 돌리지 않고 접촉으로 실제 속도를 소산시킵니다.
        // 속도/각속도가 작고 50ms 이상 지지가 유지되어야 sleep합니다. 반발은 0입니다.
        this.vx[i]! *= Math.exp(-90 * dt);
        this.spin[i]! *= Math.exp(-35 * dt);
        const stable = Math.abs(this.spin[i]!) < 0.15 && Math.abs(this.vx[i]!) < this.grid.cell * 0.04;
        this.stableTime[i] = stable ? this.stableTime[i]! + dt : 0;
        if (this.stableTime[i]! >= 0.05) this.sleep(i);
      }
    } else {
      this.stableTime[i] = 0;
    }
  }

  private bucket(i: number) {
    const col = Math.max(0, Math.min(this.bucketCols - 1, Math.floor(this.worldX[i]! / this.bucketSize)));
    const row = Math.max(0, Math.min(this.bucketRows - 1, Math.floor(this.z[i]! / this.bucketSize)));
    return row * this.bucketCols + col;
  }

  /**
   * 바닥에는 그림의 최하단을 맞춥니다. 더미에는 실제 실루엣 안의 원끼리 닿게
   * 내려놓아 투명한 여백이 공중 지지대가 되지 않게 합니다. 옆면에 살짝 스친 접촉은
   * 지지로 인정하지 않으며, 깊이가 다른 블록이 화면에서 겹친 것만으로 멈추지 않습니다.
   * 최대 9개 x/z 버킷만 조회하고, 정지한 블록은 한 번만 삽입해 메모리를 재사용합니다.
   */
  private landingY(i: number, previousY: number) {
    let landing = this.floorAt(this.scale[i]!) - this.extentY[i]!;
    this.support[i] = -1;
    this.balanced[i] = 1;
    let left = Infinity;
    let right = Infinity;
    const bucket = this.bucket(i);
    const row = Math.floor(bucket / this.bucketCols);
    const col = bucket % this.bucketCols;
    for (let by = Math.max(0, row - 1); by <= Math.min(this.bucketRows - 1, row + 1); by += 1) {
      for (let bx = Math.max(0, col - 1); bx <= Math.min(this.bucketCols - 1, col + 1); bx += 1) {
        for (let j = this.heads[by * this.bucketCols + bx]!; j !== -1; j = this.next[j]!) {
          if (Math.abs(this.z[i]! - this.z[j]!) <= this.side * 0.9 && previousY <= this.y[j]!) {
            const dx = this.x[i]! - this.x[j]!;
            const radius = (this.contactRadius[i]! + this.contactRadius[j]!) * 0.96;
            if (Math.abs(dx) <= radius * 0.98) {
              const contact = this.y[j]! - Math.sqrt(radius * radius - dx * dx);
              // 경사가 큰 양쪽 접촉도 지지 후보로 유지합니다. 한쪽 접촉만 남기면
              // V자 틈에 끼인 블록이 왼쪽/오른쪽 힘을 번갈아 받아 미세 회전합니다.
              // 내려간 블록을 다시 위로 올리는 착지 보정과, 양쪽 지지 판정은 분리합니다.
              if (previousY <= contact + this.side * this.scale[i]! * 0.16) {
                if (dx >= 0) left = Math.min(left, contact);
                if (dx <= 0) right = Math.min(right, contact);
              }
              // 이미 지나친 윗면으로 다시 끌어올리지 않습니다. 옆에서 스친 접촉을
              // 위쪽 위치 보정으로 풀면 중력을 거슬러 에너지가 생기고 떨림이 남습니다.
              if (previousY <= contact + this.grid.cell * 0.02) {
                if (contact < landing) {
                  landing = contact;
                  this.support[i] = j;
                }
              }
            }
          }
        }
      }
    }
    const support = this.support[i]!;
    if (support >= 0) {
      const centered =
        Math.abs(this.x[i]! - this.x[support]!) < Math.min(this.contactRadius[i]!, this.contactRadius[support]!) * 0.38;
      const bridged = Math.abs(left - right) < this.side * this.scale[i]! * 0.2;
      this.balanced[i] = Number(centered || bridged);
    }
    return landing;
  }

  private sleep(i: number) {
    this.sleeping[i] = 1;
    this.vx[i] = 0;
    this.vy[i] = 0;
    this.spin[i] = 0;
    this.awake -= 1;
    const bucket = this.bucket(i);
    this.next[i] = this.heads[bucket]!;
    this.heads[bucket] = i;
  }

  /** reduced-motion도 동일한 실제 접촉 규칙으로 즉시 쌓고 RAF를 종료합니다. */
  finish() {
    this.heads.fill(-1);
    this.sleeping.fill(0);
    this.awake = this.count;
    for (const i of this.fallOrder) {
      this.z[i] = this.targetZ[i]!;
      this.scale[i] = this.focalLength / (this.focalLength + this.z[i]!);
      this.opacity[i] = 0.88 + this.scale[i]! * 0.12;
      this.worldX[i] = this.restX[i]!;
      this.x[i] = this.grid.width / 2 + (this.worldX[i]! - this.grid.width / 2) * this.scale[i]!;
      this.angle[i] = ((this.source[i]! % 5) - 2) * 0.04;
      this.cos[i] = Math.cos(this.angle[i]!);
      this.sin[i] = Math.sin(this.angle[i]!);
      this.measureShape(i);
      // 움직임을 생략해도 불안정한 탑을 만들지 않습니다. 작은 주변 후보 중 무게중심이
      // 지지되고 가장 낮게 놓일 수 있는 자리를 선택합니다. 실제 접촉 조회를 재사용하며
      // 시뮬레이션 수십 프레임을 한 번에 실행하지 않는 제한된 O(N) 배치입니다.
      const origin = this.worldX[i]!;
      let bestX = origin;
      let bestY = -Infinity;
      for (let candidate = 0; candidate < 9; candidate += 1) {
        const offset = candidate === 0 ? 0 : Math.ceil(candidate / 2) * (candidate % 2 ? -1 : 1) * this.side * 0.6;
        this.worldX[i] = Math.max(-this.side, Math.min(this.grid.width + this.side, origin + offset));
        this.x[i] = this.grid.width / 2 + (this.worldX[i]! - this.grid.width / 2) * this.scale[i]!;
        const landing = this.landingY(i, -Infinity);
        if (this.balanced[i]! && landing > bestY) {
          bestY = landing;
          bestX = this.worldX[i]!;
        }
      }
      this.worldX[i] = bestX;
      this.x[i] = this.grid.width / 2 + (bestX - this.grid.width / 2) * this.scale[i]!;
      this.y[i] = this.landingY(i, -Infinity);
      if (!this.balanced[i]! && this.support[i]! >= 0) {
        const support = this.support[i]!;
        this.x[i] = this.x[support]!;
        this.worldX[i] = this.grid.width / 2 + (this.x[i]! - this.grid.width / 2) / this.scale[i]!;
        this.y[i] = this.y[support]! - (this.contactRadius[i]! + this.contactRadius[support]!) * 0.96;
        this.balanced[i] = 1;
      }
      this.worldY[i] = this.vanishingY + (this.y[i]! - this.vanishingY) / this.scale[i]!;
      this.sleep(i);
    }
    // oxlint-disable-next-line unicorn/no-array-sort -- 생성한 배열·TypedArray 버퍼를 제자리 정렬해 할당을 제한한다.
    this.drawOrder.sort((a, b) => this.z[b]! - this.z[a]!);
  }
}
