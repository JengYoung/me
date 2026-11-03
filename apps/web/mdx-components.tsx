import { articleMdxComponents, ArticleBody, ArticleTableOfContents } from './shared/ui/article';

const components = { ...articleMdxComponents, wrapper: ArticleBody, ArticleTableOfContents };

export function useMDXComponents() {
  return components;
}
