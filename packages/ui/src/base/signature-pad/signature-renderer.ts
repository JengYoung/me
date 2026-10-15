import type { SignatureExportOptions, SignatureValue } from "./signature-pad.machine";
export type SignatureRenderer = (
  value: SignatureValue,
  options: Required<SignatureExportOptions> & { signal: AbortSignal },
) => Promise<Blob>;
export function signaturePath(value: SignatureValue, width = 1, height = 1) {
  return value
    .map(
      (stroke) =>
        stroke.map((point, index) => `${index ? 'L' : 'M'}${point.x * width} ${point.y * height}`).join(' ') +
        (stroke.length === 1 ? 'l0.001 0' : ''),
    )
    .join(' ');
}
export function signatureExportOptions(options: SignatureExportOptions = {}): Required<SignatureExportOptions> {
  const { format = 'svg', width = 600, height = 200 } = options;
  if (
    !['svg', 'png', 'json'].includes(format) ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 8192 ||
    height > 8192
  )
    throw new Error('Invalid signature export format or size (1–8192 pixels).');
  return { format, width, height };
}
/** SVG/JSON need no canvas. PNG owns its temporary image, canvas and object URL until settlement. */
export const renderSignature: SignatureRenderer = async (value, { format, width, height, signal }) => {
  signal.throwIfAborted();
  if (format === 'json') return new Blob([JSON.stringify(value)], { type: 'application/json' });
  const svg = new Blob(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${signaturePath(value, width, height)}" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    ],
    { type: 'image/svg+xml' },
  );
  if (format === 'svg') return svg;
  const url = URL.createObjectURL(svg);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        signal.removeEventListener('abort', abort);
        image.onload = null;
        image.onerror = null;
      };
      const abort = () => {
        cleanup();
        image.src = '';
        reject(signal.reason);
      };
      image.onload = () => {
        cleanup();
        resolve();
      };
      image.onerror = () => {
        cleanup();
        reject(new Error('Signature rasterization failed.'));
      };
      signal.addEventListener('abort', abort, { once: true });
      image.src = url;
    });
    signal.throwIfAborted();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    try {
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas 2D is unavailable.');
      context.drawImage(image, 0, 0);
      const result = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed.'))), 'image/png'),
      );
      signal.throwIfAborted();
      return result;
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    URL.revokeObjectURL(url);
  }
};
