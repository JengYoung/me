import { parseArgs } from 'node:util';
import { select, text } from '@clack/prompts';
import { answer, choosePost, requireTerminal, run } from './content/cli.ts';
import { writingContext } from './content/post-source.ts';
import { publishPost } from './content/publish-post.ts';
import type { Bump } from './content/publish-post.ts';

await run(async () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      bump: { type: 'string' },
      reason: { type: 'string' },
      from: { type: 'string' },
      'published-at': { type: 'string' },
      'dry-run': { type: 'boolean' },
    },
  });
  if (values.help) {
    console.log(
      '사용법: pnpm post:publish [postId] [--bump major|minor|patch] [--reason "변경 이유"] [--from 0.0.0.local.md] [--dry-run]\n최초 발행은 1.0.0, 수정은 X(major: 환경 변화) / Y(minor: 사실 수정) / Z(patch: 표현 수정)를 선택합니다.\n발행 시각을 대화형으로 확인합니다. 비대화형은 --published-at "2026-10-22T15:00:00+09:00"을 전달하세요.\n새 공개 MDX와 변경된 이미지만 준비하며, 원본 초안·기존 공개 파일을 보존합니다. 자동 커밋·배포는 하지 않습니다.',
    );
    return;
  }
  if (positionals.length > 1) throw new Error('글 ID는 하나만 전달하세요.');
  if (values.bump && !['major', 'minor', 'patch'].includes(values.bump))
    throw new Error('--bump는 major|minor|patch 중 하나입니다.');
  const postId = await choosePost(positionals[0], true);
  const entry = (await writingContext()).entries.find((entry) => entry.latest.post.id === postId);
  if (!entry?.latest.post.isDraft) throw new Error('발행할 초안이 없습니다.');
  let bump = values.bump as Bump | undefined;
  if (entry.releases.length && !bump) {
    requireTerminal();
    bump = await answer(
      select({
        message: '이번 변경의 의미',
        options: [
          { value: 'major' as const, label: 'X · 환경 변화 — 이전 버전과 구별해서 읽어야 함' },
          { value: 'minor' as const, label: 'Y · 사실 수정 — 같은 환경의 잘못된 내용 수정' },
          { value: 'patch' as const, label: 'Z · 표현 수정 — 오탈자·틀리지 않은 문장 변경' },
        ],
      }),
    );
  }
  let publishedAt = values['published-at'];
  let reason = values.reason;
  if (!publishedAt) {
    requireTerminal();
    const now = new Date().toISOString();
    publishedAt = await answer(
      text({ message: '이번 버전의 발행 시각 (시간대 포함, Enter는 현재 시각)', defaultValue: now, placeholder: now }),
    );
    if (reason === undefined) {
      const entered = await answer(text({ message: '변경 이유 (선택, 없으면 Enter)', defaultValue: '' }));
      if (entered) reason = entered;
    }
  }
  const result = await publishPost({ postId, bump, publishedAt, reason, from: values.from, dryRun: values['dry-run'] });
  console.log(
    `${result.dryRun ? '검증 완료 — 파일을 만들지 않았습니다' : '공개 파일 준비 완료'}: ${postId} ${result.previous ?? '최초'} → ${result.version}`,
  );
  console.log(`초안: ${result.sourcePath}\n공개 MDX: ${result.filename}\n발행 시각: ${result.publishedAt}`);
  if (result.reason !== undefined) console.log(`변경 이유: ${result.reason}`);
  console.log(
    `추가 이미지: ${result.added.join(', ') || '없음'}\n재사용 이미지: ${result.reused.join(', ') || '없음'}`,
  );
  console.log('초안과 기존 공개 파일은 보존했습니다. 결과를 검토한 뒤 커밋·배포하세요.');
});
