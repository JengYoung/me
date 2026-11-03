import { GRID_LIMITS, GridPhysics, measureGrid } from './grid-physics';
import { GridBreakWave } from './grid-break-wave';
import { paintBlockAtlas } from './grid-block-atlas';
import { BLOCK_DRAW_SCALE, BLOCK_TILE_PIXELS } from './grid-block-geometry';

type Light = { born: number; until: number; tint: number; dim: number };
type TextBox = { left: number; top: number; right: number; bottom: number };
export type HeroBackgroundPhase = 'pulse' | 'wave' | 'charged' | 'breaking' | 'settled';

const FADE_IN = 160;
const FADE_OUT = 750;
// 파동 중심의 진한 보라에서 바깥쪽의 밝은 보라까지 기존 primary 토큰 순서입니다.
const PALETTE_TOKENS = ['primary-800', 'primary-700', 'primary-600', 'primary-500', 'primary-400'] as const;
const PALETTE_SIZE = PALETTE_TOKENS.length;

/**
 * Canvas 수명과 이벤트를 한 곳에서 소유합니다. React에는 phase 전이만 알리고,
 * 포인터·셀·물리 상태를 setState하지 않으므로 프레임마다 React를 렌더하지 않습니다.
 * 기본 상태는 CSS 격자 + 최대 180개의 빛, break 상태는 최대 2400개의 파편입니다.
 * 모든 칸을 보존하며 앞쪽 1/3과 뒤쪽 2/3 모두 가까운 정지 블록만 찾아 착지합니다.
 */
export function createHeroBackground(
  host: HTMLDivElement,
  canvas: HTMLCanvasElement,
  preferredCell: number,
  onPhaseChange?: (phase: HeroBackgroundPhase) => void,
) {
  if (typeof ResizeObserver === 'undefined' || typeof IntersectionObserver === 'undefined') return null;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const ctx = context;
  const scope = host.parentElement ?? host;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  // 별도 DOM 레이어를 만들지 않는 break용 텍스처입니다.
  // OffscreenCanvas API에 의존하지 않아 동일한 코드가 Safari에서도 동작합니다.
  const atlas = document.createElement('canvas');
  const textureContext = atlas.getContext('2d');
  if (!textureContext) return null;
  const atlasContext = textureContext;
  const lights = new Map<number, Light>();
  let grid = measureGrid(1, 1, 1, preferredCell);
  let physics: GridPhysics | null = null;
  let wave: GridBreakWave | null = null;
  let paintedWave = 0;
  let palette: string[] = [];
  let highlight = '';
  let shade = '';
  let atlasDirty = true;
  let textBoxes: TextBox[] = [];
  let frame = 0;
  let beat = 0;
  let elapsed = 0;
  let previous = 0;
  let accumulator = 0;
  let broken = false;
  let playing = true;
  let visible = true;
  let disposed = false;
  let dirty = true;
  let layoutDirty = true;
  let colorsDirty = true;
  let textDirty = true;
  let pointerDirty = false;
  let pointerX = 0;
  let pointerY = 0;
  let lastX = -1;
  let lastY = -1;
  let bounds = host.getBoundingClientRect();

  function setPhase(phase: HeroBackgroundPhase) {
    if (host.dataset.phase === phase) return;
    host.dataset.phase = phase;
    onPhaseChange?.(phase);
  }

  const canAnimate = () => playing && visible && !document.hidden && !reduced.matches;
  const hasMotion = () => (broken ? Boolean((wave && !physics) || physics?.awake) : lights.size > 0);
  const alphaAt = (light: Light) => {
    const progress = Math.min(1, Math.max(0, (elapsed - light.born) / FADE_IN));
    const fade = Math.min(1, Math.max(0, (elapsed - light.until) / FADE_OUT));
    return (elapsed < light.until ? 1 - (1 - progress) ** 2 : 1 - fade ** 2) * light.dim;
  };

  /**
   * 브랜드 그래픽의 색은 디자인 시스템의 Primary 원시 팔레트에서 읽습니다.
   * Figma에 등록된 5색을 그대로 캐시하고, 별도의 중간색 팔레트는 만들지 않습니다.
   * 토큰 조회는 초기화/테마 변경 때만 하고, 프레임에서는 색 인덱스만 읽습니다.
   * 배경/글자/테두리는 Semantic 토큰을 따릅니다.
   */
  function readColors() {
    const style = getComputedStyle(host);
    highlight = style.getPropertyValue('--color-white').trim();
    shade = style.getPropertyValue('--color-ink-900').trim();
    palette = PALETTE_TOKENS.map((name) => style.getPropertyValue(`--color-${name}`).trim());
    atlasDirty = true;
    colorsDirty = false;
  }

  /**
   * 글자 보호 영역은 문단 전체 박스 대신 실제 줄의 사각형을 측정합니다.
   * resize/텍스트 변경/폰트 로드 때만 측정하고, 셀을 켤 때만 거리를 계산합니다.
   * pointermove나 draw 루프에서 레이아웃 전체를 반복 측정하지 않습니다.
   */
  function measureText() {
    bounds = host.getBoundingClientRect();
    textBoxes = [];
    scope.querySelectorAll('[data-grid-avoid]').forEach((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (rect.width && rect.height) {
          textBoxes.push({
            left: rect.left - bounds.left - 5,
            top: rect.top - bounds.top - 5,
            right: rect.right - bounds.left + 5,
            bottom: rect.bottom - bounds.top + 5,
          });
        }
      }
    });
    for (const [index, light] of lights) light.dim = brightness(index);
    textDirty = false;
  }

  function brightness(index: number) {
    const x = ((index % grid.cols) + 0.5) * grid.cell;
    const y = (Math.floor(index / grid.cols) + 0.5) * grid.cell;
    let nearest = Infinity;
    for (const box of textBoxes) {
      nearest = Math.min(
        nearest,
        Math.hypot(Math.max(box.left - x, 0, x - box.right), Math.max(box.top - y, 0, y - box.bottom)),
      );
    }
    return (0.13 + 0.87 * Math.min(1, nearest / (grid.cell * 2.2))) * (0.6 + (index % 5) * 0.1);
  }

  /** Canvas 전체 지우기는 크기/테마/모드 변경 때와 물리 렌더링에만 사용합니다. */
  function clear() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, grid.pixelWidth, grid.pixelHeight);
  }

  function measure() {
    const next = measureGrid(host.clientWidth, host.clientHeight, window.devicePixelRatio || 1, preferredCell);
    const changed =
      next.width !== grid.width ||
      next.height !== grid.height ||
      next.pixelWidth !== grid.pixelWidth ||
      next.pixelHeight !== grid.pixelHeight;
    grid = next;
    if (changed) {
      canvas.width = grid.pixelWidth;
      canvas.height = grid.pixelHeight;
      lights.clear();
      lastX = -1;
      lastY = -1;
    }
    // 파동·물리는 첫 입력의 좌표와 진행 상태를 유지하고, Canvas 출력만 새 크기에 맞춥니다.
    // 모바일 주소창 높이 변화나 화면 회전도 break를 다시 시작하지 않습니다.
    const source = wave?.grid ?? grid;
    host.style.setProperty('--grid-cell-x', `${(source.cell * grid.width) / source.width}px`);
    host.style.setProperty('--grid-cell-y', `${(source.cell * grid.height) / source.height}px`);
    host.dataset.cells = String(source.count);
    host.dataset.fragments = String(physics?.count ?? 0);
    layoutDirty = false;
    textDirty = true;
    dirty = true;
  }

  function lightCell(col: number, row: number, hold: number) {
    if (col < 0 || row < 0 || col >= grid.cols || row >= grid.rows) return;
    const index = row * grid.cols + col;
    const existing = lights.get(index);
    if (existing && elapsed < existing.until) return;
    if (!existing && lights.size >= GRID_LIMITS.lit) return;
    const opacity = existing ? alphaAt(existing) / existing.dim : 0;
    lights.set(index, {
      born: elapsed - (1 - Math.sqrt(1 - Math.min(1, opacity))) * FADE_IN,
      until: elapsed + hold,
      tint: Math.round((row / Math.max(1, grid.rows - 1)) * (PALETTE_SIZE - 1)),
      dim: brightness(index),
    });
  }

  function paintAt(x: number, y: number) {
    const col = Math.floor(x / grid.cell);
    const row = Math.floor(y / grid.cell);
    for (let dy = -3; dy <= 3; dy += 1) {
      for (let dx = -3; dx <= 3; dx += 1) {
        const distance = Math.hypot(dx, dy);
        if (distance <= 2.6 && Math.random() < 1 - distance / 3.2)
          lightCell(col + dx, row + dy, 260 + Math.random() * 900);
      }
    }
  }

  function paintPointer() {
    pointerDirty = false;
    const x = pointerX - bounds.left;
    const y = pointerY - bounds.top;
    if (x < 0 || y < 0 || x >= grid.width || y >= grid.height) return;
    // 빠른 포인터 이동은 최대 8곳만 보간합니다. 입력 이벤트가 초당 수백 번
    // 발생해도 최신 좌표 한 쌍만 소비하며, 긴 선 때문에 한 프레임이 폭주하지 않습니다.
    const samples = lastX < 0 ? 1 : Math.min(8, Math.max(1, Math.ceil(Math.hypot(x - lastX, y - lastY) / grid.cell)));
    for (let sample = 1; sample <= samples; sample += 1) {
      const t = sample / samples;
      paintAt(lastX < 0 ? x : lastX + (x - lastX) * t, lastX < 0 ? y : lastY + (y - lastY) * t);
    }
    lastX = x;
    lastY = y;
  }

  function drawPulse() {
    if (dirty) clear();
    const scaleX = grid.pixelWidth / grid.width;
    const scaleY = grid.pixelHeight / grid.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const [index, light] of lights) {
      const x = (index % grid.cols) * grid.cell;
      const y = Math.floor(index / grid.cols) * grid.cell;
      // DPR과 픽셀 예산으로 배율이 소수가 되면 CSS 좌표의 clearRect 경계도 픽셀
      // 중간에 걸립니다. 이 부분만 반복해서 덜 지워져 fade 후 ㄴ자 잔상이 남았습니다.
      // 채우기/지우기 모두 같은 정수 버퍼 픽셀 경계를 써 부분 투명 픽셀이 누적되지
      // 않게 합니다. 오른쪽/아래쪽 끝도 따로 반올림해 인접 셀을 침범하지 않습니다.
      const left = Math.round((x + 1) * scaleX);
      const top = Math.round((y + 1) * scaleY);
      const width = Math.round((x + grid.cell) * scaleX) - left;
      const height = Math.round((y + grid.cell) * scaleY) - top;
      // 켰던 칸만 지우고 다시 칠하며 CSS 격자는 그대로 둡니다. 잔상 제거를 위해
      // 4K 전체 화면을 매 프레임 지우는 비용을 추가하지 않습니다.
      ctx.clearRect(left, top, width, height);
      const alpha = alphaAt(light);
      if (alpha <= 0 && elapsed >= light.until) {
        lights.delete(index);
      } else {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = palette[light.tint]!;
        ctx.fillRect(left, top, width, height);
      }
    }
    ctx.globalAlpha = 1;
  }

  /**
   * 파동 중에는 격자 위치를 고정하고 새로 켜진 셀만 한 번씩 칠합니다.
   * 이미 채운 부분은 Canvas에 남으므로 전체 화면 clear/재도색이 필요 없습니다.
   * 테마/크기가 바뀔 때만 활성 구간을 다시 그리며 CSS 격자는 낙하 전까지 유지합니다.
   */
  function drawWave() {
    if (!wave) return;
    const source = wave.grid;
    if (dirty) {
      clear();
      paintedWave = 0;
    }
    ctx.setTransform(grid.pixelWidth / source.width, 0, 0, grid.pixelHeight / source.height, 0, 0);
    for (let offset = paintedWave; offset < wave.active; offset += 1) {
      const index = wave.order[offset]!;
      ctx.fillStyle = palette[wave.tints[index]!]!;
      ctx.fillRect(
        (index % source.cols) * source.cell + 1,
        Math.floor(index / source.cols) * source.cell + 1,
        source.cell - 1,
        source.cell - 1,
      );
    }
    paintedWave = wave.active;
  }

  /**
   * 모든 셀의 복사본 대신 브랜드 색 × 32개 입체 시점만 캐시합니다.
   * 파동의 색 인덱스를 그대로 사용해 조각의 색이 바뀌지 않습니다. Reset이나
   * resize에도 재사용하며, 색 토큰이 바뀔 때만 다시 굽습니다. 주 Canvas와 합쳐
   * 원시 RGBA 버퍼 약 14MB 이내이며, 4K/8K에서도 아틀라스 크기는 같습니다.
   * 지면은 화면 밖이므로 보이지 않는 바닥 그림자의 버퍼와 합성 비용도 제거합니다.
   */
  function capture() {
    if (!atlasDirty) return;
    paintBlockAtlas(atlas, atlasContext, palette, highlight, shade);
    atlasDirty = false;
  }

  function drawBroken() {
    if (!physics || !wave) return;
    clear();
    const scaleX = grid.pixelWidth / physics.grid.width;
    const scaleY = grid.pixelHeight / physics.grid.height;
    for (const i of physics.drawOrder) {
      const side = physics.side * physics.scale[i]! * BLOCK_DRAW_SCALE;
      const x = physics.screenX[i]!;
      const y = physics.screenY[i]!;
      // 깊이 순서대로 그리며, 바닥에 정지한 조각도 계속 남겨 둡니다.
      // 화면 밖 조각은 GPU에 제출하지 않습니다.
      // save/rotate/restore 대신 캐시한 회전 행렬을 한 번 지정합니다.
      if (
        physics.opacity[i]! > 0 &&
        x + side >= 0 &&
        y + side >= 0 &&
        x - side <= physics.grid.width &&
        y - side <= physics.grid.height
      ) {
        const c = physics.cos[i]!;
        const s = physics.sin[i]!;
        const source = physics.source[i]!;
        const view = physics.view[i]!;
        ctx.globalAlpha = physics.opacity[i]!;
        // z 방향 회전은 행렬로 부드럽게, 입체 면의 변화는 캐시한 시점으로 표현합니다.
        // sleeping 이후 angle도 고정되어 정지한 블록의 면이 뒤늦게 바뀌지 않습니다.
        ctx.setTransform(scaleX * c, scaleY * s, -scaleX * s, scaleY * c, scaleX * x, scaleY * y);
        ctx.drawImage(
          atlas,
          view * BLOCK_TILE_PIXELS,
          wave.tints[source]! * BLOCK_TILE_PIXELS,
          BLOCK_TILE_PIXELS,
          BLOCK_TILE_PIXELS,
          -side / 2,
          -side / 2,
          side,
          side,
        );
      }
    }
    ctx.globalAlpha = 1;
  }

  function settleWithoutMotion() {
    if (!wave) return;
    wave.finish();
    if (!physics) startFall();
    physics!.finish();
  }

  /** 파동이 끝나기 전에는 물리 객체도 생성하지 않아 조기 낙하를 막습니다. */
  function startFall() {
    physics = new GridPhysics(wave!.grid);
    host.dataset.fragments = String(physics.count);
  }

  function scheduleAmbient() {
    window.clearTimeout(beat);
    beat = 0;
    if (!canAnimate() || broken || disposed) return;
    beat = window.setTimeout(
      () => {
        beat = 0;
        if (canAnimate() && !broken) {
          for (let i = 0; i < 2; i += 1)
            lightCell(
              Math.floor(Math.random() * grid.cols),
              Math.floor(Math.random() * grid.rows),
              900 + Math.random() * 1600,
            );
          wake();
          scheduleAmbient();
        }
      },
      1400 + Math.random() * 1800,
    );
  }

  /**
   * RAF 소유자는 하나입니다. 빛이 사라지거나 모든 파편이 쌓여 멈추면 다음 프레임을
   * 예약하지 않습니다. 숨긴 탭/화면 밖/일시정지에서는 RAF와 ambient 타이머 모두
   * 취소하고 previous도 지워, 복귀 시 경과 시간을 한꺼번에 물리에 넣지 않습니다.
   */
  function wake() {
    if (!disposed && !frame && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    accumulator = 0;
    pointerDirty = false;
    lastX = -1;
    lastY = -1;
    if (reduced.matches && broken) {
      settleWithoutMotion();
      dirty = true;
    }
    scheduleAmbient();
    if (dirty || layoutDirty || colorsDirty || textDirty || (canAnimate() && hasMotion())) wake();
  }

  function render(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = previous ? Math.min((now - previous) / 1000, GRID_LIMITS.step * GRID_LIMITS.substeps) : 0;
    previous = now;
    if (layoutDirty) measure();
    if (colorsDirty) {
      readColors();
      dirty = true;
    }
    if (textDirty) measureText();
    if (broken && dirty) {
      if (reduced.matches) settleWithoutMotion();
      if (physics) capture();
    }
    if (canAnimate()) {
      // 높은 화면 주사율에서도 물리와 렌더링을 약 60회/초로 제한합니다.
      accumulator += dt;
      if (pointerDirty && !broken) paintPointer();
      if (accumulator < GRID_LIMITS.step && !dirty) {
        wake();
        return;
      }
      if (broken && wave && !physics) {
        // 낙하와 같은 RAF/가상 시간을 사용합니다. 일시정지/숨김 중에는 파동도 멈추고,
        // 모든 셀이 채워진 뒤 hold 구간까지 지나야 물리 계산으로 전환합니다.
        wave.advance(accumulator);
        accumulator = 0;
        if (wave.ready) {
          startFall();
          capture();
        }
      } else if (broken && physics) {
        let steps = 0;
        while (accumulator >= GRID_LIMITS.step && steps < GRID_LIMITS.substeps) {
          physics.step();
          accumulator -= GRID_LIMITS.step;
          steps += 1;
        }
      } else {
        elapsed += accumulator * 1000;
        accumulator = 0;
      }
    }
    if (broken && !physics) drawWave();
    else if (broken) drawBroken();
    else drawPulse();
    dirty = false;
    let phase: HeroBackgroundPhase = 'pulse';
    if (broken && physics) phase = physics.awake ? 'breaking' : 'settled';
    else if (broken && wave) phase = wave.active === wave.grid.count ? 'charged' : 'wave';
    setPhase(phase);
    host.dataset.waveCells = String(wave?.active ?? 0);
    if (canAnimate() && hasMotion()) wake();
    else previous = 0;
  }

  const onPointer = (event: PointerEvent) => {
    if (!canAnimate() || broken || (event.target instanceof Element && event.target.closest('button, a'))) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerDirty = true;
    wake();
  };
  const onLeave = () => {
    pointerDirty = false;
    lastX = -1;
    lastY = -1;
  };
  const onScroll = () => {
    // 낙하 후에는 글자 보호 마스크를 쓰지 않습니다. 고정 Canvas 뒤로 본문만
    // 스크롤할 때 레이아웃 재측정이나 정지한 파편의 다시 그리기를 예약하지 않습니다.
    if (!broken) textDirty = true;
    // 스크롤 중 멈춘 포인터가 선을 그리지 않도록 보간 시작점도 지웁니다.
    onLeave();
  };
  const onResize = () => {
    layoutDirty = true;
    wake();
  };
  const onTheme = () => {
    colorsDirty = true;
    wake();
  };
  const resize = new ResizeObserver(onResize);
  const sight = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    textDirty = true;
    sync();
  });
  const content = new MutationObserver(() => {
    // 본문의 버튼/입력/비동기 콘텐츠가 바뀌어도 앞에 고정된 잔해는 재도색하지 않습니다.
    if (broken) return;
    textDirty = true;
    dirty = true;
    wake();
  });
  const theme = new MutationObserver(onTheme);
  resize.observe(host);
  sight.observe(host);
  content.observe(scope, { childList: true, subtree: true, characterData: true });
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  scope.addEventListener('pointermove', onPointer, { passive: true });
  scope.addEventListener('pointerdown', onPointer, { passive: true });
  scope.addEventListener('pointerleave', onLeave);
  reduced.addEventListener('change', sync);
  scheme.addEventListener('change', onTheme);
  document.fonts?.ready
    .then(() => {
      if (!disposed) {
        textDirty = true;
        dirty = true;
        wake();
      }
    })
    .catch(() => {});
  measure();
  readColors();
  measureText();
  sync();

  return {
    setPlaying(value: boolean) {
      if (playing === value) return;
      playing = value;
      sync();
    },
    setBroken(value: boolean) {
      if (broken === value) return;
      // 첫 RAF보다 빠른 스크롤에도 최신 크기와 색으로 시작합니다.
      if (layoutDirty) measure();
      if (colorsDirty) readColors();
      if (textDirty || !value) measureText();
      broken = value;
      physics = null;
      wave = value ? new GridBreakWave(grid, PALETTE_SIZE) : null;
      if (!value) measure();
      paintedWave = 0;
      host.dataset.fragments = '0';
      host.dataset.waveCells = '0';
      lights.clear();
      elapsed = 0;
      // 작은 공용 아틀라스는 Reset 이후에도 재사용하고 dispose에서 해제합니다.
      dirty = true;
      setPhase(value ? 'wave' : 'pulse');
      sync();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(beat);
      resize.disconnect();
      sight.disconnect();
      content.disconnect();
      theme.disconnect();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      scope.removeEventListener('pointermove', onPointer);
      scope.removeEventListener('pointerdown', onPointer);
      scope.removeEventListener('pointerleave', onLeave);
      reduced.removeEventListener('change', sync);
      scheme.removeEventListener('change', onTheme);
      lights.clear();
      physics = null;
      wave = null;
      atlas.width = 1;
      atlas.height = 1;
      canvas.width = 1;
      canvas.height = 1;
    },
  };
}
