import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, onTestFinished, test } from 'vitest';
import { validatePosts } from './validate-posts';

test('Git HEAD의 공개 원고·자산 변경과 삭제를 검출하고 파일을 자동 복원하지 않는다', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'me-content-history-'));
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'docs/posts/article');
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, '1.0.0.mdx');
  const image = path.join(directory, '1.0.0.image.png');
  const original =
    '---\ntitle: 공개 글\npublishedAt: "2026-10-22T15:00:00+09:00"\n---\n\n## 본문\n\n![그림](./1.0.0.image.png)';
  await writeFile(file, original);
  await writeFile(image, 'image');
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  git('init');
  git('add', 'docs');
  git(
    '-c',
    'user.name=Content Test',
    '-c',
    'user.email=content-test@example.invalid',
    '-c',
    'commit.gpgsign=false',
    'commit',
    '-m',
    'published content',
  );
  expect(await validatePosts({ contentRoot: path.join(root, 'docs') })).toMatchObject({ published: 1, history: 2 });
  await writeFile(file, `${original}\n변경`);
  await expect(validatePosts({ contentRoot: path.join(root, 'docs') })).rejects.toThrow('기존 공개 파일');
  expect(await readFile(file, 'utf8')).toBe(`${original}\n변경`);
  await writeFile(file, original);
  await rm(image);
  await expect(validatePosts({ contentRoot: path.join(root, 'docs') })).rejects.toThrow('기존 공개 파일');
});
