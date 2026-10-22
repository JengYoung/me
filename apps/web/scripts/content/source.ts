import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';

export const docsRoot = fileURLToPath(new URL('../../docs', import.meta.url));

export function postIdError(id: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) ? undefined : '글 ID는 소문자 영문·숫자·하이픈으로 입력하세요.';
}

export function parseTags(value: string) {
  return [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

export function updateFrontmatter(source: string, changes: Record<string, unknown>) {
  const match = /^(\uFEFF?---\r?\n)([\s\S]*?)(\r?\n---(?:\r?\n|$))/.exec(source);
  if (!match) throw new Error('frontmatter가 필요합니다.');
  const document = parseDocument(match[2]!);
  if (document.errors.length) throw new Error(document.errors[0]!.message);
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) document.delete(key);
    else document.set(key, value);
  }
  return `---\n${document.toString({ lineWidth: 0 })}---\n${source.slice(match[0].length)}`;
}
