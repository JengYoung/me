'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PartProps } from '../_shared/react/index';
import { ModalFocusProvider } from '../_shared/focus/index';
import { DialogPortal } from '../dialog/index';
import { useTour } from './use-tour';
import type { TourApi, TourOptions } from './use-tour';

const Context = createContext<TourApi | null>(null);
function useTourContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Tour parts must be inside Tour.Root.');
  return api;
}
export type TourRootProps = TourOptions & { children?: ReactNode };
export function TourRoot({ children, ...options }: TourRootProps) {
  const api = useTour(options);
  return (
    <ModalFocusProvider scope={api.scope}>
      <Context value={api}>{children}</Context>
    </ModalFocusProvider>
  );
}
export function TourTrigger(props: PartProps<'button'>) {
  return <button {...useTourContext().getTriggerProps(props)} />;
}
export function TourContent(props: PartProps<'div'>) {
  return <div {...useTourContext().getContentProps(props)} />;
}
export function TourTitle(props: PartProps<'h2'>) {
  const bound = useTourContext().getTitleProps(props);
  return <h2 {...bound}>{bound.children}</h2>;
}
export function TourDescription(props: PartProps<'p'>) {
  return <p {...useTourContext().getDescriptionProps(props)} />;
}
export function TourStatusText(props: PartProps<'p'>) {
  return <p {...useTourContext().getStatusProps(props)} />;
}
export function TourProgress(props: PartProps<'p'>) {
  return <p {...useTourContext().getProgressProps(props)} />;
}
export function TourNext(props: PartProps<'button'>) {
  return <button {...useTourContext().getNextProps(props)} />;
}
export function TourPrevious(props: PartProps<'button'>) {
  return <button {...useTourContext().getPreviousProps(props)} />;
}
export function TourSkip(props: PartProps<'button'>) {
  return <button {...useTourContext().getSkipProps(props)} />;
}
export function TourClose(props: PartProps<'button'>) {
  return <button {...useTourContext().getCloseProps(props)} />;
}
export function TourRetry(props: PartProps<'button'>) {
  return <button {...useTourContext().getRetryProps(props)} />;
}
export function TourSpotlight(props: PartProps<'div'>) {
  return <div {...useTourContext().getSpotlightProps(props)} />;
}
export function TourBackdrop(props: PartProps<'div'>) {
  return <div {...useTourContext().getBackdropProps(props)} />;
}
export const TourPortal = DialogPortal;
export const Tour = {
  Root: TourRoot,
  Trigger: TourTrigger,
  Content: TourContent,
  Title: TourTitle,
  Description: TourDescription,
  Status: TourStatusText,
  Progress: TourProgress,
  Next: TourNext,
  Previous: TourPrevious,
  Skip: TourSkip,
  Close: TourClose,
  Retry: TourRetry,
  Spotlight: TourSpotlight,
  Backdrop: TourBackdrop,
  Portal: TourPortal,
};
