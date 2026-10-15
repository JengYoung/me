import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { AvatarOptions, AvatarSchema } from './avatar.machine';
export type AvatarImageProps = Omit<
  PartProps<'img'>,
  'src' | 'srcSet' | 'sizes' | 'alt' | 'crossOrigin' | 'referrerPolicy'
>;
export function connectAvatar(machine: MachineApi<AvatarSchema>, options: AvatarOptions) {
  const { state, send } = machine;
  return {
    status: state.value,
    loaded: state.value === 'loaded',
    fallbackVisible: state.context.fallback,
    imageKey: String(state.context.revision) + ':' + (options.src ?? ''),
    retry: () => send({ type: 'RETRY' }),
    getRootProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, {
        role: options.name ? 'img' : 'presentation',
        'aria-label': options.name || undefined,
        'aria-hidden': options.name ? undefined : true,
        'data-scope': 'avatar',
        'data-part': 'root',
        'data-state': state.value,
      });
    },
    getImageProps(user: AvatarImageProps = {}): PartProps<'img'> {
      return mergeProps<'img'>(user, {
        src: options.src || undefined,
        crossOrigin: options.crossOrigin,
        referrerPolicy: options.referrerPolicy,
        alt: '',
        'aria-hidden': true,
        hidden: state.value !== 'loaded',
        'data-scope': 'avatar',
        'data-part': 'image',
        'data-state': state.value,
      });
    },
    getFallbackProps(user: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(user, {
        hidden: !state.context.fallback,
        'aria-hidden': true,
        'data-scope': 'avatar',
        'data-part': 'fallback',
        'data-state': state.value,
      });
    },
  };
}
export type AvatarApi = ReturnType<typeof connectAvatar>;
