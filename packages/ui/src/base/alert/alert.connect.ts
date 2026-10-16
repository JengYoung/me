import { mergeProps } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';

export function connectAlert(id: string) {
  return {
    id,
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return mergeProps<'div'>(props, {
        id,
        role: 'alert',
        'aria-atomic': true,
        'data-scope': 'alert',
        'data-part': 'root',
      });
    },
  };
}
export type AlertApi = ReturnType<typeof connectAlert>;
