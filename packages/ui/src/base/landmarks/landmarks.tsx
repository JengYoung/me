'use client';
import type { PartProps } from '../_shared/react/index';
import { useLandmark } from './use-landmark';

export function LandmarkBanner({ id, ...props }: PartProps<'header'>) {
  return <header {...useLandmark({ kind: 'banner', id }).getRootProps(props)} />;
}
export function LandmarkComplementary({ id, ...props }: PartProps<'aside'>) {
  return <aside {...useLandmark({ kind: 'complementary', id }).getRootProps(props)} />;
}
export function LandmarkContentInfo({ id, ...props }: PartProps<'footer'>) {
  return <footer {...useLandmark({ kind: 'contentinfo', id }).getRootProps(props)} />;
}
export function LandmarkForm({ id, ...props }: PartProps<'form'>) {
  return <form {...useLandmark({ kind: 'form', id }).getRootProps(props)} />;
}
export function LandmarkMain({ id, ...props }: PartProps<'main'>) {
  return <main {...useLandmark({ kind: 'main', id }).getRootProps(props)} />;
}
export function LandmarkNavigation({ id, ...props }: PartProps<'nav'>) {
  return <nav {...useLandmark({ kind: 'navigation', id }).getRootProps(props)} />;
}
export function LandmarkRegion({ id, ...props }: PartProps<'section'>) {
  return <section {...useLandmark({ kind: 'region', id }).getRootProps(props)} />;
}
export function LandmarkSearch({ id, ...props }: PartProps<'search'>) {
  return <search {...useLandmark({ kind: 'search', id }).getRootProps(props)} />;
}
export const Landmarks = {
  Banner: LandmarkBanner,
  Complementary: LandmarkComplementary,
  ContentInfo: LandmarkContentInfo,
  Form: LandmarkForm,
  Main: LandmarkMain,
  Navigation: LandmarkNavigation,
  Region: LandmarkRegion,
  Search: LandmarkSearch,
};
