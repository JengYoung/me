import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { packageManager } = require('../../../package.json');
const oxlint = resolve(dirname(require.resolve('oxlint/package.json')), 'bin/oxlint');
const preset = new URL('../next.js', import.meta.url).href;

function fixture(t, files, options = {}) {
  const workspace = mkdtempSync(join(tmpdir(), 'next-fsd-'));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));
  const project = join(workspace, 'apps/web');
  const write = (filename, content) => {
    mkdirSync(dirname(filename), { recursive: true });
    writeFileSync(filename, content);
  };
  write(join(workspace, 'package.json'), JSON.stringify({ name: 'fixture', private: true, packageManager }));
  write(join(workspace, 'pnpm-workspace.yaml'), "packages:\n  - 'apps/*'\n");
  write(join(workspace, 'turbo.json'), JSON.stringify({ tasks: { lint: {} } }));
  write(join(project, 'package.json'), JSON.stringify({ name: 'fixture-web', private: true, type: 'module' }));
  write(
    join(project, 'oxlint.config.mts'),
    `import { createNextConfig } from ${JSON.stringify(preset)};\n` +
      `export default createNextConfig({ rootDir: import.meta.dirname, fsd: ${JSON.stringify(options)} });\n`,
  );
  for (const [filename, content] of Object.entries(files)) write(join(project, filename), content);
  return {
    lint(fromWorkspace = false) {
      const args = fromWorkspace ? ['--config', 'apps/web/oxlint.config.mts', 'apps/web'] : ['.'];
      const result = spawnSync(process.execPath, [oxlint, '--format=json', '--max-warnings', '0', ...args], {
        cwd: fromWorkspace ? workspace : project,
        encoding: 'utf8',
        timeout: 30_000,
      });
      assert.ifError(result.error);
      assert.equal(result.signal, null, result.stderr);
      assert.ok(result.stdout.trim(), result.stderr || 'Oxlint produced no JSON result');
      return { ...JSON.parse(result.stdout), status: result.status, stderr: result.stderr };
    },
  };
}

const validFiles = {
  'app/layout.tsx': "import './globals.css'; export default function Layout() { return <main />; }",
  'app/globals.css': '',
  'app/page.tsx': "export { Home as default } from '../src/screens/home';",
  'src/screens/home/index.ts': "export { Home } from './ui/home';",
  'src/screens/home/ui/home.tsx':
    "import { currentUser } from '@/features/auth'; export function Home() { return <main>{currentUser}</main>; }",
  'src/features/auth/index.ts': "export { currentUser } from './model/session';",
  'src/features/auth/model/session.ts': "export { user as currentUser } from '@/entities/user';",
  'src/entities/user/index.ts': "export { user } from './model/user';",
  'src/entities/user/model/user.ts': "export const user = 'Ada';",
  '.next/generated.ts': 'export const = ;',
  'next-env.d.ts': 'export const = ;',
};

test('loads the shared preset from both package and workspace cwd; ignores Next.js generated files', (t) => {
  const project = fixture(t, validFiles);
  for (const fromWorkspace of [false, true]) {
    const result = project.lint(fromWorkspace);
    assert.equal(result.status, 0, JSON.stringify(result.diagnostics));
    assert.deepEqual(result.diagnostics, []);
    assert.ok(result.number_of_files >= 9, 'application sources must actually be linted');
  }
});

test('reports all three FSD policies across multiple files, including root App Router imports', (t) => {
  const project = fixture(t, {
    ...validFiles,
    'src/entities/user/model/upward.ts': "export * from '@/features/auth';",
    'src/features/auth/model/deep.ts': "export * from '@/entities/user/model/user';",
    'src/features/auth/flat.ts': 'export const flat = true;',
    'app/page.tsx': "export { currentUser } from '../src/features/auth/model/session';",
    'tools/build.ts': "export * from '@/features/auth/model/session';",
  });
  const result = project.lint(true);
  assert.equal(result.status, 1);
  const messages = result.diagnostics.map((diagnostic) => diagnostic.message);
  assert.equal(messages.filter((message) => message.includes('cannot import upper layer')).length, 1);
  assert.equal(messages.filter((message) => message.includes('must use the public API')).length, 2);
  assert.equal(messages.filter((message) => message.includes('must live in a segment')).length, 1);
  assert.equal(messages.length, 4, JSON.stringify(result.diagnostics));
});

test('allows Shared segment entrypoints to re-export their child implementations', (t) => {
  const project = fixture(t, {
    'app/page.tsx': "export { Header as default } from '../shared/ui';",
    'shared/ui/index.ts': "export { Header } from './layout/header';",
    'shared/ui/layout/header.tsx': 'export function Header() { return <header />; }',
    'shared/lib/index.ts': "export { formatDate } from './date/format';",
    'shared/lib/date/format.ts': 'export const formatDate = (date: Date) => date.toISOString();',
  });
  for (const fromWorkspace of [false, true]) {
    const result = project.lint(fromWorkspace);
    assert.equal(result.status, 0, JSON.stringify(result.diagnostics));
    assert.deepEqual(result.diagnostics, []);
  }
});

test('still rejects Shared implementation access from consumers, sibling modules and non-entrypoints', (t) => {
  const project = fixture(t, {
    'shared/ui/index.ts': "export { Header } from './layout/header';",
    'shared/ui/layout/header.tsx': 'export function Header() { return <header />; }',
    'shared/ui/button/index.ts': "export { Header } from '../layout/header';",
    'shared/ui/registry.ts': "export { Header } from './layout/header';",
    'screens/home/ui/home.tsx': "export { Header } from '../../../shared/ui/layout/header';",
  });
  const result = project.lint(true);
  assert.equal(result.status, 1);
  assert.equal(result.diagnostics.length, 3, JSON.stringify(result.diagnostics));
  assert.ok(result.diagnostics.every((diagnostic) => diagnostic.message.includes("public API of 'shared/ui/layout'")));
});

test('allows public entrypoints in every Next.js FSD layer from both source roots', (t) => {
  const files = {};
  for (const root of ['', 'src/']) {
    for (const scope of [
      'entities/example',
      'features/example',
      'widgets/example',
      'screens/example',
      'shared/api',
      'shared/config',
      'app/providers',
    ]) {
      files[`${root}${scope}/index.ts`] = [
        "export { value } from './model/nested/value';",
        "export type { Value } from './model/types';",
        "export * from './ui/view';",
      ].join('\n');
      files[`${root}${scope}/model/nested/value.ts`] = 'export const value = 1;';
      files[`${root}${scope}/model/types.ts`] = 'export type Value = number;';
      files[`${root}${scope}/ui/view.ts`] = 'export const view = 1;';
    }
    files[`${root}app/index.ts`] = "export { value } from './providers/model/nested/value';";
  }
  const project = fixture(t, files);
  for (const fromWorkspace of [false, true]) {
    const result = project.lint(fromWorkspace);
    assert.equal(result.status, 0, JSON.stringify(result.diagnostics));
    assert.deepEqual(result.diagnostics, []);
    assert.ok(result.number_of_files >= Object.keys(files).length, 'all layer entrypoints must actually be linted');
  }
});

test('keeps slice isolation and rejects external implementation re-exports in every slice layer', (t) => {
  const layers = ['entities', 'features', 'widgets', 'screens'];
  const files = {};
  for (const layer of layers) {
    files[`${layer}/example/index.ts`] = "export { value } from './model/nested/value';";
    files[`${layer}/example/model/nested/value.ts`] = 'export const value = 1;';
    files[`${layer}/consumer/index.ts`] = "export { value } from '../example/model/nested/value';";
    files[`app/check-${layer}.ts`] = `export { value } from '../${layer}/example/model/nested/value';`;
    files[`app/use-${layer}.ts`] = `export { value } from '../${layer}/example';`;
  }
  const project = fixture(t, files);
  for (const fromWorkspace of [false, true]) {
    const result = project.lint(fromWorkspace);
    assert.equal(result.status, 1);
    const messages = result.diagnostics.map((diagnostic) => diagnostic.message);
    assert.equal(messages.length, layers.length * 3, JSON.stringify(result.diagnostics));
    for (const layer of layers) {
      assert.equal(messages.filter((message) => message.includes(`public API of '${layer}/example'`)).length, 2);
      assert.equal(
        messages.filter((message) => message.includes(`'${layer}/consumer' cannot import '${layer}/example'`)).length,
        1,
      );
    }
  }
});

test('runs native Next.js rules and the compatibility rule through Oxlint', (t) => {
  const project = fixture(t, {
    'app/page.tsx': 'export default function Page() { return <script src="/script.js" />; }',
    'src/shared/lib/navigation/index.ts': "export const navigate = () => window.location.assign('/profile');",
  });
  const result = project.lint();
  assert.equal(result.status, 1);
  const diagnostics = JSON.stringify(result.diagnostics);
  assert.match(diagnostics, /no-sync-scripts/);
  assert.match(diagnostics, /no-location-assign-relative-destination/);
});

test('keeps App Router conventions while checking FSD imports and custom source roots', (t) => {
  const project = fixture(
    t,
    {
      'src/app/page.tsx': "import './globals.css'; export * from '@/features/auth/model/session';",
      'src/app/globals.css': '',
      'src/features/auth/model/session.ts': 'export const currentUser = 1;',
    },
    { roots: ['src'] },
  );
  const result = project.lint(true);
  assert.equal(result.status, 1);
  assert.equal(result.diagnostics.length, 1, JSON.stringify(result.diagnostics));
  assert.match(result.diagnostics[0].message, /must use the public API/);
});

test('preserves Turborepo environment variable validation', (t) => {
  const project = fixture(t, {
    'src/shared/config/env.ts': 'export const endpoint = process.env.FSD_TEST_UNDECLARED_ENDPOINT;',
  });
  const result = project.lint();
  assert.equal(result.status, 1);
  assert.match(JSON.stringify(result.diagnostics), /no-undeclared-env-vars/);
});
