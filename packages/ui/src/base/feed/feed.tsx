'use client';
import { createContext, useContext } from 'react';
import type { PartProps } from '../_shared/react/index';
import { useFeed } from './use-feed';
import type { FeedOptions, FeedApi } from './use-feed';
const Context = createContext<FeedApi | null>(null);
function useFeedContext() {
  const api = useContext(Context);
  if (!api) throw new Error('Feed parts must be rendered inside Feed.Root.');
  return api;
}
export type FeedRootProps = PartProps<'div'> & FeedOptions;
export function FeedRoot({
  items,
  totalSize,
  busy,
  hasMore,
  loadAhead,
  onLoadMore,
  onFocusChange,
  beforeId,
  afterId,
  id,
  ...props
}: FeedRootProps) {
  const api = useFeed({ items, totalSize, busy, hasMore, loadAhead, onLoadMore, onFocusChange, beforeId, afterId, id });
  return (
    <Context value={api}>
      <div {...api.getRootProps(props)} />
    </Context>
  );
}
export type FeedArticleProps = PartProps<'article'> & { value: string };
export function FeedArticle({ value, ...props }: FeedArticleProps) {
  return <article {...useFeedContext().getArticleProps(value, props)} />;
}
export type FeedTitleProps = PartProps<'h2'> & { value: string };
export function FeedTitle({ value, ...props }: FeedTitleProps) {
  return <h2 {...useFeedContext().getTitleProps(value, props)}>{props.children}</h2>;
}
export type FeedDescriptionProps = PartProps<'p'> & { value: string };
export function FeedDescription({ value, ...props }: FeedDescriptionProps) {
  return <p {...useFeedContext().getDescriptionProps(value, props)} />;
}
export const Feed = { Root: FeedRoot, Article: FeedArticle, Title: FeedTitle, Description: FeedDescription };
