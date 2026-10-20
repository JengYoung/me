import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { build } from './instruction-model.mjs';
import { HOOK_FILES, renderWorkPlanHook } from './instruction-hooks.mjs';

const root = path.resolve(import.meta.dirname, '..');

for (const [tool, file] of Object.entries(HOOK_FILES)) {
  test(`${tool} hook emits the reminder without reading files, using PATH, or echoing the prompt`, (t) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'work plan '));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const config = JSON.parse(build(root).outputs[file].content);
    const group = config.hooks.UserPromptSubmit.find((entry) =>
      entry.hooks.some((hook) => hook.command.includes('AUTO-GENERATED from .agent-source/hooks/work-plan/')),
    );
    const result = spawnSync('/bin/sh', ['-c', group.hooks[0].command], {
      cwd: directory,
      env: { PATH: '' },
      input: JSON.stringify({
        hook_event_name: 'UserPromptSubmit',
        prompt: 'private prompt: $(touch should-not-exist)',
        session_id: 'test-session',
        cwd: directory,
      }),
      encoding: 'utf8',
      timeout: 2000,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    assert.deepEqual(JSON.parse(result.stdout), {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: fs.readFileSync(path.join(root, '.agent-source/hooks/work-plan/source.md'), 'utf8').trim(),
      },
    });
    assert.deepEqual(fs.readdirSync(directory), []);
  });
}

test('quotes and shell syntax in the reminder are returned as data', () => {
  const adapter = fs.readFileSync(path.join(root, '.agent-source/adapters/codex/work-plan-hook.json'), 'utf8');
  const reminder = "Don't execute $(printf injected) or `printf injected`; return $HOME and \\ literally.\n새 줄";
  const config = renderWorkPlanHook(adapter, reminder, '# generated');
  const result = spawnSync('/bin/sh', ['-c', config.hooks.UserPromptSubmit[0].hooks[0].command], {
    env: { PATH: '' },
    encoding: 'utf8',
    timeout: 2000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).hookSpecificOutput.additionalContext, reminder);
});

test('oversized reminders and hooks that run on every tool call are rejected', () => {
  const adapter = fs.readFileSync(path.join(root, '.agent-source/adapters/codex/work-plan-hook.json'), 'utf8');
  assert.throws(() => renderWorkPlanHook(adapter, '한'.repeat(257), '# generated'), /768/);
  assert.throws(() => renderWorkPlanHook(adapter, ' ', '# generated'), /비어 있지/);
  assert.throws(
    () => renderWorkPlanHook(adapter.replace('UserPromptSubmit', 'PreToolUse'), 'plan', '# generated'),
    /UserPromptSubmit/,
  );
  assert.throws(
    () => renderWorkPlanHook(adapter.replace('"timeout": 2', '"timeout": 600'), 'plan', '# generated'),
    /timeout/,
  );
});
