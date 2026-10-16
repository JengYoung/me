import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import format from '../packages/ui/oxfmt.config.mts';
import lint from '../packages/ui/oxlint.config.mts';

const require = createRequire(new URL('../packages/ui/package.json', import.meta.url));
const command = (name) => join(dirname(require.resolve(`${name}/package.json`)), 'bin', name);

function fixture(t, config, filename) {
  const root = mkdtempSync(join(tmpdir(), 'code-quality-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (file, content) => {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), content);
  };
  write(filename, `${JSON.stringify(config, null, 2)}\n`);
  return {
    write,
    read: (file) => readFileSync(join(root, file), 'utf8'),
    run(name, args) {
      const result = spawnSync(process.execPath, [command(name), ...args], {
        cwd: root,
        encoding: 'utf8',
        timeout: 30_000,
      });
      assert.ifError(result.error);
      assert.equal(result.signal, null, result.stderr);
      return result;
    },
  };
}

test('Oxfmt skips Iris, generated files, dependencies and lockfiles while formatting application code', (t) => {
  const project = fixture(t, format, '.oxfmtrc.json');
  const excluded = {
    'src/base/example.ts': 'export const core={value:"preserve"}',
    '.next/generated.ts': 'export const generated={value:"preserve"}',
    'node_modules/example/index.ts': 'export const dependency={value:"preserve"}',
    'pnpm-lock.yaml': 'lockfileVersion:     "9.0"\n',
  };
  for (const [file, content] of Object.entries(excluded)) project.write(file, content);
  const outside = 'import z from "z";import a from "a";export const view=<div className="p-4 flex">{z}{a}</div>';
  project.write('src/index.tsx', outside);
  const before = project.run('oxfmt', ['--check', '.']);
  assert.equal(before.status, 1, before.stderr || before.stdout);
  assert.match(before.stdout + before.stderr, /src\/index\.tsx/);
  const formatted = project.run('oxfmt', ['--write', '.']);
  assert.equal(formatted.status, 0, formatted.stderr || formatted.stdout);
  for (const [file, content] of Object.entries(excluded)) assert.equal(project.read(file), content, file);
  const result = project.read('src/index.tsx');
  assert.notEqual(result, outside);
  assert.ok(result.indexOf("from 'z'") < result.indexOf("from 'a'"), 'import order must be preserved');
  assert.match(result, /className="p-4 flex"/);
  const checked = project.run('oxfmt', ['--check', '.']);
  assert.equal(checked.status, 0, checked.stderr || checked.stdout);
});

test('Oxlint still reports correctness failures inside and outside Iris core', (t) => {
  const project = fixture(t, lint, '.oxlintrc.json');
  project.write('src/base/example.ts', 'export const core = { value: 1, value: 2 };\n');
  project.write('src/example.ts', 'export const app = { value: 1, value: 2 };\n');
  const result = project.run('oxlint', ['--format=json', '--max-warnings', '0', '.']);
  assert.equal(result.status, 1, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.diagnostics.length, 2, result.stdout);
  for (const diagnostic of report.diagnostics) assert.match(JSON.stringify(diagnostic), /no-dupe-keys/);
  assert.match(result.stdout, /src\/base\/example\.ts/);
  assert.match(result.stdout, /src\/example\.ts/);
});
