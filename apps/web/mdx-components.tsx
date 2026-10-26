import { articleMdxComponents, ArticleBody, ArticleTableOfContents } from './shared/article';

const components = { ...articleMdxComponents, wrapper: ArticleBody, ArticleTableOfContents };

export function useMDXComponents() {
  return components;
}
