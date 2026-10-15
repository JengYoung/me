import type { TextCollectionItem } from '../_shared/core/index';
export interface MenuItem extends TextCollectionItem {
  type?: 'item' | 'checkbox' | 'radio';
  group?: string;
  children?: readonly MenuItem[];
  closeOnSelect?: boolean;
}
export function flattenMenu(items: readonly MenuItem[]): MenuItem[] {
  return items.flatMap((item) => [item, ...flattenMenu(item.children ?? [])]);
}
export function menuPath(items: readonly MenuItem[], value: string | null): MenuItem[] {
  for (const item of items) {
    if (item.value === value) return [item];
    const children = menuPath(item.children ?? [], value);
    if (children.length) return [item, ...children];
  }
  return [];
}
export function validateMenu(items: readonly MenuItem[]) {
  const values = new Set<string>();
  function visit(entries: readonly MenuItem[]) {
    for (const item of entries) {
      if (!item.value || values.has(item.value)) throw new Error('Menu items need globally unique, nonempty values.');
      values.add(item.value);
      if (item.type === 'radio' && !item.group) throw new Error('Menu radio items require a group.');
      if (item.children && (item.type === 'checkbox' || item.type === 'radio'))
        throw new Error('Only ordinary menu items can own submenus.');
      if (item.children?.length === 0) throw new Error('Submenus need at least one item.');
      visit(item.children ?? []);
    }
  }
  visit(items);
}
