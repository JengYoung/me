import { expect, onTestFinished, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react/pure';
import { ArticleCodeBlock } from './article-code-block';
import {
  ArticleCode,
  ArticleLink,
  ArticleOrderedList,
  ArticleListItem,
  ArticleQuote,
  ArticleTaskCheckbox,
} from './article-elements';
import { ArticleProse } from './article-prose';

test('코드 복사는 표시된 원문의 들여쓰기와 줄바꿈을 보존하고 성공을 알린다', async () => {
  const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  onTestFinished(() => copy.mockRestore());
  const code = 'const value = 1;\n  console.log(value);\n';
  await render(
    <ArticleProse>
      <ArticleCodeBlock>
        <ArticleCode className="language-ts">{code}</ArticleCode>
      </ArticleCodeBlock>
    </ArticleProse>,
  );

  await page.getByRole('button', { name: '코드 복사' }).click();

  expect(copy).toHaveBeenCalledWith(code);
  await expect.element(page.getByRole('status')).toHaveTextContent('복사했습니다.');
});

test('복사 권한 거절을 성공으로 표시하지 않고 다시 시도할 수 있다', async () => {
  const copy = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockRejectedValueOnce(new DOMException('Denied', 'NotAllowedError'))
    .mockResolvedValue(undefined);
  onTestFinished(() => copy.mockRestore());
  await render(<ArticleCodeBlock code="다시 복사" />);

  await page.getByRole('button', { name: '코드 복사' }).click();
  await expect
    .element(page.getByRole('status'))
    .toHaveTextContent('복사하지 못했습니다. 코드를 직접 선택해 복사해주세요.');
  await page.getByRole('button', { name: '코드 복사' }).click();
  await expect.element(page.getByRole('status')).toHaveTextContent('복사했습니다.');
  expect(copy).toHaveBeenCalledTimes(2);
});

test('구문 강조로 나뉜 표시 내용 대신 빌드에서 보존한 원문을 복사한다', async () => {
  const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  onTestFinished(() => copy.mockRestore());
  const original = 'const value = 1;\n\n';
  await render(
    <ArticleCodeBlock data-code={original} data-language="ts">
      <ArticleCode>
        <span>const</span>
        {' value = '}
        <span>1</span>
        {';'}
      </ArticleCode>
    </ArticleCodeBlock>,
  );

  await page.getByRole('button', { name: '코드 복사' }).click();

  expect(copy).toHaveBeenCalledWith(original);
  await expect.element(page.getByRole('status')).toHaveTextContent('복사했습니다.');
});

test('아티클 링크·인용 출처·목록·체크 항목의 의미와 속성을 보존한다', async () => {
  await render(
    <ArticleProse>
      <ArticleLink href="https://mdxjs.com/" target="_blank" rel="author">
        MDX 문서
      </ArticleLink>
      <ArticleQuote source={{ label: '출처', href: '/posts/source' }}>인용한 문장</ArticleQuote>
      <ArticleOrderedList start={3}>
        <ArticleListItem>세 번째 항목</ArticleListItem>
      </ArticleOrderedList>
      <ArticleTaskCheckbox checked aria-label="확인한 항목" />
    </ArticleProse>,
  );

  await expect
    .element(page.getByRole('link', { name: 'MDX 문서' }))
    .toHaveAttribute('rel', 'author noopener noreferrer');
  await expect.element(page.getByRole('link', { name: '출처' })).toHaveAttribute('href', '/posts/source');
  await expect.element(page.getByRole('list')).toHaveAttribute('start', '3');
  await expect.element(page.getByRole('checkbox', { name: '확인한 항목' })).toBeChecked();
  await expect.element(page.getByRole('checkbox', { name: '확인한 항목' })).toBeDisabled();
});
