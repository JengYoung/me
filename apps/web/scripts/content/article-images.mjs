import { createProcessor } from '@mdx-js/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

/** AST로 실제 이미지 참조만 찾는다. 코드 예제·일반 링크·본문은 바꾸지 않는다. */
export function articleImages(source, filename) {
  const tree = createProcessor({
    format: filename.endsWith('.md') ? 'md' : 'mdx',
    remarkPlugins: [remarkFrontmatter, remarkGfm],
  }).parse(source);
  const references = [];
  const definitions = new Set();
  const components = new Set(['ArticleImage', 'img']);
  visit(tree, 'imageReference', (node) => definitions.add(node.identifier));
  visit(tree, 'mdxjsEsm', (node) => {
    for (const statement of node.data?.estree?.body ?? []) {
      if (statement.type !== 'ImportDeclaration') continue;
      if (statement.source.value === 'next/image') {
        for (const specifier of statement.specifiers)
          if (specifier.type === 'ImportDefaultSpecifier') components.add(specifier.local.name);
      }
      if (/\.(png|jpe?g|webp|avif|gif)$/i.test(statement.source.value)) {
        references.push({
          source: statement.source.value,
          start: statement.source.start,
          end: statement.source.end,
          kind: 'literal',
        });
      }
    }
  });
  visit(tree, (node) => {
    if (node.type === 'image' || (node.type === 'definition' && definitions.has(node.identifier))) {
      references.push({
        source: node.url,
        start: node.position.start.offset,
        end: node.position.end.offset,
        kind: 'markdown',
      });
    }
    if (!['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type) || !components.has(node.name)) return;
    const attribute = node.attributes.find((attribute) => attribute.name === 'src');
    const literal = attribute?.value?.data?.estree?.body[0]?.expression;
    const value =
      typeof attribute?.value === 'string' ? attribute.value : literal?.type === 'Literal' ? literal.value : undefined;
    if (typeof value === 'string')
      references.push({
        source: value,
        start: attribute.position.start.offset,
        end: attribute.position.end.offset,
        kind: 'attribute',
      });
  });
  return {
    sources: [...new Set(references.map((reference) => reference.source))],
    rewrite(mapping) {
      let output = source;
      // oxlint-disable-next-line unicorn/no-array-sort -- 참조 배열의 복사본을 뒤에서부터 적용한다.
      for (const reference of [...references].sort((a, b) => b.start - a.start)) {
        const next = mapping.get(reference.source);
        if (!next || next === reference.source) continue;
        let replacement;
        if (reference.kind === 'literal') replacement = JSON.stringify(next);
        else if (reference.kind === 'attribute') replacement = `src={${JSON.stringify(next)}}`;
        else {
          const original = source.slice(reference.start, reference.end);
          if (original.split(reference.source).length !== 2)
            throw new Error(`이미지 경로를 명확하게 작성하세요: ${reference.source}`);
          replacement = original.replace(reference.source, next);
        }
        output = output.slice(0, reference.start) + replacement + output.slice(reference.end);
      }
      return output;
    },
  };
}
