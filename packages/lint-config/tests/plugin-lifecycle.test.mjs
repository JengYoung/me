import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const oxlint = resolve(dirname(require.resolve('oxlint/package.json')), 'bin/oxlint');

function fixture(t, files, packagePath = 'apps/web') {
  const workspace = mkdtempSync(join(tmpdir(), 'plugin-lifecycle-'));
  const project = join(workspace, packagePath);
  const config = new URL(`../../../${packagePath}/oxlint.config.mts`, import.meta.url).href;
  t.after(() => rmSync(workspace, { recursive: true, force: true }));
  mkdirSync(project, { recursive: true });
  writeFileSync(join(project, 'oxlint.config.mts'), `export { default } from ${JSON.stringify(config)};\n`);
  for (const [name, content] of Object.entries(files)) {
    const path = join(project, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  return {
    read: (name) => readFileSync(join(project, name), 'utf8'),
    lint(fromWorkspace = false, fix = false) {
      const args = fromWorkspace ? ['--config', `${packagePath}/oxlint.config.mts`, packagePath] : ['.'];
      const result = spawnSync(
        process.execPath,
        [oxlint, '--format=json', '--max-warnings', '0', ...(fix ? ['--fix'] : []), ...args],
        { cwd: fromWorkspace ? workspace : project, encoding: 'utf8', timeout: 30_000 },
      );
      assert.ifError(result.error);
      assert.equal(result.signal, null, result.stderr);
      assert.ok(result.stdout.trim(), result.stderr || 'Oxlint produced no JSON result');
      return { ...JSON.parse(result.stdout), status: result.status };
    },
  };
}

const twoEffects = (name) => `import { useEffect } from 'react';
  export function ${name}() {
    useEffect(() => () => {}, []);
    useEffect(() => () => {}, []);
    return null;
  }`;

test('실제 web 설정으로 기존 ScrollHeaderPlugin을 두 실행 위치에서 검사한다', (t) => {
  const files = {};
  for (const name of ['scroll-header-plugin.tsx', 'header-plugin.lib.ts', 'header-plugin.types.ts']) {
    files[`shared/ui/layout/${name}`] = readFileSync(
      new URL(`../../../apps/web/shared/ui/layout/${name}`, import.meta.url),
      'utf8',
    );
  }
  files['shared/ui/layout/other.tsx'] = twoEffects('Header') + twoEffects('Sidebar').replace(/^import[^;]+;/, '');
  const project = fixture(t, files);
  for (const fromWorkspace of [false, true]) {
    const result = project.lint(fromWorkspace);
    assert.equal(result.status, 0, JSON.stringify(result.diagnostics));
    assert.deepEqual(result.diagnostics, []);
    assert.ok(result.number_of_files >= 4, '헤더와 일반 컴포넌트 소스를 실제로 검사해야 합니다.');
  }
});

test('실제 CLI에서 위반을 error로 보고하고 파일별 effect 개수를 초기화한다', (t) => {
  const project = fixture(t, {
    'shared/ui/layout/missing-header-plugin.tsx': 'export function MissingHeaderPlugin() { return null; }',
    'shared/ui/layout/duplicate-header-plugin.tsx': twoEffects('DuplicateHeaderPlugin'),
    'shared/ui/layout/valid-header-plugin.tsx': `import { useEffect } from 'react';
      export function ValidHeaderPlugin() { useEffect(() => () => {}, []); return null; }`,
    'shared/ui/layout/header.tsx': twoEffects('Header'),
  });
  for (const fromWorkspace of [false, true]) {
    const result = project.lint(fromWorkspace);
    assert.equal(result.status, 1);
    assert.equal(result.diagnostics.length, 2, JSON.stringify(result.diagnostics));
    assert.ok(result.diagnostics.every((diagnostic) => diagnostic.severity === 'error'));
    const diagnostics = JSON.stringify(result.diagnostics);
    assert.match(diagnostics, /single-effect/);
    assert.match(diagnostics, /MissingHeaderPlugin.*현재 0개/);
    assert.match(diagnostics, /DuplicateHeaderPlugin.*현재 2개/);
  }
});

for (const packagePath of ['apps/web', 'apps/docs', 'packages/ui']) {
  test(`${packagePath}의 커스텀 *Plugin에 공통 적용하고 외부 Plugin은 검사하지 않는다`, (t) => {
    const project = fixture(
      t,
      {
        'src/custom-plugin.tsx': twoEffects('SidebarPlugin'),
        'src/ordinary.tsx': twoEffects('PluginProvider'),
        'src/imported.tsx': `import { memo } from 'react';
          import { ExternalPlugin } from 'external-package';
          export { ExternalPlugin };
          export const WrappedPlugin = memo(ExternalPlugin);`,
        'node_modules/external-package/index.tsx': twoEffects('ExternalPlugin'),
      },
      packagePath,
    );
    for (const fromWorkspace of [false, true]) {
      const result = project.lint(fromWorkspace);
      assert.equal(result.status, 1);
      assert.equal(result.diagnostics.length, 1, JSON.stringify(result.diagnostics));
      assert.match(result.diagnostics[0].message, /SidebarPlugin.*현재 2개/);
      assert.equal(result.diagnostics[0].severity, 'error');
      assert.ok(result.number_of_files >= 3, 'Plugin과 일반 컴포넌트 소스를 실제로 검사해야 합니다.');
    }
  });
}

test('Iris 코어는 Plugin 구조 규칙만 제외하고 correctness 검사는 유지한다', (t) => {
  const project = fixture(
    t,
    {
      'src/base/external.tsx': 'export function ExternalPlugin() { return null; }',
      'src/base/broken.ts': 'export const value = { key: 1, key: 2 };',
      'src/focus-plugin.tsx': 'export function FocusPlugin() { return null; }',
    },
    'packages/ui',
  );
  for (const fromWorkspace of [false, true]) {
    const result = project.lint(fromWorkspace);
    assert.equal(result.status, 1);
    assert.equal(result.diagnostics.length, 2, JSON.stringify(result.diagnostics));
    const diagnostics = JSON.stringify(result.diagnostics);
    assert.match(diagnostics, /FocusPlugin.*현재 0개/);
    assert.match(diagnostics, /no-dupe-keys/);
    assert.doesNotMatch(diagnostics, /ExternalPlugin/);
  }
});

test('cleanup 누락을 보고하며 --fix로 effect를 임의로 합치지 않는다', (t) => {
  const name = 'shared/ui/layout/scroll-header-plugin.tsx';
  const source = `import { useEffect } from 'react';
    export function ScrollHeaderPlugin() { useEffect(() => {}, []); return null; }`;
  const project = fixture(t, { [name]: source });
  const result = project.lint(false, true);
  assert.equal(result.status, 1);
  assert.equal(result.diagnostics.length, 1, JSON.stringify(result.diagnostics));
  assert.match(result.diagnostics[0].message, /cleanup을 반환/);
  assert.equal(project.read(name), source);
});
