import { expect, onTestFinished, test, vi } from 'vitest';
import { absoluteUrl, pageMetadata } from './index';

test.each([
  ['https://blog.example.test', 'https://blog.example.test/posts/example'],
  ['http://localhost:4000/', 'http://localhost:4000/posts/example'],
])('SITE_ORIGIN %s로 기본 글 주소를 만들고 쿼리와 해시를 제외한다', (origin, expected) => {
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
  vi.stubEnv('SITE_ORIGIN', origin);

  expect(absoluteUrl('/posts/example?version=1.0.0#heading')).toBe(expected);
});

test('환경변수의 주소를 canonical과 Open Graph에 함께 반영한다', () => {
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
  vi.stubEnv('SITE_ORIGIN', 'https://preview.example.test:8443');

  const metadata = pageMetadata({ title: 'Posts — 2페이지', description: '글 목록', pathname: '/posts' });

  expect(metadata.alternates).toEqual({ canonical: 'https://preview.example.test:8443/posts' });
  expect(metadata.openGraph).toMatchObject({
    url: 'https://preview.example.test:8443/posts',
    title: 'Posts — 2페이지 | JengYoung',
  });
});

test.each([
  undefined,
  '',
  '   ',
  'example.com',
  'ftp://example.com',
  'https://example.com/posts',
  'https://example.com?preview=1',
  'https://example.com#home',
  'https://user:password@example.com',
])('SITE_ORIGIN이 없거나 잘못된 경우(%s) 다른 주소로 대체하지 않는다', (origin) => {
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
  vi.stubEnv('SITE_ORIGIN', origin);

  expect(() => absoluteUrl('/')).toThrow(/SITE_ORIGIN/);
});
