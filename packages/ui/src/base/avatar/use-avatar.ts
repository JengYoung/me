'use client';
import { useMachine } from '../_shared/react/index';
import { avatarMachine, validateAvatar } from './avatar.machine';
import type { AvatarOptions } from './avatar.machine';
import { connectAvatar } from './avatar.connect';
import { loadAvatar } from './avatar.dom';
export function useAvatar(options: AvatarOptions) {
  validateAvatar(options);
  return connectAvatar(useMachine(avatarMachine, { props: { ...options, load: loadAvatar } }), options);
}
export type { AvatarOptions, AvatarState } from './avatar.machine';
export type { AvatarApi } from './avatar.connect';
