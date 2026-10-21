import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test, vi } from 'vitest';
import config from '../next.config.js';
import { generatePosts } from './generate-posts';

test('초안 미리보기 생성물이 공개 카탈로그와 섞이지 않는다', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'me-post-generation-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  const contentRoot = path.join(root, 'docs');
  await mkdir(path.join(contentRoot, 'posts', 'working'), { recursive: true });
  await writeFile(
    path.join(contentRoot, 'posts', 'working', '0.0.0.local.md'),
    '---\ntitle: 작성 중인 원고\npublishedAt: ""\n---\n\n본문',
  );
  const publicRoot = path.join(root, 'public-output');
  const previewRoot = path.join(root, 'preview-output');
  await generatePosts({ contentRoot, outputRoot: publicRoot });
  const original = await readFile(path.join(publicRoot, 'catalog.generated.ts'), 'utf8');
  const result = await generatePosts({ contentRoot, outputRoot: previewRoot, includeDrafts: true });
  expect(result).toMatchObject({ posts: 1, drafts: 1, archives: 0 });
  expect(await readFile(path.join(publicRoot, 'catalog.generated.ts'), 'utf8')).toBe(original);
  expect(original).not.toContain('작성 중인 원고');
  expect(await readFile(path.join(previewRoot, 'current.generated.ts'), 'utf8')).toContain('0.0.0.local.md');
});

test('미리보기 설정으로 프로덕션 빌드나 초안 생성을 실행할 수 없다', async () => {
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
  vi.stubEnv('BLOG_CONTENT_PREVIEW', '1');
  expect(() => config('phase-production-build')).toThrow('개발 서버');
  vi.stubEnv('NODE_ENV', 'production');
  await expect(generatePosts({ includeDrafts: true })).rejects.toThrow('개발 서버');
});
