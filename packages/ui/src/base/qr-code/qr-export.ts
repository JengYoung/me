import type { QrCodeData } from "./qr-encoder";
export interface QrExportOptions {
  format?: 'svg' | 'png';
  size?: number;
}
export interface QrExportRequest {
  data: QrCodeData;
  format: 'svg' | 'png';
  size: number;
  label: string;
  signal: AbortSignal;
}
export type QrExportAdapter = (request: QrExportRequest) => Promise<Blob>;
const escapeXml = (text: string) =>
  text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);
export function qrSvg(data: QrCodeData, size: number, label = 'QR code') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${data.viewBox}" role="img"><title>${escapeXml(label)}</title><rect width="100%" height="100%" fill="white"/><path d="${data.path}" fill="black" shape-rendering="crispEdges"/></svg>`;
}
export function qrExportOptions(options: QrExportOptions = {}): Required<QrExportOptions> {
  const { format = 'svg', size = 256 } = options;
  if (!['svg', 'png'].includes(format) || !Number.isInteger(size) || size < 1 || size > 8192)
    throw new Error('QR export size must be 1–8192 pixels and format svg or png.');
  return { format, size };
}
export const exportQr: QrExportAdapter = async ({ data, format, size, label, signal }) => {
  signal.throwIfAborted();
  if (format === 'svg') return new Blob([qrSvg(data, size, label)], { type: 'image/svg+xml' });
  if (size < data.dimension)
    throw new Error('PNG size must provide at least one pixel per QR module including margin.');
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  try {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D is unavailable.');
    context.fillStyle = 'white';
    context.fillRect(0, 0, size, size);
    context.fillStyle = 'black';
    const scale = size / data.dimension;
    data.modules.forEach((row, y) =>
      row.forEach((dark, x) => {
        if (!dark) return;
        const left = Math.round((x + data.margin) * scale);
        const top = Math.round((y + data.margin) * scale);
        context.fillRect(
          left,
          top,
          Math.round((x + data.margin + 1) * scale) - left,
          Math.round((y + data.margin + 1) * scale) - top,
        );
      }),
    );
    const result = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed.'))), 'image/png'),
    );
    signal.throwIfAborted();
    return result;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
};
export async function downloadQrBlob(blob: Blob, filename: string, signal: AbortSignal) {
  signal.throwIfAborted();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abort: (() => void) | undefined;
  try {
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    // Give browsers one task to consume the URL before releasing it.
    await new Promise<void>((resolve, reject) => {
      abort = () => reject(signal.reason);
      signal.addEventListener('abort', abort, { once: true });
      timer = setTimeout(resolve, 0);
    });
    signal.throwIfAborted();
  } finally {
    clearTimeout(timer);
    if (abort) signal.removeEventListener('abort', abort);
    link.remove();
    URL.revokeObjectURL(url);
  }
}
