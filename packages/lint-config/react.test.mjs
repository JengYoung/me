import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const oxlint = resolve(dirname(require.resolve('oxlint/package.json')), 'bin/oxlint');

function fixture(t, packagePath, files) {
  const workspace = mkdtempSync(join(tmpdir(), 'react-best-practices-'));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));
  const project = join(workspace, packagePath);
  const config = new URL(`../../${packagePath}/oxlint.config.mts`, import.meta.url).href;
  mkdirSync(project, { recursive: true });
  writeFileSync(join(project, 'oxlint.config.mts'), `export { default } from ${JSON.stringify(config)};\n`);
  for (const [filename, content] of Object.entries(files)) {
    const path = join(project, filename);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  return {
    lint(fromWorkspace = false) {
      const args = fromWorkspace ? ['--config', `${packagePath}/oxlint.config.mts`, packagePath] : ['.'];
      const result = spawnSync(process.execPath, [oxlint, '--format=json', ...args], {
        cwd: fromWorkspace ? workspace : project,
        encoding: 'utf8',
        timeout: 30_000,
      });
      assert.ifError(result.error);
      assert.equal(result.signal, null, result.stderr);
      assert.ok(result.stdout.trim(), result.stderr || 'Oxlint produced no JSON result');
      return { ...JSON.parse(result.stdout), status: result.status };
    },
  };
}

const invalidFiles = {
  'src/examples/default-props.tsx': `export function Defaults({ onClick = () => {} }: { onClick?: () => void }) {
    return <button onClick={onClick}>Run</button>;
  }`,
  'src/examples/dynamic-import.ts': 'export const load = (name: string) => import(name);',
  'src/examples/membership.ts': `const allowed = ['a', 'b', 'c'];
    export function select(ids: string[]) { return ids.filter(id => allowed.includes(id)); }`,
  'src/examples/sort.ts': 'export function sortIds(ids: string[]) { ids.sort(); return ids; }',
};

const validFiles = {
  'src/examples/default-props.tsx': `const NOOP = () => {};
    export function Stable({ onClick = NOOP, count = 0 }: { onClick?: () => void; count?: number }) {
      return <button onClick={onClick}>{count}</button>;
    }`,
  'src/examples/dynamic-import.ts': `const modules = { home: () => import('./target') };
    export const load = (name: keyof typeof modules) => modules[name]();`,
  'src/examples/target.ts': 'export const value = 1;',
  'src/examples/membership.ts': `const allowed = new Set(['a', 'b', 'c']);
    export function select(ids: string[]) { return ids.filter(id => allowed.has(id)); }
    const values = [1, 2, 3];
    export const hasTwo = values.includes(2);`,
  'src/examples/sort.ts': `export const copied = (ids: string[]) => [...ids].sort();
    export const immutable = (ids: string[]) => ids.toSorted();`,
};

for (const packagePath of ['apps/web', 'apps/docs', 'packages/ui']) {
  test(`${packagePath}에서 동적 경로는 error, 참조·조회·정렬 개선은 warning으로 검출한다`, (t) => {
    const project = fixture(t, packagePath, invalidFiles);
    for (const fromWorkspace of [false, true]) {
      const result = project.lint(fromWorkspace);
      const diagnostics = JSON.stringify(result.diagnostics);
      assert.equal(result.status, 1, diagnostics);
      assert.equal(result.diagnostics.length, 4, diagnostics);
      for (const rule of ['no-object-type-as-default-prop', 'prefer-set-has', 'no-array-sort']) {
        const matches = result.diagnostics.filter((diagnostic) => diagnostic.code?.endsWith(`(${rule})`));
        assert.equal(matches.length, 1, diagnostics);
        assert.equal(matches[0].severity, 'warning', diagnostics);
      }
      const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
      assert.equal(errors.length, 1, diagnostics);
      assert.match(errors[0].code, /no-dynamic-require/);
    }
  });

  test(`${packagePath}에서 안정된 기본값·리터럴 import·단발 조회·복사 후 정렬을 허용한다`, (t) => {
    const project = fixture(t, packagePath, validFiles);
    for (const fromWorkspace of [false, true]) {
      const result = project.lint(fromWorkspace);
      assert.equal(result.status, 0, JSON.stringify(result.diagnostics));
      assert.deepEqual(result.diagnostics, []);
      assert.ok(result.number_of_files >= Object.keys(validFiles).length, '허용 사례를 실제로 검사해야 합니다.');
    }
  });
}

test('Iris 코어는 새 성능·구조 규칙을 제외하고 correctness와 외부 UI 검사를 유지한다', (t) => {
  const coreFiles = Object.fromEntries(
    Object.entries(invalidFiles).map(([filename, content]) => [
      filename.replace('src/examples/', 'src/base/'),
      content,
    ]),
  );
  const project = fixture(t, 'packages/ui', {
    ...invalidFiles,
    ...coreFiles,
    'src/base/correctness.ts': 'export const value = { key: 1, key: 2 };',
  });
  for (const fromWorkspace of [false, true]) {
    const result = project.lint(fromWorkspace);
    const diagnostics = JSON.stringify(result.diagnostics);
    assert.equal(result.status, 1, diagnostics);
    assert.equal(result.diagnostics.length, 5, diagnostics);
    const core = result.diagnostics.filter((diagnostic) =>
      diagnostic.filename.replaceAll('\\', '/').includes('src/base/'),
    );
    assert.equal(core.length, 1, diagnostics);
    assert.match(core[0].code, /no-dupe-keys/);
    assert.equal(core[0].severity, 'error');
    for (const rule of ['no-object-type-as-default-prop', 'no-dynamic-require', 'prefer-set-has', 'no-array-sort']) {
      assert.equal(
        result.diagnostics.filter((diagnostic) => diagnostic.code?.endsWith(`(${rule})`)).length,
        1,
        diagnostics,
      );
    }
  }
});
