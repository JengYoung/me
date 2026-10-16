import { mergeProps } from '../_shared/react/index';
import type { PartProps } from '../_shared/react/index';

export type BreadcrumbLinkProps = PartProps<'a'> & { current?: boolean };
export function connectBreadcrumb(id: string) {
  return {
    id,
    getRootProps(props: PartProps<'nav'> = {}): PartProps<'nav'> {
      return mergeProps<'nav'>(props, {
        id,
        'aria-label': props['aria-labelledby'] ? undefined : (props['aria-label'] ?? 'Breadcrumb'),
        'data-scope': 'breadcrumb',
        'data-part': 'root',
      });
    },
    getListProps(props: PartProps<'ol'> = {}): PartProps<'ol'> {
      return mergeProps<'ol'>(props, { 'data-scope': 'breadcrumb', 'data-part': 'list' });
    },
    getItemProps(props: PartProps<'li'> = {}): PartProps<'li'> {
      return mergeProps<'li'>(props, { 'data-scope': 'breadcrumb', 'data-part': 'item' });
    },
    getLinkProps({ current = false, 'aria-current': _current, ...props }: BreadcrumbLinkProps = {}): PartProps<'a'> {
      return mergeProps<'a'>(props, {
        'aria-current': current ? 'page' : undefined,
        'data-scope': 'breadcrumb',
        'data-part': 'link',
      });
    },
    getCurrentProps(props: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(props, { 'aria-current': 'page', 'data-scope': 'breadcrumb', 'data-part': 'current' });
    },
    getSeparatorProps(props: PartProps<'span'> = {}): PartProps<'span'> {
      return mergeProps<'span'>(props, { 'aria-hidden': true, 'data-scope': 'breadcrumb', 'data-part': 'separator' });
    },
  };
}
export type BreadcrumbApi = ReturnType<typeof connectBreadcrumb>;
