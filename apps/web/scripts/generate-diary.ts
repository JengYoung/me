import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDiary } from '../entities/diary/api/load-diary.ts';
import { importPath, writeGeneratedFiles } from './content/generated-files.ts';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const header = '// generate-diary.ts가 생성합니다. 직접 수정하지 마세요.\n';

export async function generateDiary({
  contentRoot = path.join(appRoot, 'docs'),
  outputRoot = path.join(appRoot, 'screens/diary/generated'),
  includeDrafts = false,
} = {}) {
  if (includeDrafts && process.env.NODE_ENV === 'production')
    throw new Error('초안 미리보기는 개발 서버에서만 실행할 수 있습니다.');
  const documents = await loadDiary(contentRoot, { includeDrafts });
  const imports = documents.map(
    ({ sourcePath }, index) =>
      `import Content${index} from ${JSON.stringify(importPath(path.join(outputRoot, 'current.generated.ts'), sourcePath))};`,
  );
  const entries = documents.map(
    ({ entry }, index) =>
      `[${JSON.stringify(entry.id)}, { entry: ${JSON.stringify(entry)}, Content: Content${index} }]`,
  );
  await writeGeneratedFiles(
    outputRoot,
    new Map([
      [
        'catalog.generated.ts',
        `${header}import type { DiaryEntry } from '../../../entities/diary';\nexport const diary: readonly DiaryEntry[] = ${JSON.stringify(documents.map(({ entry }) => entry))};\n`,
      ],
      [
        'current.generated.ts',
        `${header}import type { CurrentDiaryEntry } from '../model/current-diary-entry';\n${imports.join('\n')}\nexport const currentDiary = new Map<string, CurrentDiaryEntry>([${entries.join(',\n')}]);\n`,
      ],
    ]),
  );
  return { entries: documents.length, drafts: documents.filter(({ entry }) => entry.isDraft).length };
}
