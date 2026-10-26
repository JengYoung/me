import { parseArgs } from 'node:util';
import { run } from './content/cli.ts';
import { validatePosts } from './content/validate-posts.ts';
import { validateDiary } from './content/validate-diary.ts';
import { validateSeries } from './content/series-source.ts';
import { docsRoot } from './content/post-source.ts';

await run(async () => {
  const { values } = parseArgs({ options: { help: { type: 'boolean', short: 'h' }, drafts: { type: 'boolean' } } });
  if (values.help) {
    console.log(
      '사용법: pnpm content:validate [--drafts]\n공개 포스트·일기의 메타데이터·MDX·이미지와 시리즈 제목·소개·대표 이미지를 검사합니다. 포스트만 버전과 Git HEAD 보존을 검사합니다.\n--drafts는 글마다 현재 미리보기 초안도 검사합니다. 원고·이미지는 변경하지 않으며 docs/series/series.json의 공개 집계만 갱신합니다.',
    );
    return;
  }
  const [result, diary, series] = await Promise.all([
    validatePosts({ drafts: values.drafts }),
    validateDiary({ drafts: values.drafts }),
    validateSeries(docsRoot),
  ]);
  console.log(
    `콘텐츠 검증 완료: 공개 버전 ${result.published}개, 초안 ${result.drafts}개, Git HEAD 보존 파일 ${result.history}개, 일기 ${diary.published}개, 일기 초안 ${diary.drafts}개, 시리즈 ${series}개`,
  );
});
