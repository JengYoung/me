#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MANIFEST,
  REGISTRY,
  MARKER,
  SCRIPT,
  build,
  hash,
  json,
  hasMarker,
  relativePath,
  skillRoots,
  projectPaths,
} from './instruction-model.mjs';
import {
  HOOK_SOURCE,
  HOOK_FILES,
  isHookFile,
  managedContent,
  hasManagedHook,
  removeManagedHook,
} from './instruction-hooks.mjs';

export { build } from './instruction-model.mjs';

function readPrevious(disk) {
  const text = disk.read(MANIFEST);
  if (text === null) return { version: 1, outputs: {} };
  const manifest = JSON.parse(text);
  if (
    ![1, 2].includes(manifest.version) ||
    !manifest.outputs ||
    Array.isArray(manifest.outputs) ||
    typeof manifest.outputs !== 'object'
  )
    throw new Error(`${MANIFEST}: 잘못된 매니페스트`);
  for (const [file, record] of Object.entries(manifest.outputs)) {
    relativePath(file);
    if (!record || typeof record !== 'object') throw new Error(`${MANIFEST}: 잘못된 생성 기록 ${file}`);
    relativePath(record.source);
    if (isHookFile(file)) {
      if (record.source !== HOOK_SOURCE) throw new Error(`${MANIFEST}: 허용하지 않는 hook 원천 ${file}`);
    } else if (
      file !== REGISTRY &&
      (file.startsWith('.agent-source/') ||
        file.startsWith('scripts/') ||
        file.startsWith('.git/') ||
        (!file.endsWith('.md') && !file.endsWith('/agents/openai.yaml')))
    )
      throw new Error(`${MANIFEST}: 허용하지 않는 생성 경로 ${file}`);
    if (
      !/^[a-f0-9]{64}$/.test(record.sha256) ||
      !record.source.startsWith('.agent-source/') ||
      !record.source.endsWith('/source.md')
    )
      throw new Error(`${MANIFEST}: 잘못된 생성 기록 ${file}`);
  }
  return manifest;
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}`;
  let descriptor;
  let created = false;
  try {
    descriptor = fs.openSync(temporary, 'wx');
    created = true;
    fs.writeFileSync(descriptor, content);
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.renameSync(temporary, file);
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (created && fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

function pruneEmptyParents(file, root) {
  let directory = path.dirname(file);
  while (directory !== root) {
    try {
      fs.rmdirSync(directory);
    } catch (error) {
      if (['ENOTEMPTY', 'EEXIST', 'ENOENT'].includes(error.code)) return;
      throw error;
    }
    directory = path.dirname(directory);
  }
}

export function sync(root, mode = 'check') {
  if (!['check', 'write'].includes(mode)) throw new Error(`알 수 없는 모드: ${mode}`);
  const { disk, targets, outputs, manifest } = build(root);
  const previous = readPrevious(disk);
  const errors = [];
  const changes = [];
  const blocked = [];
  for (const [file, value] of Object.entries(outputs)) {
    const actual = disk.read(file);
    if (actual !== null && managedContent(file, actual) === managedContent(file, value.content)) continue;
    changes.push({ file, content: value.content, action: actual === null ? 'create' : 'update' });
    const canAddHook = isHookFile(file) && !previous.outputs[file] && !hasManagedHook(file, actual);
    if (
      actual !== null &&
      !canAddHook &&
      (!previous.outputs[file] ||
        hash(managedContent(file, actual)) !== previous.outputs[file].sha256 ||
        !hasMarker(actual, previous.outputs[file].source))
    )
      blocked.push(`${file}: 관리되지 않은 파일 또는 수동 변경을 보존해야 합니다.`);
    errors.push(`${file}: ${actual === null ? '생성물 누락' : '원천과 내용 불일치'}`);
  }
  for (const [file, record] of Object.entries(previous.outputs)) {
    if (Object.hasOwn(outputs, file)) continue;
    const actual = disk.read(file);
    if (actual === null) continue;
    const remaining = isHookFile(file) ? removeManagedHook(file, actual) : null;
    changes.push(remaining === null ? { file, action: 'delete' } : { file, content: remaining, action: 'update' });
    if (hash(managedContent(file, actual)) !== record.sha256 || !hasMarker(actual, record.source))
      blocked.push(`${file}: 삭제 대상의 수동 변경을 보존해야 합니다.`);
    errors.push(`${file}: 더 이상 사용하지 않는 생성물`);
  }
  const discovered = new Set([
    REGISTRY,
    ...Object.values(HOOK_FILES),
    ...targets.flatMap(projectPaths),
    ...targets.flatMap((target) => skillRoots(target).flatMap((directory) => disk.files(directory))),
  ]);
  for (const file of discovered) {
    if (Object.hasOwn(outputs, file) || Object.hasOwn(previous.outputs, file)) continue;
    if (disk.read(file)?.includes(MARKER)) blocked.push(`${file}: 매니페스트에 없는 생성물이 있습니다.`);
  }
  const nextManifest = json(manifest);
  if (disk.read(MANIFEST) !== nextManifest) errors.push(`${MANIFEST}: 입력 또는 생성물 기록 불일치`);
  if (mode === 'check')
    return { ok: errors.length === 0 && blocked.length === 0, errors: [...errors, ...blocked], changes: [] };
  if (blocked.length) return { ok: false, errors: blocked, changes: [] };

  const applied = [];
  const writeErrors = [];
  for (const change of changes) {
    try {
      const destination = disk.resolve(change.file);
      if (change.action === 'delete') {
        fs.unlinkSync(destination);
        pruneEmptyParents(destination, disk.root);
      } else {
        writeFile(destination, change.content);
      }
      applied.push(`${change.action}: ${change.file}`);
    } catch (error) {
      writeErrors.push(`${change.file}: ${error.code ?? error.message}`);
    }
  }
  if (writeErrors.length) return { ok: false, errors: writeErrors, changes: applied };
  if (disk.read(MANIFEST) !== nextManifest) {
    writeFile(disk.resolve(MANIFEST), nextManifest);
    applied.push(`update: ${MANIFEST}`);
  }
  const checked = sync(root, 'check');
  return { ...checked, changes: applied };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log(`Usage: node ${SCRIPT} [--check | --write]\n기본값은 읽기 전용 검사입니다.`);
    return;
  }
  if (args.length > 1 || (args.length && !['--check', '--write'].includes(args[0])))
    throw new Error('--check 또는 --write 중 하나만 지정하세요.');
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const result = sync(root, args[0] === '--write' ? 'write' : 'check');
  for (const change of result.changes) console.log(change);
  if (!result.ok) {
    for (const error of result.errors) console.error(`ERROR: ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`AI instructions ${args[0] === '--write' ? 'synced' : 'checked'}: OK`);
  }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  }
}
