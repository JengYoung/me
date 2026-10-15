'use client';
import { useStableId } from '../_shared/react/index';
import { connectLink } from './link.connect';
import type { LinkOptions } from './link.connect';
export function useLink(options: LinkOptions) {
  return connectLink({ ...options, id: useStableId('iris-link', options.id) });
}
export type { LinkApi, LinkOptions } from './link.connect';
