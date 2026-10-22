import { parseArgs } from 'node:util';
import { run } from './content/cli.ts';
import { validatePosts } from './content/validate-posts.ts';

await run(async () => {
  const { values } = parseArgs({ options: { help: { type: 'boolean', short: 'h' }, drafts: { type: 'boolean' } } });
  if (values.help) {
    console.log(
      '사용법: pnpm content:validate [--drafts]\n공개 글의 메타데이터·버전·MDX·이미지 참조와 Git HEAD의 공개 파일 보존을 검사합니다.\n--drafts는 글마다 현재 미리보기 초안도 검사합니다. 원고·이미지를 변경하지 않습니다.',
    );
    return;
  }
  const result = await validatePosts({ drafts: values.drafts });
  console.log(
    `콘텐츠 검증 완료: 공개 버전 ${result.published}개, 초안 ${result.drafts}개, Git HEAD 보존 파일 ${result.history}개`,
  );
});
