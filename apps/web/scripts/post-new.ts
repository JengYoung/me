import path from 'node:path';
import { parseArgs } from 'node:util';
import { intro, outro, select, text } from '@clack/prompts';
import { answer, requireTerminal, run } from './content/cli.ts';
import { createPost, parseTags, postIdError, writingContext } from './content/post-source.ts';

await run(async () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      title: { type: 'string' },
      summary: { type: 'string' },
      tags: { type: 'string' },
      series: { type: 'string' },
      order: { type: 'string' },
      local: { type: 'boolean' },
    },
  });
  if (values.help) {
    console.log(
      '사용법: pnpm post:new [postId] [--local]\n대화형으로 ID·제목·요약·태그·시리즈를 입력해 docs/posts/{postId}/0.0.0.mdx를 만듭니다.\n--local은 0.0.0.local.mdx를 만듭니다. ↑/↓로 선택하고 Ctrl+C로 취소합니다.\n비대화형: pnpm post:new post-id --title "글 제목" [--summary "요약"] [--tags "React,MDX"] [--series id --order 1] [--local]',
    );
    return;
  }
  if (positionals.length > 1) throw new Error('글 ID는 하나만 전달하세요.');
  const context = await writingContext();
  let postId = positionals[0];
  let title = values.title;
  let summary = values.summary ?? '';
  let tags = parseTags(values.tags ?? '');
  let series = values.series;
  let order = values.order ? Number(values.order) : undefined;
  if (!postId || title === undefined) {
    requireTerminal();
    intro('새 글 작성');
    postId = await answer(
      text({
        message: '글 ID (URL에 사용할 소문자 영문·숫자·하이픈)',
        initialValue: postId,
        validate: (value) =>
          postIdError(value ?? '') ?? (context.ids.has(value!) ? '이미 같은 ID의 글이 있습니다.' : undefined),
      }),
    );
    title = await answer(
      text({ message: '글 제목', validate: (value) => (value?.trim() ? undefined : '제목을 입력하세요.') }),
    );
    summary = await answer(
      text({ message: '글 요약 (선택)', defaultValue: summary, placeholder: '요약을 입력하세요.' }),
    );
    tags = parseTags(
      await answer(text({ message: '태그 (쉼표로 구분, 없으면 Enter)', defaultValue: values.tags ?? '' })),
    );
    series = await answer(
      select({
        message: '시리즈 선택',
        options: [
          { value: '', label: '시리즈 없음' },
          ...[...context.series.keys()].map((id) => ({ value: id, label: id })),
          { value: '__new__', label: '새 시리즈 ID 입력' },
        ],
      }),
    );
    if (series === '__new__')
      series = await answer(text({ message: '새 시리즈 ID', validate: (value) => postIdError(value ?? '') }));
    if (series) {
      const used = context.series.get(series) ?? new Set<number>();
      const next = Math.max(0, ...used) + 1;
      order = Number(
        await answer(
          text({
            message: '시리즈 정렬값 (order)',
            defaultValue: String(next),
            placeholder: String(next),
            validate: (value) => {
              const number = Number(value || next);
              return !Number.isSafeInteger(number) || number < 1
                ? '1 이상의 정수를 입력하세요.'
                : used.has(number)
                  ? '이미 사용 중인 정렬값입니다.'
                  : undefined;
            },
          }),
        ),
      );
    }
  }
  if (!postId || title === undefined) throw new Error('글 ID와 제목을 입력하세요.');
  if (series && order === undefined) throw new Error('--series에는 --order가 필요합니다.');
  if (!series && order !== undefined) throw new Error('--order에는 --series가 필요합니다.');
  const filename = await createPost({
    postId,
    title,
    summary,
    tags,
    ...(series ? { series: { id: series, order: order! } } : {}),
    local: values.local,
  });
  outro(
    `초안 생성: ${path.relative(process.cwd(), filename)}\n이 파일에서 본문을 작성하세요. 미리보기: http://localhost:3000/posts/${postId}`,
  );
});
