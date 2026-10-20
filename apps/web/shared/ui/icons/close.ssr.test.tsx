import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import CloseIcon from './close.svg?react';

test('SVG를 브라우저 전역 없이 렌더하고 viewBox·색상 상속·접근성 props를 보존한다', () => {
  expect(typeof window).toBe('undefined');
  expect(typeof document).toBe('undefined');

  const html = renderToStaticMarkup(<CloseIcon aria-hidden="true" focusable="false" className="size-24px" />);

  expect(html).toContain('<svg');
  expect(html).toContain('viewBox="0 0 24 24"');
  expect(html).toContain('fill="none"');
  expect(html).toContain('stroke="currentColor"');
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('focusable="false"');
  expect(html).toContain('class="size-24px"');
});
