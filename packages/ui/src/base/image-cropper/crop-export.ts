import type { CropGeometry, ImageSize } from "./crop-geometry";
import type { CropExportOptions } from "./image-cropper.machine";
export interface CropExportRequest {
  src: string;
  image: ImageSize;
  geometry: CropGeometry;
  crossOrigin?: 'anonymous' | 'use-credentials';
  width: number;
  height: number;
  signal: AbortSignal;
}
export type CropExportAdapter = (request: CropExportRequest) => Promise<Blob>;
export function cropExportSize(options: CropExportOptions, geometry: CropGeometry) {
  const width = options.width ?? Math.max(1, Math.round(geometry.crop.width));
  const height = options.height ?? Math.max(1, Math.round((width * geometry.crop.height) / geometry.crop.width));
  if (![width, height].every((number) => Number.isInteger(number) && number >= 1 && number <= 8192))
    throw new Error('Crop export dimensions must be 1–8192 pixels.');
  return { width, height };
}
/** The source URL remains caller-owned. CORS/tainted canvas and decoding failures reject. */
export const exportCrop: CropExportAdapter = async ({
  src,
  image: size,
  geometry,
  crossOrigin,
  width,
  height,
  signal,
}) => {
  signal.throwIfAborted();
  const image = new Image();
  if (crossOrigin) image.crossOrigin = crossOrigin;
  const canvas = document.createElement('canvas');
  try {
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        image.onload = null;
        image.onerror = null;
        signal.removeEventListener('abort', abort);
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
        reject(new Error('Crop image decoding failed.'));
      };
      signal.addEventListener('abort', abort, { once: true });
      image.src = src;
    });
    signal.throwIfAborted();
    if (image.naturalWidth !== size.width || image.naturalHeight !== size.height)
      throw new Error('Image dimensions changed before export.');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D is unavailable.');
    context.scale(width / geometry.crop.width, height / geometry.crop.height);
    context.translate(-geometry.crop.x, -geometry.crop.y);
    context.translate(geometry.rotated.width / 2, geometry.rotated.height / 2);
    context.rotate((geometry.value.rotation * Math.PI) / 180);
    context.drawImage(image, -size.width / 2, -size.height / 2);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('PNG export failed.'))), 'image/png'),
    );
    signal.throwIfAborted();
    return blob;
  } finally {
    image.src = '';
    canvas.width = 0;
    canvas.height = 0;
  }
};
