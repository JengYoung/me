import { mergeProps } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';

export interface LinkOptions {
  href: string;
  current?: PartProps<'a'>['aria-current'];
  id?: string;
}
export function connectLink(options: LinkOptions & { id: string }) {
  return {
    id: options.id,
    getRootProps(props: PartProps<'a'> = {}): PartProps<'a'> {
      const { 'aria-current': _current, ...user } = props;
      return mergeProps<'a'>(user, {
        id: options.id,
        href: options.href,
        'aria-current': options.current,
        'data-scope': 'link',
        'data-part': 'root',
      });
    },
  };
}
export type LinkApi = ReturnType<typeof connectLink>;
