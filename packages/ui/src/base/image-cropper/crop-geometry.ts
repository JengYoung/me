export interface ImageSize {
  width: number;
  height: number;
}
/** x/y are the crop center as fractions of the rotated image's bounding rectangle. */
export interface CropValue {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export const defaultCropValue: Readonly<CropValue> = Object.freeze({ x: 0.5, y: 0.5, zoom: 1, rotation: 0 });
export function normalizeCropValue(value: CropValue, maxZoom = 10): CropValue {
  if (![value.x, value.y, value.zoom, value.rotation, maxZoom].every(Number.isFinite) || maxZoom < 1)
    throw new Error('Crop values must be finite and maxZoom >= 1.');
  return {
    x: Math.min(1, Math.max(0, value.x)),
    y: Math.min(1, Math.max(0, value.y)),
    zoom: Math.min(maxZoom, Math.max(1, value.zoom)),
    rotation: ((value.rotation % 360) + 360) % 360,
  };
}
export function rotatedImageSize(image: ImageSize, rotation: number): ImageSize {
  const angle = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(image.width * Math.cos(angle)) + Math.abs(image.height * Math.sin(angle)),
    height: Math.abs(image.width * Math.sin(angle)) + Math.abs(image.height * Math.cos(angle)),
  };
}
export function getCropGeometry(image: ImageSize, input: CropValue, aspectRatio = 1, maxZoom = 10) {
  if (![image.width, image.height, aspectRatio].every((number) => Number.isFinite(number) && number > 0))
    throw new Error('Image dimensions and aspectRatio must be positive.');
  const value = normalizeCropValue(input, maxZoom);
  const rotated = rotatedImageSize(image, value.rotation);
  const width = Math.min(rotated.width, rotated.height * aspectRatio) / value.zoom;
  const height = width / aspectRatio;
  const x = Math.max(0, Math.min(rotated.width - width, value.x * rotated.width - width / 2));
  const y = Math.max(0, Math.min(rotated.height - height, value.y * rotated.height - height / 2));
  const crop: CropRect = { x, y, width, height };
  const angle = (-value.rotation * Math.PI) / 180;
  const toOriginal = (px: number, py: number) => {
    const dx = px - rotated.width / 2;
    const dy = py - rotated.height / 2;
    return {
      x: dx * Math.cos(angle) - dy * Math.sin(angle) + image.width / 2,
      y: dx * Math.sin(angle) + dy * Math.cos(angle) + image.height / 2,
    };
  };
  return {
    value: { ...value, x: (x + width / 2) / rotated.width, y: (y + height / 2) / rotated.height },
    rotated,
    crop,
    sourceCorners: [
      toOriginal(x, y),
      toOriginal(x + width, y),
      toOriginal(x + width, y + height),
      toOriginal(x, y + height),
    ],
  };
}
export type CropGeometry = ReturnType<typeof getCropGeometry>;
