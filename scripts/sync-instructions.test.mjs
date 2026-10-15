import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { build, sync } from "./sync-instructions.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const codexSkill = ".agents/skills/sync-instructions/SKILL.md";
const codexMetadata = ".agents/skills/sync-instructions/agents/openai.yaml";
const claudeSkill = ".claude/skills/sync-instructions/SKILL.md";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "instruction-sync-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const relative of [".agent-source/project", ".agent-source/skills", ".agent-source/adapters", ".agent-source/targets.json", "scripts/sync-instructions.mjs", "scripts/instruction-model.mjs", "scripts/check-instruction-runtime.mjs"]) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.cpSync(path.join(projectRoot, relative), path.join(root, relative), { recursive: true });
  }
  return root;
}

function read(root, relative) { return fs.readFileSync(path.join(root, relative), "utf8"); }
function write(root, relative, value) {
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.writeFileSync(path.join(root, relative), value);
}
function snapshot(root, relative = "") {
  return Object.fromEntries(fs.readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(relative, entry.name);
    return entry.isDirectory() ? Object.entries(snapshot(root, file)) : [[file, { content: read(root, file), modified: fs.statSync(path.join(root, file), { bigint: true }).mtimeNs }]];
  }));
}

test("creates both native entrypoints and skills without Git; repeated writes are stable", (t) => {
  const root = fixture(t);
  assert.equal(sync(root, "write").ok, true);
  for (const file of ["AGENTS.md", "CLAUDE.md", ".codex/instructions.md", ".claude/rules/instruction-maintenance.md", codexSkill, codexMetadata, claudeSkill, ".agent-source/registry.md"]) assert.ok(fs.existsSync(path.join(root, file)), file);
  assert.ok(!fs.existsSync(path.join(root, ".codex/skills/sync-instructions/SKILL.md")));
  assert.notEqual(read(root, codexSkill), read(root, claudeSkill));
  const before = snapshot(root);
  assert.deepEqual(sync(root, "write").changes, []);
  assert.equal(sync(root).ok, true);
  assert.deepEqual(snapshot(root), before);
});

test("check reports missing outputs and content drift without touching files", (t) => {
  const root = fixture(t);
  const initial = snapshot(root);
  assert.equal(sync(root).ok, false);
  assert.deepEqual(snapshot(root), initial);
  assert.equal(sync(root, "write").ok, true);
  write(root, "CLAUDE.md", `${read(root, "CLAUDE.md")}\n수동 변경\n`);
  const before = snapshot(root);
  const result = sync(root);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.startsWith("CLAUDE.md:")));
  assert.deepEqual(snapshot(root), before);
});

test("source changes reach both tools and references are copied independently", (t) => {
  const root = fixture(t);
  sync(root, "write");
  write(root, ".agent-source/project/source.md", `${read(root, ".agent-source/project/source.md")}\n추가 프로젝트 계약.\n`);
  write(root, ".agent-source/skills/sync-instructions/source.md", `${read(root, ".agent-source/skills/sync-instructions/source.md")}\n추가 스킬 계약.\n`);
  write(root, ".agent-source/skills/sync-instructions/references/detail.md", "# 참고\n\n보조 자료.\n");
  assert.equal(sync(root).ok, false);
  assert.equal(sync(root, "write").ok, true);
  for (const file of ["AGENTS.md", "CLAUDE.md"]) assert.ok(read(root, file).includes("추가 프로젝트 계약."));
  for (const file of [codexSkill, claudeSkill]) {
    assert.ok(read(root, file).includes("추가 스킬 계약."));
    assert.ok(read(root, file.replace("SKILL.md", "references/detail.md")).includes("보조 자료."));
  }
});

test("runtime holds reach both instructions and skills and only source changes release them", (t) => {
  const root = fixture(t);
  const config = JSON.parse(read(root, ".agent-source/targets.json"));
  const target = config.targets.find((item) => item.name === "claude");
  target.runtime = { status: "deferred", reason: "로그인 만료 = 잠정 보류" };
  write(root, ".agent-source/targets.json", JSON.stringify(config));
  assert.equal(sync(root, "write").ok, true);
  for (const file of ["AGENTS.md", "CLAUDE.md", codexSkill, claudeSkill]) assert.ok(read(root, file).includes("로그인 만료 = 잠정 보류"), file);
  assert.equal(sync(root).ok, true);
  target.runtime = { status: "enabled" };
  write(root, ".agent-source/targets.json", JSON.stringify(config));
  assert.equal(sync(root).ok, false);
  assert.equal(sync(root, "write").ok, true);
  for (const file of ["AGENTS.md", "CLAUDE.md", codexSkill, claudeSkill]) assert.ok(!read(root, file).includes("로그인 만료 = 잠정 보류"), file);
});

test("malformed runtime policies stop before any writes", (t) => {
  const root = fixture(t);
  const config = JSON.parse(read(root, ".agent-source/targets.json"));
  for (const runtime of [{ status: "paused" }, { status: "deferred" }, { status: "deferred", reason: "\n" }, { status: "enabled", reason: "보류" }, { status: "deferred", reason: "보류", retry: true }]) {
    config.targets[1].runtime = runtime;
    write(root, ".agent-source/targets.json", JSON.stringify(config));
    const before = snapshot(root);
    assert.throws(() => sync(root, "write"), /runtime|보류|지원하지 않는 필드/);
    assert.deepEqual(snapshot(root), before);
  }
});

test("runtime checker never starts deferred CLIs, even when explicitly selected", (t) => {
  const root = fixture(t);
  const config = JSON.parse(read(root, ".agent-source/targets.json"));
  for (const target of config.targets) target.runtime = { status: "deferred", reason: "테스트 보류" };
  write(root, ".agent-source/targets.json", JSON.stringify(config));
  const guard = path.join(root, "reject-processes.mjs");
  write(root, "reject-processes.mjs", 'import child from "node:child_process";\nimport { syncBuiltinESMExports } from "node:module";\nfor (const name of ["spawn", "spawnSync"]) child[name] = () => { throw new Error("CLI 실행을 시도했습니다"); };\nsyncBuiltinESMExports();\n');
  const before = snapshot(root);
  for (const args of [[], ["--claude"], ["--codex"]]) {
    const result = spawnSync(process.execPath, ["--import", guard, path.join(root, "scripts/check-instruction-runtime.mjs"), ...args], { cwd: os.tmpdir(), encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const checks = JSON.parse(result.stdout).checks;
    assert.equal(checks.length, args.length ? 1 : 2);
    for (const check of checks) assert.equal(check.status, "deferred");
    if (args.length) assert.equal(checks[0].tool, args[0].slice(2));
  }
  assert.deepEqual(snapshot(root), before);
});

test("manual changes block the entire write plan and remain intact", (t) => {
  const root = fixture(t);
  sync(root, "write");
  write(root, "CLAUDE.md", "사용자가 직접 작성한 내용\n");
  write(root, ".agent-source/project/source.md", `${read(root, ".agent-source/project/source.md")}\n새 원칙\n`);
  const before = snapshot(root);
  assert.equal(sync(root, "write").ok, false);
  assert.deepEqual(snapshot(root), before);
});

test("unmanaged entrypoints are preserved on first generation", (t) => {
  const root = fixture(t);
  write(root, "AGENTS.md", "기존 지침\n");
  const before = snapshot(root);
  assert.equal(sync(root, "write").ok, false);
  assert.deepEqual(snapshot(root), before);
});

test("a partial initial installation can finish without replacing completed files", (t) => {
  const root = fixture(t);
  sync(root, "write");
  fs.rmSync(path.join(root, ".agent-source/.manifest.json"));
  fs.rmSync(path.join(root, codexSkill));
  const completed = read(root, "AGENTS.md");
  const modified = fs.statSync(path.join(root, "AGENTS.md"), { bigint: true }).mtimeNs;
  assert.equal(sync(root).ok, false);
  const result = sync(root, "write");
  assert.equal(result.ok, true);
  assert.equal(read(root, "AGENTS.md"), completed);
  assert.equal(fs.statSync(path.join(root, "AGENTS.md"), { bigint: true }).mtimeNs, modified);
  assert.equal(fs.existsSync(path.join(root, codexSkill)), true);
});

test("only unchanged managed files are removed when a skill is deleted", (t) => {
  const root = fixture(t);
  sync(root, "write");
  write(root, ".claude/skills/custom/SKILL.md", "개별 스킬\n");
  fs.rmSync(path.join(root, ".agent-source/skills/sync-instructions"), { recursive: true });
  assert.equal(sync(root, "write").ok, true);
  assert.equal(fs.existsSync(path.join(root, codexSkill)), false);
  assert.equal(fs.existsSync(path.join(root, codexMetadata)), false);
  assert.equal(fs.existsSync(path.join(root, claudeSkill)), false);
  assert.equal(read(root, ".claude/skills/custom/SKILL.md"), "개별 스킬\n");
});

test("removed skills with manual changes are preserved", (t) => {
  const root = fixture(t);
  sync(root, "write");
  write(root, codexSkill, `${read(root, codexSkill)}\n보존할 내용\n`);
  fs.rmSync(path.join(root, ".agent-source/skills/sync-instructions"), { recursive: true });
  const before = snapshot(root);
  assert.equal(sync(root, "write").ok, false);
  assert.deepEqual(snapshot(root), before);
});

test("native metadata manual changes are preserved", (t) => {
  const root = fixture(t);
  sync(root, "write");
  write(root, codexMetadata, `${read(root, codexMetadata)}\n수동 수정\n`);
  const before = snapshot(root);
  assert.equal(sync(root).ok, false);
  assert.equal(sync(root, "write").ok, false);
  assert.deepEqual(snapshot(root), before);
});

test("native paths and overlapping destinations are rejected", (t) => {
  const root = fixture(t);
  const config = JSON.parse(read(root, ".agent-source/targets.json"));
  config.targets[0].skillRoot = ".claude/skills";
  write(root, ".agent-source/targets.json", JSON.stringify(config));
  assert.throws(() => build(root), /공식 발견 경로/);
  config.targets[0].skillRoot = ".agents/skills";
  config.targets[0].documents.push(config.targets[0].documents[0]);
  write(root, ".agent-source/targets.json", JSON.stringify(config));
  assert.throws(() => build(root), /겹치는 대상 경로/);
});

test("empty required sections stop generation before writing outputs", (t) => {
  const root = fixture(t);
  const file = ".agent-source/skills/sync-instructions/source.md";
  write(root, file, read(root, file).replace(/## 입력\n[\s\S]*?(?=## 절차)/, "## 입력\n\n"));
  const before = snapshot(root);
  assert.throws(() => sync(root, "write"), /누락된 섹션 입력/);
  assert.deepEqual(snapshot(root), before);
});

test("path traversal and overlapping targets are rejected", (t) => {
  const root = fixture(t);
  const config = JSON.parse(read(root, ".agent-source/targets.json"));
  config.targets[0].entrypoint = "../AGENTS.md";
  write(root, ".agent-source/targets.json", JSON.stringify(config));
  assert.throws(() => sync(root, "write"), /상대 경로/);
  config.targets[0].entrypoint = "CLAUDE.md";
  write(root, ".agent-source/targets.json", JSON.stringify(config));
  assert.throws(() => sync(root, "write"), /공식 발견 경로|겹치는 대상 경로/);
});

test("symlink destinations cannot redirect writes outside the workspace", (t) => {
  const root = fixture(t);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "instruction-outside-"));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.symlinkSync(outside, path.join(root, ".agents"), "dir");
  assert.throws(() => sync(root, "write"), /심볼릭 링크/);
  assert.deepEqual(fs.readdirSync(outside), []);
  assert.equal(fs.existsSync(path.join(root, "AGENTS.md")), false);
});

test("unregistered generated files fail validation without being deleted", (t) => {
  const root = fixture(t);
  sync(root, "write");
  write(root, ".claude/skills/unknown/SKILL.md", read(root, claudeSkill));
  const before = snapshot(root);
  assert.equal(sync(root).ok, false);
  assert.equal(sync(root, "write").ok, false);
  assert.deepEqual(snapshot(root), before);
});

test("every native adapter must retain the contract and independent resources", (t) => {
  const root = fixture(t);
  const file = ".agent-source/adapters/codex/skills/sync-instructions.md";
  const original = read(root, file);
  write(root, file, original.replace("{{CONSTRAINTS}}", ""));
  assert.throws(() => build(root), /계약 변수 CONSTRAINTS/);
  write(root, file, original + "\n.claude/skills/foreign/SKILL.md\n");
  assert.throws(() => build(root), /다른 도구의 스킬 경로/);
});

test("CLI resolves its workspace from its script location and rejects unknown flags", (t) => {
  const root = fixture(t);
  const script = path.join(root, "scripts/sync-instructions.mjs");
  const generated = spawnSync(process.execPath, [script, "--write"], { cwd: os.tmpdir(), encoding: "utf8" });
  assert.equal(generated.status, 0, generated.stderr);
  assert.equal(sync(root).ok, true);
  const before = snapshot(root);
  const invalid = spawnSync(process.execPath, [script, "--force"], { cwd: os.tmpdir(), encoding: "utf8" });
  assert.equal(invalid.status, 1);
  assert.deepEqual(snapshot(root), before);
});

test("legacy duplicate skills and unused harnesses migrate without touching unrelated files", (t) => {
  const root = fixture(t);
  sync(root, "write");
  const manifest = JSON.parse(read(root, ".agent-source/.manifest.json"));
  manifest.version = 1;
  for (const file of [".codex/harness.md", ".claude/harness.md", ".codex/skills/sync-instructions/SKILL.md"]) {
    const content = read(root, file.endsWith("SKILL.md") ? codexSkill : "AGENTS.md");
    write(root, file, content);
    manifest.outputs[file] = {
      sha256: createHash("sha256").update(content).digest("hex"),
      source: file.endsWith("SKILL.md") ? ".agent-source/skills/sync-instructions/source.md" : ".agent-source/project/source.md",
      target: file.startsWith(".codex") ? "codex" : "claude"
    };
  }
  write(root, ".codex/personal.md", "보존");
  write(root, ".agent-source/.manifest.json", JSON.stringify(manifest));
  const result = sync(root, "write");
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.changes.filter((change) => change.startsWith("delete:")).length, 3);
  assert.equal(fs.existsSync(path.join(root, ".codex/skills")), false);
  assert.equal(read(root, ".codex/personal.md"), "보존");
});

test("tool metadata changes stay with that runtime and invalid types fail before writes", (t) => {
  const root = fixture(t);
  sync(root, "write");
  const originalCodex = read(root, codexSkill);
  const file = ".agent-source/adapters/claude/skills/sync-instructions.json";
  const metadata = JSON.parse(read(root, file));
  metadata["argument-hint"] = "[check | write]";
  write(root, file, JSON.stringify(metadata));
  assert.equal(sync(root, "write").ok, true);
  assert.equal(read(root, codexSkill), originalCodex);
  assert.ok(read(root, claudeSkill).includes('argument-hint: "[check | write]"'));
  metadata["disable-model-invocation"] = "false";
  write(root, file, JSON.stringify(metadata));
  const before = snapshot(root);
  assert.throws(() => sync(root, "write"), /타입/);
  assert.deepEqual(snapshot(root), before);
});

test("missing native adapters and referenced resources block incomplete generation", (t) => {
  const root = fixture(t);
  const file = ".agent-source/adapters/claude/skills/sync-instructions.md";
  const original = read(root, file);
  fs.unlinkSync(path.join(root, file));
  assert.throws(() => build(root), /필수 원천/);
  write(root, file, original.replace("references/recovery.md", "references/missing.md"));
  assert.throws(() => build(root), /참조 누락/);
});

test("project contract can be scoped but cannot be lost or duplicated", (t) => {
  const root = fixture(t);
  const file = ".agent-source/adapters/claude/rules/instruction-maintenance.md";
  const original = read(root, file);
  write(root, file, original.replace("{{MAINTENANCE}}", ""));
  assert.throws(() => build(root), /계약 변수 MAINTENANCE/);
  write(root, file, original + "\n{{MAINTENANCE}}");
  assert.throws(() => build(root), /계약 변수 MAINTENANCE/);
});

test("Claude argument substitution cannot leak into Codex instructions", (t) => {
  const root = fixture(t);
  const file = ".agent-source/adapters/codex/skills/sync-instructions.md";
  write(root, file, read(root, file) + "\n$ARGUMENTS");
  assert.throws(() => build(root), /Codex는/);
});

test("unmanaged symlinked skills remain untouched", (t) => {
  const root = fixture(t);
  sync(root, "write");
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "instruction-custom-"));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  write(outside, "SKILL.md", "사용자 스킬");
  fs.symlinkSync(outside, path.join(root, ".agents/skills/custom"), "dir");
  write(root, ".agent-source/project/source.md", read(root, ".agent-source/project/source.md") + "\n추가 계약\n");
  assert.equal(sync(root, "write").ok, true);
  assert.equal(read(outside, "SKILL.md"), "사용자 스킬");
  assert.equal(fs.lstatSync(path.join(root, ".agents/skills/custom")).isSymbolicLink(), true);
});

test("a permission failure leaves the manifest unchanged and can be retried", (t) => {
  const root = fixture(t);
  const rename = fs.renameSync;
  const mocked = t.mock.method(fs, "renameSync", (source, destination) => {
    if (destination === path.join(fs.realpathSync(root), codexSkill)) throw Object.assign(new Error("permission denied"), { code: "EPERM" });
    return rename(source, destination);
  });
  const failed = sync(root, "write");
  assert.equal(failed.ok, false);
  assert.ok(failed.errors.some((error) => error.includes("EPERM")));
  assert.ok(failed.changes.length > 0);
  assert.equal(fs.existsSync(path.join(root, ".agent-source/.manifest.json")), false);
  assert.equal(fs.existsSync(path.join(root, "CLAUDE.md")), true);
  mocked.mock.restore();
  assert.equal(sync(root, "write").ok, true);
  assert.equal(sync(root).ok, true);
});
