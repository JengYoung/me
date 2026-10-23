import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importPath, writeGeneratedFiles } from './content/generated-files.ts';
import { seriesImagePath, synchronizeSeries, validateSeriesText } from './content/series-source.ts';

const appRoot = fileURLToPath(new URL('../', import.meta.url));

export async function generateSeries({
  contentRoot = path.join(appRoot, 'docs'),
  outputRoot = path.join(appRoot, 'entities/series/generated'),
  includeDrafts = false,
} = {}) {
  if (includeDrafts && process.env.NODE_ENV === 'production')
    throw new Error('시리즈 초안은 개발 환경에서만 읽습니다.');
  const { series, definitions, filename } = await synchronizeSeries(contentRoot, includeDrafts);
  if (!includeDrafts) validateSeriesText(series, filename);
  const imports: string[] = [];
  const entries = await Promise.all(
    series.map(async (item, index) => {
      const image = await seriesImagePath(
        contentRoot,
        definitions.find((entry) => entry.id === item.id)!,
        includeDrafts,
      );
      if (image)
        imports[index] =
          `import image${index} from ${JSON.stringify(importPath(path.join(outputRoot, 'catalog.generated.ts'), image))};`;
      return `{ ...${JSON.stringify(item)}${image ? `, thumbnail: image${index}` : ''} }`;
    }),
  );
  await writeGeneratedFiles(
    outputRoot,
    new Map([
      [
        'catalog.generated.ts',
        `// generate-series.ts가 생성합니다. 직접 수정하지 마세요.\nimport type { Series } from '../model/series';\n${imports.filter(Boolean).join('\n')}\nexport const series: readonly Series[] = [${entries.join(',\n')}];\n`,
      ],
    ]),
  );
  return { series: series.length };
}
