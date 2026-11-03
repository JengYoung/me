import rehypeShiki from '@shikijs/rehype';
import type { Element, Root } from 'hast';
import { unified } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

/** 기존 블로그의 VS Code Dark+ 테마와 복사용 코드 원문을 빌드 결과에 담는다. */
export function rehypeArticleCode() {
  const highlighter = unified().use(rehypeShiki, {
    defaultLanguage: 'text',
    fallbackLanguage: 'text',
    theme: 'dark-plus',
  });

  return async (tree: Root) => {
    const blocks: { parent: Root | Element; index: number; properties: Element['properties'] }[] = [];

    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent || index === undefined) return;
      const code = node.children[0];
      if (code?.type !== 'element' || code.tagName !== 'code') return;
      const classes = code.properties.className;
      const language = Array.isArray(classes)
        ? classes.find((name) => String(name).startsWith('language-'))
        : undefined;

      blocks.push({
        parent,
        index,
        properties: {
          ...node.properties,
          'data-code': code.children.map((child) => (child.type === 'text' ? child.value : '')).join(''),
          'data-language': language ? String(language).slice('language-'.length) : 'text',
        },
      });
    });

    await highlighter.run(tree);

    // Shiki는 pre를 교체하고 마지막 줄바꿈을 정리하므로, 복사는 변환 전 원문을 사용한다.
    for (const { parent, index, properties } of blocks) {
      const block = parent.children[index];
      if (!block) continue;
      visit(block, 'element', (node) => {
        if (node.tagName !== 'pre') return;
        node.properties = { ...properties, ...node.properties };
        return SKIP;
      });
    }
  };
}
