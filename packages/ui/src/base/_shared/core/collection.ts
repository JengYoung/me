export interface CollectionItem {
  readonly value: string;
  readonly disabled?: boolean;
}

/** The accessible text used for character navigation; keep it aligned with the rendered label. */
export interface TextCollectionItem extends CollectionItem {
  readonly label: string;
}

export function getTypeaheadTarget(
  items: readonly TextCollectionItem[],
  current: string | null,
  query: string,
): string | null {
  const enabled = items.filter((item) => !item.disabled);
  const letters = [...query.toLocaleLowerCase()];
  const repeated = letters.every((letter) => letter === letters[0]);
  const search = repeated ? (letters[0] ?? '') : letters.join('');
  if (!search) return null;
  const index = enabled.findIndex((item) => item.value === current);
  // Continuing a word can keep its current match; repeated letters cycle through matches.
  const start = Math.max(0, index + (repeated ? 1 : 0));
  return (
    [...enabled.slice(start), ...enabled.slice(0, start)].find((item) =>
      item.label.trim().toLocaleLowerCase().startsWith(search),
    )?.value ?? null
  );
}

export type Orientation = 'horizontal' | 'vertical' | 'both';
export type Direction = 'ltr' | 'rtl';
export type NavigationIntent = 'next' | 'previous' | 'first' | 'last';

export function validateCollection(items: readonly CollectionItem[]): void {
  const values = new Set<string>();
  for (const item of items) {
    if (typeof item.value !== 'string' || !item.value || values.has(item.value)) {
      throw new Error('Collection items need unique, nonempty string values.');
    }
    values.add(item.value);
  }
}

export function isItemEnabled(items: readonly CollectionItem[], value: string | null): value is string {
  return value !== null && items.some((item) => item.value === value && !item.disabled);
}

export function firstEnabledValue(items: readonly CollectionItem[]): string | null {
  return items.find((item) => !item.disabled)?.value ?? null;
}

export function sameCollection(first: readonly CollectionItem[], second: readonly CollectionItem[]): boolean {
  return (
    first.length === second.length &&
    first.every((item, index) => item.value === second[index]!.value && !!item.disabled === !!second[index]!.disabled)
  );
}

/** Keep a valid value, otherwise prefer its next neighbour, then the preceding enabled item. */
export function recoverValue(
  items: readonly CollectionItem[],
  previous: readonly CollectionItem[],
  value: string | null,
): string | null {
  if (isItemEnabled(items, value)) return value;
  const index = previous.findIndex((item) => item.value === value);
  if (index < 0) return firstEnabledValue(items);
  const neighbours = [...previous.slice(index + 1), ...previous.slice(0, index).reverse()];
  return neighbours.find((item) => isItemEnabled(items, item.value))?.value ?? firstEnabledValue(items);
}

export function getNavigationIntent(
  key: string,
  options: { orientation?: Orientation; dir?: Direction; homeEnd?: boolean } = {},
): NavigationIntent | null {
  if (options.homeEnd !== false && key === 'Home') return 'first';
  if (options.homeEnd !== false && key === 'End') return 'last';
  const orientation = options.orientation ?? 'horizontal';
  if (orientation !== 'vertical') {
    if (key === 'ArrowRight') return options.dir === 'rtl' ? 'previous' : 'next';
    if (key === 'ArrowLeft') return options.dir === 'rtl' ? 'next' : 'previous';
  }
  if (orientation !== 'horizontal') {
    if (key === 'ArrowDown') return 'next';
    if (key === 'ArrowUp') return 'previous';
  }
  return null;
}

export function getNavigationTarget(
  items: readonly CollectionItem[],
  current: string | null,
  intent: NavigationIntent,
  loop = true,
): string | null {
  const enabled = items.filter((item) => !item.disabled);
  if (!enabled.length) return null;
  if (intent === 'first') return enabled[0]!.value;
  if (intent === 'last') return enabled.at(-1)!.value;
  const index = enabled.findIndex((item) => item.value === current);
  if (index < 0) return intent === 'next' ? enabled[0]!.value : enabled.at(-1)!.value;
  const next = index + (intent === 'next' ? 1 : -1);
  if (!loop && (next < 0 || next >= enabled.length)) return null;
  return enabled[(next + enabled.length) % enabled.length]!.value;
}
