#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { build } from './instruction-model.mjs';
import { HOOK_FILES, HOOK_SOURCE } from './instruction-hooks.mjs';

const root = path.resolve(import.meta.dirname, '..');
const { outputs } = build(root);
const reminder = fs.readFileSync(path.join(root, HOOK_SOURCE), 'utf8').trim();
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'work-plan-benchmark-'));
const samples = 100;
const results = [];

try {
  for (const [tool, file] of Object.entries(HOOK_FILES)) {
    if (!outputs[file]) continue;
    const groups = JSON.parse(outputs[file].content).hooks.UserPromptSubmit;
    const handler = groups.flatMap((group) => group.hooks).find((hook) => hook.command.includes(HOOK_SOURCE));
    const times = [];
    for (let i = 0; i < samples + 5; i++) {
      const start = performance.now();
      const result = spawnSync('/bin/sh', ['-c', handler.command], {
        cwd: directory,
        env: { PATH: '' },
        input: '{"hook_event_name":"UserPromptSubmit","prompt":"benchmark"}',
        encoding: 'utf8',
        timeout: 2000,
      });
      const elapsed = performance.now() - start;
      assert.equal(result.status, 0, result.error?.message || result.stderr);
      assert.equal(JSON.parse(result.stdout).hookSpecificOutput.additionalContext, reminder);
      if (i >= 5) times.push(elapsed);
    }
    times.sort((a, b) => a - b);
    const skillPath = tool === 'codex' ? '.agents/skills/work-plan/SKILL.md' : '.claude/skills/work-plan/SKILL.md';
    const skillBytes = Buffer.byteLength(outputs[skillPath].content);
    const reminderBytes = Buffer.byteLength(reminder);
    results.push({
      tool,
      samples,
      reminderUtf8Bytes: reminderBytes,
      fullSkillUtf8Bytes: skillBytes,
      reductionVsFullSkillPercent: Number(((1 - reminderBytes / skillBytes) * 100).toFixed(1)),
      medianMs: Number(times[Math.floor(samples / 2)].toFixed(3)),
      p95Ms: Number(times[Math.ceil(samples * 0.95) - 1].toFixed(3)),
      maxMs: Number(times.at(-1).toFixed(3)),
    });
  }
  console.log(
    JSON.stringify(
      {
        scope: 'Local /bin/sh launch + generated command + captured output; not CLI dispatch or model latency.',
        tokens: 'UTF-8 bytes are not tokens. Use a named tokenizer separately; actual billed usage is unmeasured.',
        platform: `${process.platform}/${process.arch}`,
        node: process.version,
        results,
      },
      null,
      2,
    ),
  );
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
