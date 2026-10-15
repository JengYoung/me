import { mergeProps } from '../_shared/react/index';
import type { MachineApi, PartProps } from '../_shared/react/index';
import type { RovingFocusApi } from '../_shared/keyboard/index';
import type { RefObject } from 'react';
import { feedFocused } from './feed.machine';
import type { FeedOptions, FeedSchema } from './feed.machine';

export function connectFeed(
  service: MachineApi<FeedSchema>,
  roving: RovingFocusApi,
  options: FeedOptions & { id: string },
  root: RefObject<HTMLDivElement | null>,
) {
  const itemId = (value: string) => `${options.id}-article-${encodeURIComponent(value)}`;
  function itemFor(value: string) {
    const index = options.items.findIndex((item) => item.value === value);
    if (index < 0) throw new Error(`Unknown Feed article: ${value}`);
    return { item: options.items[index]!, index };
  }
  function focus(value: string) {
    const result = roving.focus(value);
    if (result) roving.getItemElement(value)?.scrollIntoView?.({ block: 'nearest' });
    return result;
  }
  function exit(direction: 'before' | 'after') {
    const element = root.current;
    if (!element) return false;
    const props = service.getProps();
    const id = direction === 'before' ? props.beforeId : props.afterId;
    const document = element.ownerDocument;
    let target: HTMLElement | null = id ? document.getElementById(id) : null;
    if (!id) {
      const candidates = [
        ...document.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,[tabindex]'),
      ].filter((node) => {
        const style = document.defaultView?.getComputedStyle(node);
        return (
          node.tabIndex >= 0 &&
          !node.matches(':disabled') &&
          !node.closest('[hidden],[inert]') &&
          style?.display !== 'none' &&
          style?.visibility !== 'hidden' &&
          !element.contains(node)
        );
      });
      target =
        direction === 'after'
          ? (candidates.find((node) => !!(element.compareDocumentPosition(node) & 4)) ?? null)
          : (candidates.filter((node) => !!(element.compareDocumentPosition(node) & 2)).at(-1) ?? null);
    }
    if (!target || element.contains(target) || target.closest('[hidden],[inert]') || target.matches(':disabled'))
      return false;
    target.focus();
    return document.activeElement === target;
  }
  return {
    focusedValue: feedFocused(options, service.state.context),
    busy: !!options.busy,
    focus,
    exit,
    requestMore: () => service.send({ type: 'REQUEST_MORE' }),
    getRootProps(props: PartProps<'div'> = {}): PartProps<'div'> {
      return roving.getRootProps(
        mergeProps<'div'>(props, {
          ref: root,
          id: options.id,
          role: 'feed',
          'aria-busy': !!options.busy,
          'data-scope': 'feed',
          'data-part': 'root',
        }),
      );
    },
    getArticleProps(value: string, props: PartProps<'article'> = {}): PartProps<'article'> {
      const { item, index } = itemFor(value);
      const descriptions = [
        ...new Set(
          [props['aria-describedby'], item.description ? `${itemId(value)}-description` : undefined]
            .filter(Boolean)
            .join(' ')
            .split(/\s+/)
            .filter(Boolean),
        ),
      ].join(' ');
      const base = roving.getItemProps<'article'>(
        value,
        mergeProps<'article'>(props, {
          id: itemId(value),
          'aria-labelledby': props['aria-labelledby'] ?? `${itemId(value)}-title`,
          'aria-describedby': descriptions || undefined,
          'aria-posinset': item.position ?? index + 1,
          'aria-setsize': options.totalSize ?? -1,
          'data-scope': 'feed',
          'data-part': 'article',
          'data-value': value,
          onFocus: (event) => {
            if ((event.target as HTMLElement).closest('[role="feed"]') !== root.current) {
              event.preventDefault();
              return;
            }
            event.currentTarget.scrollIntoView?.({ block: 'nearest' });
          },
          onKeyDown: (event) => {
            if (
              (event.target as HTMLElement).closest('[role="feed"]') !== root.current ||
              event.altKey ||
              event.metaKey ||
              event.shiftKey ||
              event.nativeEvent.isComposing
            )
              return;
            if (
              event.target !== event.currentTarget &&
              (event.target as HTMLElement).matches(
                'input,textarea,select,[contenteditable="true"],[role="slider"],[role="spinbutton"]',
              )
            )
              return;
            if (event.ctrlKey && (event.key === 'Home' || event.key === 'End')) {
              if (exit(event.key === 'Home' ? 'before' : 'after')) {
                event.preventDefault();
                event.stopPropagation();
              }
              return;
            }
            if (event.ctrlKey || (event.key !== 'PageDown' && event.key !== 'PageUp')) return;
            const props = service.getProps();
            const index = props.items.findIndex((item) => item.value === value);
            const next = props.items[index + (event.key === 'PageDown' ? 1 : -1)];
            event.preventDefault();
            event.stopPropagation();
            if (next) focus(next.value);
            else if (event.key === 'PageDown') service.send({ type: 'REQUEST_MORE' });
          },
        }),
      );
      // Feed is a document structure: every article and its native controls keep their Tab stops.
      return { ...base, tabIndex: 0 };
    },
    getTitleProps(value: string, props: PartProps<'h2'> = {}): PartProps<'h2'> {
      itemFor(value);
      return mergeProps<'h2'>(props, { id: `${itemId(value)}-title`, 'data-scope': 'feed', 'data-part': 'title' });
    },
    getDescriptionProps(value: string, props: PartProps<'p'> = {}): PartProps<'p'> {
      itemFor(value);
      return mergeProps<'p'>(props, {
        id: `${itemId(value)}-description`,
        'data-scope': 'feed',
        'data-part': 'description',
      });
    },
  };
}
export type FeedApi = ReturnType<typeof connectFeed>;
