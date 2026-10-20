// MDX 빌드 전용 진입점. UI의 index.ts에서는 내보내지 않아 Shiki를 브라우저 번들에 넣지 않는다.
export { rehypeArticleCode } from './lib/rehype-article-code.ts';
