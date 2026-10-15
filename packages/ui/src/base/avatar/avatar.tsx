'use client';
/* oxlint-disable nextjs/no-img-element -- This framework-neutral headless part requires a native img, not a Next.js loader. */
import { createContext, useContext } from 'react';
import type { PartProps } from "../_shared/react/index";
import { useAvatar } from "./use-avatar";
import type { AvatarApi, AvatarOptions } from "./use-avatar";
import type { AvatarImageProps } from "./avatar.connect";
const Context = createContext<AvatarApi | null>(null);
function useAvatarContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Avatar parts must be rendered inside Avatar.Root.');
  return api;
}
export type AvatarRootProps = AvatarOptions & PartProps<'span'>;
export function AvatarRoot({
  src,
  name,
  fallbackDelay,
  crossOrigin,
  referrerPolicy,
  onStatusChange,
  ...props
}: AvatarRootProps) {
  const api = useAvatar({ src, name, fallbackDelay, crossOrigin, referrerPolicy, onStatusChange });
  return (
    <Context value={api}>
      <span {...api.getRootProps(props)} />
    </Context>
  );
}
export function AvatarImage(props: AvatarImageProps) {
  const api = useAvatarContext();
  return <img alt="" key={api.imageKey} {...api.getImageProps(props)} />;
}
export function AvatarFallback(props: PartProps<'span'>) {
  return <span {...useAvatarContext().getFallbackProps(props)} />;
}
export const Avatar = { Root: AvatarRoot, Image: AvatarImage, Fallback: AvatarFallback };
