import { parse } from 'yaml';
import { isRecord } from '../validation/index.ts';

export function parseFrontmatter(source: string, filename: string): Record<string, unknown> {
  const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) throw new Error(`${filename}: frontmatter가 필요합니다.`);
  let data: unknown;
  try {
    data = parse(match[1]!);
  } catch (error) {
    throw new Error(`${filename}: ${error instanceof Error ? error.message : 'frontmatter를 읽을 수 없습니다.'}`);
  }
  if (!isRecord(data)) throw new Error(`${filename}: frontmatter는 객체여야 합니다.`);
  return data;
}
