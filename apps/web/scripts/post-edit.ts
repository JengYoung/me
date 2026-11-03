import path from 'node:path';
import { parseArgs } from 'node:util';
import { choosePost, run } from './content/cli.ts';
import { editPost } from './content/post-source.ts';

await run(async () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { help: { type: 'boolean', short: 'h' }, local: { type: 'boolean' } },
  });
  if (values.help) {
    console.log(
      '사용법: pnpm post:edit [postId] [--local]\n기존 초안이 있으면 해당 경로를 보여주고, 없으면 최신 공개 본문과 이미지 참조를 유지한 수정 초안을 만듭니다.',
    );
    return;
  }
  if (positionals.length > 1) throw new Error('글 ID는 하나만 전달하세요.');
  const postId = await choosePost(positionals[0]);
  const result = await editPost({ postId, local: values.local });
  console.log(
    `${result.created ? '수정 초안 생성' : '작성 중인 초안'}: ${path.relative(process.cwd(), result.filename)}`,
  );
  console.log(`미리보기: http://localhost:3000/posts/${postId}`);
});
