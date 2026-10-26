import { evaluate } from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import { expect, test } from 'vitest';
import { articleMdxComponents } from './mdx-components';

test('실제 Markdown과 GFM이 아티클 요소에 연결되고 의미·순서·코드 원문을 유지한다', async () => {
  const source = [
    '## 렌더링의 조건',
    '',
    '> 환경을 먼저 확인합니다.',
    '',
    '**강조**와 *기울임*, ~~삭제~~, `count`와 [참조](#reference).',
    '',
    '3. 세 번째',
    '4. 네 번째',
    '',
    '- [x] 확인 완료',
    '- [ ] 확인 전',
    '',
    '| 종류 | 값 |',
    '| :--- | ---: |',
    '| 버전 | 1 |',
    '',
    '```tsx',
    'const element = <div>내용</div>;',
    '  console.log(element);',
    '```',
  ].join('\n');
  const { default: Content } = await evaluate(source, { ...runtime, remarkPlugins: [remarkGfm] });
  const html = renderToStaticMarkup(<Content components={articleMdxComponents} />);

  expect(typeof window).toBe('undefined');
  expect(html).toContain('data-article-prose');
  expect(html).toMatch(/<h2[^>]*>렌더링의 조건<\/h2>/);
  expect(html).toContain('<blockquote');
  expect(html).toContain('href="#reference"');
  expect(html).toContain('<ol start="3"');
  expect(html).toContain('type="checkbox" disabled="" readOnly=""');
  expect(html).toContain('checked=""');
  expect(html).toContain('aria-label="표"');
  expect(html).toContain('text-right');
  expect(html).not.toContain('style=');
  expect(html).toContain('<strong');
  expect(html).toContain('<em');
  expect(html).toContain('<del');
  expect(html).toContain('aria-label="tsx 코드"');
  expect(html).toContain('const element = &lt;div&gt;내용&lt;/div&gt;;\n  console.log(element);\n');
  expect(html).toContain('코드 복사');
});

test('단독 Markdown 이미지는 figure와 캡션을 만들고 이미지 URL을 바꾸지 않는다', async () => {
  const { default: Content } = await evaluate('![흐름](./1.0.0.flow.png "처리 과정")', runtime);
  const html = renderToStaticMarkup(<Content components={articleMdxComponents} />);

  expect(html).toContain('<figure');
  expect(html).toContain('src="./1.0.0.flow.png"');
  expect(html).toContain('alt="흐름"');
  expect(html).toMatch(/<figcaption[^>]*>처리 과정<\/figcaption>/);
  expect(html).not.toContain('<p>');
});

test('문장·링크 안의 Markdown 이미지는 문단에 figure를 중첩하지 않는다', async () => {
  const { default: Content } = await evaluate(
    '그림 ![흐름](./1.0.0.flow.png)과 [![다음](./1.0.0.next.png)](#next)를 봅니다.',
    runtime,
  );
  const html = renderToStaticMarkup(<Content components={articleMdxComponents} />);

  expect(html).toContain('<p>그림 <span');
  expect(html).toContain('href="#next"');
  expect(html).toContain('alt="다음"');
  expect(html).not.toContain('<figure');
});

test('등록된 JSX 컴포넌트를 import 없이 쓰며 선택 props를 같은 구현에 전달한다', async () => {
  const source = [
    '<ArticleImage src="./1.0.0.flow.png" alt="흐름" caption="설명" pcWidth="1/2" moWidth="full" />',
    '',
    '<Callout tone="warning" title="확인">전제가 바뀌었습니다.</Callout>',
    '',
    '<ArticleCodeBlock language="ts" code={"const value = 1;\\n"} />',
  ].join('\n');
  const { default: Content } = await evaluate(source, runtime);
  const html = renderToStaticMarkup(<Content components={articleMdxComponents} />);

  expect(html).toContain('src="./1.0.0.flow.png"');
  expect(html).toContain('desktop:w-1/2');
  expect(html).toContain('mobile:w-full');
  expect(html).toContain('aria-label="⚠️ 주의 · 확인"');
  expect(html).toContain('전제가 바뀌었습니다.');
  expect(html).toContain('const value = 1;\n');
});

test('제목 안의 링크와 고유 링크를 중첩하지 않고 한글 ID를 보존한다', async () => {
  const { default: Content } = await evaluate(
    '<ArticleHeading id="첫 제목"><ArticleLink href="/posts/example">관련 글</ArticleLink></ArticleHeading>',
    runtime,
  );
  const html = renderToStaticMarkup(<Content components={articleMdxComponents} />);

  expect(html).toContain('id="첫 제목"');
  expect(html).toContain(`href="#${encodeURIComponent('첫 제목')}"`);
  expect(html).toMatch(/관련 글<\/a><\/span><a/);
  expect(html).toContain('aria-labelledby="heading-label-첫 제목"');
});
