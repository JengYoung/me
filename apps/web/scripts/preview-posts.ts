import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { generatePosts } from './generate-posts.ts';
import { generateDiary } from './generate-diary.ts';
import { generateSeries } from './generate-series.ts';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const outputRoot = fileURLToPath(new URL('../screens/posts/generated-preview', import.meta.url));
const diaryOutputRoot = fileURLToPath(new URL('../screens/diary/generated-preview', import.meta.url));
async function generatePreview() {
  const [posts, diary, series] = await Promise.all([
    generatePosts({ includeDrafts: true, outputRoot }),
    generateDiary({ includeDrafts: true, outputRoot: diaryOutputRoot }),
    generateSeries({
      includeDrafts: true,
      outputRoot: fileURLToPath(new URL('../entities/series/generated-preview', import.meta.url)),
    }),
  ]);
  return { posts, diary, series };
}
const { values } = parseArgs({ options: { port: { type: 'string', default: '3000' } } });
const port = Number(values.port);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('port는 1~65535의 정수여야 합니다.');
if (process.env.NODE_ENV === 'production') throw new Error('초안 미리보기는 개발 환경에서만 실행합니다.');

let watcher: ReturnType<typeof watch> | undefined;
let child: ReturnType<typeof spawn> | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let pending = Promise.resolve();
let stopped = false;

function stop() {
  stopped = true;
  clearTimeout(timer);
  watcher?.close();
  child?.kill('SIGTERM');
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
try {
  const result = await generatePreview();
  console.log(
    `실제 docs 미리보기: 포스트 ${result.posts.posts}개, 일기 ${result.diary.entries}개, 시리즈 ${result.series.series}개`,
  );
  console.log(`http://127.0.0.1:${port}/posts · http://127.0.0.1:${port}/diary · http://127.0.0.1:${port}/series`);
  watcher = watch(new URL('../docs', import.meta.url), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (stopped) return;
      pending = pending
        .then(async () => {
          await generatePreview();
        })
        .catch((error: unknown) => console.error(error));
    }, 100);
  });
  child = spawn(
    process.execPath,
    [
      fileURLToPath(import.meta.resolve('next/dist/bin/next')),
      'dev',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(port),
    ],
    {
      cwd: appRoot,
      env: {
        ...process.env,
        BLOG_CONTENT_PREVIEW: '1',
        BLOG_NEXT_DIST_DIR: process.env.BLOG_NEXT_DIST_DIR ?? '.next-preview',
      },
      stdio: 'inherit',
    },
  );
  const server = child;
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.once('exit', (code) => {
      if (stopped || code === 0) resolve();
      else reject(new Error(`초안 미리보기 서버가 종료되었습니다: ${code}`));
    });
  });
} finally {
  stop();
  process.off('SIGINT', stop);
  process.off('SIGTERM', stop);
  await pending;
}
