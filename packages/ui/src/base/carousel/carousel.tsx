'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useCarousel } from "./use-carousel";
import type { CarouselApi, CarouselOptions } from "./use-carousel";
const Context = createContext<CarouselApi | null>(null);
function useCarouselContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Carousel parts must be rendered inside Carousel.Root.');
  return api;
}
export type CarouselRootProps = Omit<PartProps<'div'>, 'defaultValue' | 'children'> &
  CarouselOptions & { children?: ReactNode | ((api: CarouselApi) => ReactNode) };
export function CarouselRoot({
  slides,
  value,
  defaultValue,
  onValueChange,
  defaultRotating,
  onRotationChange,
  interval,
  loop,
  disabled,
  id,
  children,
  ...props
}: CarouselRootProps) {
  const api = useCarousel({
    slides,
    value,
    defaultValue,
    onValueChange,
    defaultRotating,
    onRotationChange,
    interval,
    loop,
    disabled,
    id,
  });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)}>{typeof children === 'function' ? children(api) : children}</div>
    </Context>
  );
}
export function CarouselViewport(props: PartProps<'div'>) {
  return <div {...useCarouselContext().getViewportProps(props)} />;
}
export type CarouselSlideProps = PartProps<'div'> & { value: string };
export function CarouselSlide({ value, ...props }: CarouselSlideProps) {
  return <div {...useCarouselContext().getSlideProps(value, props)} />;
}
export function CarouselPrevious(props: PartProps<'button'>) {
  return <button {...useCarouselContext().getPreviousProps(props)} />;
}
export function CarouselNext(props: PartProps<'button'>) {
  return <button {...useCarouselContext().getNextProps(props)} />;
}
export function CarouselRotation(props: PartProps<'button'>) {
  return <button {...useCarouselContext().getRotationProps(props)} />;
}
export function CarouselPickerGroup(props: PartProps<'div'>) {
  return <div {...useCarouselContext().getPickerGroupProps(props)} />;
}
export type CarouselPickerProps = PartProps<'button'> & { value: string };
export function CarouselPicker({ value, ...props }: CarouselPickerProps) {
  return <button {...useCarouselContext().getPickerProps(value, props)} />;
}
export const Carousel = {
  Root: CarouselRoot,
  Viewport: CarouselViewport,
  Slide: CarouselSlide,
  Previous: CarouselPrevious,
  Next: CarouselNext,
  Rotation: CarouselRotation,
  PickerGroup: CarouselPickerGroup,
  Picker: CarouselPicker,
};
