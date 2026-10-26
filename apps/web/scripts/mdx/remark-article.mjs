import { realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import GithubSlugger from 'github-slugger';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import { parse } from 'yaml';

const attribute = (name, value) => ({ type: 'mdxJsxAttribute', name, value });
const element = (name, attributes = [], children = [], flow = true) => ({
  type: flow ? 'mdxJsxFlowElement' : 'mdxJsxTextElement',
  name,
  attributes,
  children,
});
const expressionAttribute = (name, identifier) =>
  attribute(name, {
    type: 'mdxJsxAttributeValueExpression',
    value: identifier,
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [{ type: 'ExpressionStatement', expression: { type: 'Identifier', name: identifier } }],
      },
    },
  });

/** Next.js 빌드 전용: 본문 앵커·목차와 참조된 공개 이미지의 정적 import를 생성한다. */
export default function remarkArticle({ preview = false } = {}) {
  return (tree, file) => {
    const sourceDirectory = path.dirname(file.path ?? '');
    const isDiary =
      path.basename(path.dirname(sourceDirectory)) === 'diary' && /^\d{4}$/.test(path.basename(sourceDirectory));
    const diaryMetadata = isDiary ? parse(tree.children.find((node) => node.type === 'yaml')?.value ?? '') : undefined;
    const isDraft = isDiary
      ? !diaryMetadata?.publishedAt || /\.local\./.test(file.path ?? '')
      : /^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:\.local)?\.mdx?$/.test(path.basename(file.path ?? ''));
    if (!preview && (isDraft || /\.local\./.test(file.path ?? ''))) {
      file.fail('초안은 content:preview 명령으로만 읽을 수 있습니다.');
    }
    const slugger = new GithubSlugger();
    const headings = [];
    const definitions = new Map();
    const images = new Map();
    const importedImages = new Set();
    const imports = [];
    const imageComponents = new Set(['img', 'ArticleImage']);
    let imageIndex = 0;

    function validateImage(source, node) {
      const imagePattern =
        (preview && isDraft) || isDiary
          ? /^\.\/[^/\\]+\.(?:png|jpe?g|webp|avif|gif)$/i
          : /^\.\/[1-9]\d*\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.[^/\\]+\.(?:png|jpe?g|webp|avif|gif)$/i;
      if (!imagePattern.test(source) || (isDiary && !isDraft && /\.local\./.test(source))) {
        file.fail(
          isDiary
            ? '일기 이미지는 같은 폴더의 ./이미지.png를 참조하고 공개 원고에서 .local. 자산은 제외하세요.'
            : '이미지는 같은 글 폴더의 ./1.0.0.이미지.png처럼 공개 버전 파일을 참조하세요.',
          node,
        );
      }
      try {
        const directory = realpathSync(path.dirname(file.path));
        const imagePath = realpathSync(path.resolve(directory, source));
        if (path.dirname(imagePath) !== directory || !statSync(imagePath).isFile()) throw new Error('invalid image');
      } catch {
        file.fail(`참조한 이미지 파일을 찾을 수 없습니다: ${source}`, node);
      }
    }

    visit(tree, 'definition', (node) => {
      if (!definitions.has(node.identifier)) definitions.set(node.identifier, node);
    });
    visit(tree, 'mdxjsEsm', (node) => {
      for (const statement of node.data?.estree?.body ?? []) {
        if (statement.type !== 'ImportDeclaration') continue;
        const source = String(statement.source.value);
        if (source === 'next/image') {
          for (const specifier of statement.specifiers) {
            if (specifier.type === 'ImportDefaultSpecifier') imageComponents.add(specifier.local.name);
          }
        }
        if (/\.(?:png|jpe?g|webp|avif|gif)$/i.test(source)) {
          validateImage(source, node);
          for (const specifier of statement.specifiers) {
            if (specifier.type === 'ImportDefaultSpecifier') {
              images.set(source, specifier.local.name);
              importedImages.add(specifier.local.name);
            }
          }
        }
        // 공용 컴포넌트 import는 허용하되 다른 원고를 import하여 초안을 노출하지 않는다.
        if (/\.(?:md|mdx)(?:[?#]|$)/i.test(source)) file.fail('다른 원고는 import 대신 공개 URL로 링크하세요.', node);
      }
    });

    function importImage(source, node) {
      validateImage(source, node);
      if (images.has(source)) return images.get(source);
      let name;
      do {
        name = `_articleImage${imageIndex++}`;
      } while (String(file.value).includes(name));
      images.set(source, name);
      importedImages.add(name);
      imports.push({
        type: 'mdxjsEsm',
        value: `import ${name} from ${JSON.stringify(source)};`,
        data: {
          estree: {
            type: 'Program',
            sourceType: 'module',
            body: [
              {
                type: 'ImportDeclaration',
                source: { type: 'Literal', value: source },
                specifiers: [{ type: 'ImportDefaultSpecifier', local: { type: 'Identifier', name } }],
              },
            ],
          },
        },
      });
      return name;
    }

    visit(tree, 'heading', (node) => {
      if (node.depth === 1) file.fail('글 제목은 frontmatter.title에, 본문 제목은 ##부터 작성하세요.', node);
      const text = toString(node).trim();
      const id = `article-${slugger.slug(text || 'section')}`;
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
      headings.push({ id, text, depth: node.depth });
    });
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (node.type === 'image' || node.type === 'imageReference') {
        const definition = node.type === 'imageReference' ? definitions.get(node.identifier) : node;
        if (!definition) file.fail('이미지 참조 정의가 없습니다.', node);
        if (!node.alt?.trim()) file.fail('이미지의 대체 텍스트를 작성하세요.', node);
        const attrs = [
          expressionAttribute('src', importImage(definition.url, node)),
          attribute('alt', node.alt),
          attribute('inline', null),
        ];
        if (definition.title) attrs.push(attribute('title', definition.title));
        parent.children[index] = element('ArticleImage', attrs, [], false);
      }
      if (!['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type) || !imageComponents.has(node.name)) return;
      const sourceIndex = node.attributes.findIndex((item) => item.name === 'src');
      const source = node.attributes[sourceIndex]?.value;
      const expression = source?.data?.estree?.body[0]?.expression;
      const literal =
        typeof source === 'string' ? source : expression?.type === 'Literal' ? expression.value : undefined;
      const identifier = expression?.type === 'Identifier' ? expression.name : undefined;
      const imported = typeof literal === 'string' ? importImage(literal, node) : identifier;
      if (!imported || !importedImages.has(imported))
        file.fail('이미지 src는 로컬 경로 문자열 또는 정적 이미지 import여야 합니다.', node);
      const alt = node.attributes.find((item) => item.name === 'alt')?.value;
      const altValue = typeof alt === 'string' ? alt : alt?.data?.estree?.body[0]?.expression?.value;
      if (typeof altValue !== 'string' || !altValue.trim()) file.fail('이미지의 대체 텍스트를 작성하세요.', node);
      node.attributes[sourceIndex] = expressionAttribute('src', imported);
      node.name = 'ArticleImage';
      if (node.type === 'mdxJsxTextElement' && !node.attributes.some((item) => item.name === 'inline'))
        node.attributes.push(attribute('inline', null));
    });
    visit(tree, 'paragraph', (node, index, parent) => {
      if (parent && index !== undefined && node.children.length === 1 && node.children[0].name === 'ArticleImage') {
        parent.children[index] = {
          ...node.children[0],
          type: 'mdxJsxFlowElement',
          attributes: node.children[0].attributes.filter((item) => item.name !== 'inline'),
        };
      }
    });
    const metadata = tree.children.filter((node) => ['mdxjsEsm', 'yaml', 'definition'].includes(node.type));
    const body = tree.children.filter((node) => !metadata.includes(node));
    const tocItems = headings.map(({ id, text, depth }) =>
      element(
        'li',
        [attribute('data-depth', String(depth))],
        [element('a', [attribute('href', `#${encodeURIComponent(id)}`)], [{ type: 'text', value: text }])],
      ),
    );
    const toc = headings.length ? [element('ArticleTableOfContents', [], [element('ol', [], tocItems)])] : [];
    tree.children = [...imports, ...metadata, ...toc, element('ArticleProse', [attribute('id', 'post-content')], body)];
  };
}
