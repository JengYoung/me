import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

export function importPath(from: string, target: string) {
  const relative = path.relative(path.dirname(from), target).split(path.sep).join('/');
  return relative.startsWith('.') ? relative : `./${relative}`;
}

/** 생성기가 소유한 파일만 교체·정리한다. 원고와 자산은 변경하지 않는다. */
export async function writeGeneratedFiles(outputRoot: string, files: ReadonlyMap<string, string>) {
  await mkdir(outputRoot, { recursive: true });
  const previous = await readdir(outputRoot, { recursive: true });
  for (const [name, source] of files) {
    const filename = path.join(outputRoot, name);
    await mkdir(path.dirname(filename), { recursive: true });
    const old = await readFile(filename, 'utf8').catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
      return undefined;
    });
    if (old !== source) await writeFile(filename, source);
  }
  for (const filename of previous) {
    if (/\.generated\.tsx?$/.test(filename) && !files.has(filename.split(path.sep).join('/'))) {
      await unlink(path.join(outputRoot, filename));
    }
  }
}
