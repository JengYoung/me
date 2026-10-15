'use client';
/* oxlint-disable nextjs/no-img-element -- Native source dimensions and image lifecycle are the public adapter contract. */
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useImageCropper } from './use-image-cropper';
import type { ImageCropperApi, ImageCropperOptions } from './use-image-cropper';
import type { CropControl } from './image-cropper.connect';
const Context = createContext<ImageCropperApi | null>(null);
function useImageCropperContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Image Cropper parts must be inside ImageCropper.Root.');
  return api;
}
export type ImageCropperRootProps = ImageCropperOptions & { children?: ReactNode };
export function ImageCropperRoot({ children, ...options }: ImageCropperRootProps) {
  return <Context value={useImageCropper(options)}>{children}</Context>;
}
export function ImageCropperViewport(props: PartProps<'div'>) {
  return <div {...useImageCropperContext().getViewportProps(props)} />;
}
export function ImageCropperImage(props: PartProps<'img'>) {
  const api = useImageCropperContext();
  return <img alt="" key={api.imageKey} {...api.getImageProps(props)} />;
}
export function ImageCropperSelection(props: PartProps<'div'>) {
  return <div {...useImageCropperContext().getSelectionProps(props)} />;
}
export function ImageCropperControl({ control, ...props }: PartProps<'input'> & { control: CropControl }) {
  return <input {...useImageCropperContext().getControlProps(control, props)} />;
}
export function ImageCropperValue({ children }: { children: (api: ImageCropperApi) => ReactNode }) {
  return children(useImageCropperContext());
}
export const ImageCropper = {
  Root: ImageCropperRoot,
  Viewport: ImageCropperViewport,
  Image: ImageCropperImage,
  Selection: ImageCropperSelection,
  Control: ImageCropperControl,
  Value: ImageCropperValue,
};
