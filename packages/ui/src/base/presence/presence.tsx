'use client';

import type { PartProps } from "../_shared/react/index";
import { usePresence } from "./use-presence";
import type { PresenceOptions } from "./use-presence";

export type PresenceProps = PresenceOptions & PartProps<'div'>;

export function Presence({ present, immediate, forceMount, maxDuration, onExitComplete, ...props }: PresenceProps) {
  const api = usePresence({ present, immediate, forceMount, maxDuration, onExitComplete });
  return api.mounted ? <div {...api.getPresenceProps(props)} /> : null;
}
