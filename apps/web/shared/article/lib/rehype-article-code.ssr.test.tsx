import { compile, run } from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import * as runtime from 'react/jsx-runtime';
import { expect, test } from 'vitest';
import { articleMdxComponents } from '../mdx-components';
import { rehypeArticleCode } from './rehype-article-code';

test('MDX 빌드가 Dark+ 강조를 만들고 복사할 원문과 언어를 보존한다', async () => {
  const source = '```tsx\nconst count = 2;\n\n  <button disabled={false}>복사 & 확인</button>;\n```';
  const compiled = await compile(source, {
    outputFormat: 'function-body',
    rehypePlugins: [rehypeArticleCode],
  });
  const { default: Content } = await run(compiled, runtime);
  const html = renderToStaticMarkup(<Content components={articleMdxComponents} />);
  const rawHtml = renderToStaticMarkup(<Content />);

  expect(html).toContain('data-theme="dark"');
  expect(html).toContain('shiki dark-plus');
  expect(html.toLowerCase()).toContain('background-color:#1e1e1e');
  expect(html.toLowerCase()).toContain('color:#569cd6');
  expect(html).toContain('font-mono');
  expect(html).toContain('aria-label="tsx 코드"');
  expect(rawHtml).toContain(
    'data-code="const count = 2;\n\n  &lt;button disabled={false}&gt;복사 &amp; 확인&lt;/button&gt;;\n"',
  );
  expect(rawHtml).toContain('data-language="tsx"');
  expect(String(compiled)).not.toMatch(/(?:import|require).*?(?:shiki|@shikijs)/);
  expect(String(compiled)).not.toContain('WebAssembly');
});

test.each(['', 'text', 'unknown-language'])(
  '%s 언어가 없어도 원문을 잃거나 발행을 실패하지 않는다',
  async (language) => {
    const compiled = await compile('```' + language + '\n  plain <text>\n```', {
      outputFormat: 'function-body',
      rehypePlugins: [rehypeArticleCode],
    });
    const { default: Content } = await run(compiled, runtime);
    const html = renderToStaticMarkup(<Content />);

    expect(html).toContain(`data-language="${language || 'text'}"`);
    expect(html).toContain('data-code="  plain &lt;text&gt;\n"');
    expect(html).toContain('plain &lt;text&gt;');
    expect(html).not.toMatch(/<span style="color:/);
  },
);
