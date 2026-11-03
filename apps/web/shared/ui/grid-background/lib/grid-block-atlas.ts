/**
 * 3D 블록을 32개 시점으로 미리 투영한 작은 스프라이트 아틀라스입니다.
 * 정점 회전·면 숨김·조명 계산은 색이 바뀔 때만 실행하고, 애니메이션에서는
 * 색상 행/회전 열을 선택해 drawImage 한 번으로 세 면을 함께 그립니다.
 * 현재 5색 × 32시점 × 48²px = 368,640px로 화면 크기나 파편 수와 무관합니다.
 */
import { BLOCK_POSES, BLOCK_TILE_PIXELS, BLOCK_UNIT_PIXELS, BLOCK_VIEWS } from './grid-block-geometry';

export function paintBlockAtlas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  palette: readonly string[],
  highlight: string,
  shade: string,
) {
  const tile = BLOCK_TILE_PIXELS;
  canvas.width = tile * BLOCK_VIEWS;
  canvas.height = tile * palette.length;
  ctx.lineJoin = 'round';
  ctx.lineWidth = 0.7;

  for (let view = 0; view < BLOCK_VIEWS; view += 1) {
    const { vertices: points, faces } = BLOCK_POSES[view]!;

    for (let tint = 0; tint < palette.length; tint += 1) {
      // 모든 시점에 동일한 투영 배율을 써서 시점이 바뀔 때 블록이 커졌다 작아지는
      // 현상을 막습니다. 타일 가장자리의 투명 여유는 인접 텍스처의 색 번짐도 막습니다.
      const unit = BLOCK_UNIT_PIXELS;
      const centerX = (view + 0.5) * tile;
      const centerY = (tint + 0.5) * tile;
      for (const face of faces) {
        ctx.beginPath();
        face.corners.forEach((index, corner) => {
          const point = points[index]!;
          const x = centerX + point[0] * unit;
          const y = centerY + point[1] * unit;
          if (corner === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = palette[tint]!;
        ctx.fill();

        // 좌상단의 공통 광원과 면 법선의 내적으로 밝기를 결정합니다.
        // 원색은 기존 primary 토큰이며, 조명도 white/ink 토큰만 합성합니다.
        const light = -face.normal[0] * 0.42 - face.normal[1] * 0.72 + face.normal[2] * 0.55;
        const lighting = light - 0.48;
        ctx.fillStyle = lighting >= 0 ? highlight : shade;
        ctx.globalAlpha = Math.min(0.38, Math.abs(lighting) * 0.65);
        ctx.fill();
        // 닫힌 면 전체에 얇은 모서리 하이라이트를 굽습니다. 매 프레임 stroke,
        // shadowBlur, filter를 쓰지 않아 블록 수가 많아져도 별도 면 그리기가 없습니다.
        ctx.strokeStyle = highlight;
        ctx.globalAlpha = 0.16;
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}
