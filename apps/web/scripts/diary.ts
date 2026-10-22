import path from 'node:path';
import { parseArgs } from 'node:util';
import { intro, outro, select, text } from '@clack/prompts';
import { answer, requireTerminal, run } from './content/cli.ts';
import { docsRoot, parseTags, postIdError } from './content/source.ts';
import { createDiary, editDiary, publishDiary } from './content/diary-source.ts';
import { loadDiary } from '../entities/diary/api/load-diary.ts';
import { entryDateError } from '../entities/diary/model/diary.ts';

await run(async () => {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      title: { type: 'string' },
      summary: { type: 'string' },
      tags: { type: 'string' },
      'entry-date': { type: 'string' },
      'published-at': { type: 'string' },
      'dry-run': { type: 'boolean' },
      local: { type: 'boolean' },
    },
  });
  const [action, suppliedId] = positionals;
  if (values.help) {
    console.log(
      '사용법:\npnpm diary:new [entryId] --title "제목" --entry-date YYYY-MM-DD [--summary "요약"] [--tags "일상,기록"] [--local]\npnpm diary:edit [entryId]\npnpm diary:publish [entryId] --published-at "2026-10-22T15:00:00+09:00" [--dry-run]\n필수 인자를 생략하면 대화형으로 입력합니다. 기록 날짜의 연도에 따라 diary/{year}/{entryId}.mdx 하나를 직접 수정하며 시리즈·버전·히스토리를 만들지 않습니다.',
    );
    return;
  }
  if (!['new', 'edit', 'publish'].includes(action ?? '') || positionals.length > 2)
    throw new Error('diary:new, diary:edit, diary:publish 중 하나를 사용하세요.');
  const allowed =
    action === 'new'
      ? ['title', 'summary', 'tags', 'entry-date', 'local']
      : action === 'publish'
        ? ['published-at', 'dry-run']
        : [];
  for (const key of Object.keys(values))
    if (!allowed.includes(key)) throw new Error(`${action} 명령에서 지원하지 않는 옵션: --${key}`);
  let entryId = suppliedId;
  if (action === 'new') {
    let title = values.title;
    let entryDate = values['entry-date'];
    let summary = values.summary ?? '';
    let tags = values.tags ?? '';
    if (!entryId || title === undefined || !entryDate) {
      requireTerminal();
      intro('새 일기 작성');
      entryId ??= await answer(
        text({ message: '일기 ID (소문자 영문·숫자·하이픈)', validate: (value) => postIdError(value ?? '') }),
      );
      title ??= await answer(
        text({ message: '일기 제목', validate: (value) => (value?.trim() ? undefined : '제목을 입력하세요.') }),
      );
      entryDate ??= await answer(
        text({ message: '기록 날짜 (YYYY-MM-DD, 한국 시간)', validate: (value) => entryDateError(value ?? '') }),
      );
      summary = await answer(text({ message: '요약 (선택)', defaultValue: summary }));
      tags = await answer(text({ message: '태그 (쉼표 구분, 선택)', defaultValue: tags }));
    }
    const filename = await createDiary({
      entryId,
      title,
      entryDate,
      summary,
      tags: parseTags(tags),
      local: values.local,
    });
    outro(`초안 생성: ${path.relative(process.cwd(), filename)}\n미리보기: http://localhost:3000/diary/${entryId}`);
    return;
  }
  const documents = await loadDiary(docsRoot, { includeDrafts: true });
  if (!entryId) {
    requireTerminal();
    if (!documents.length) throw new Error('선택할 일기가 없습니다. diary:new로 작성하세요.');
    entryId = await answer(
      select({
        message: '일기 선택',
        options: documents.map(({ entry }) => ({ value: entry.id, label: entry.title, hint: entry.entryDate })),
      }),
    );
  }
  if (action === 'edit') {
    outro(`이 파일을 직접 수정하세요: ${path.relative(process.cwd(), await editDiary({ entryId }))}`);
    return;
  }
  const entry = documents.find(({ entry }) => entry.id === entryId)?.entry;
  let publishedAt = values['published-at'];
  if (!publishedAt && !entry?.publishedAt) {
    requireTerminal();
    publishedAt = await answer(
      text({ message: '최초 발행 시각 (시간대 포함)', initialValue: new Date().toISOString() }),
    );
  }
  const result = await publishDiary({ entryId, publishedAt, dryRun: values['dry-run'] });
  outro(
    `${result.dryRun ? '발행 계획 검증' : '공개 파일 준비'} 완료: ${path.relative(process.cwd(), result.filename)}\n발행 시각: ${result.publishedAt}\nGit 반영과 실제 배포는 별도로 진행하세요.`,
  );
});
