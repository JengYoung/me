import { cancel, CANCEL_SYMBOL, isCancel, select } from '@clack/prompts';
import { writingContext } from './post-source.ts';

export function requireTerminal() {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error('대화형 터미널에서 실행하거나 --help의 필수 인자를 전달하세요.');
}

export async function answer<T>(prompt: Promise<T>): Promise<Exclude<T, typeof CANCEL_SYMBOL>> {
  const value = await prompt;
  if (isCancel(value)) throw value;
  return value as Exclude<T, typeof CANCEL_SYMBOL>;
}

export async function choosePost(postId?: string, draftsOnly = false): Promise<string> {
  if (postId) return postId;
  requireTerminal();
  const { entries } = await writingContext();
  const posts = entries.filter((entry) => !draftsOnly || entry.latest.post.isDraft);
  if (!posts.length) throw new Error('선택할 글이 없습니다. post:new로 초안을 작성하세요.');
  return answer(
    select({
      message: '글 선택 (↑/↓ 이동, Enter 선택)',
      options: posts.map(({ latest: { post } }) => ({ value: post.id, label: post.title, hint: post.id })),
    }),
  );
}

export async function run(main: () => Promise<void>) {
  try {
    await main();
  } catch (error) {
    if (isCancel(error)) {
      cancel('작업을 취소했습니다.');
      process.exitCode = 130;
    } else {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  }
}
