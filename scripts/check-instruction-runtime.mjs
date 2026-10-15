#!/usr/bin/env node

// Native loader checks only: no user prompt, model turn, configuration write,
// or permission-grant request is sent to either CLI.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn, spawnSync } from "node:child_process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { build } from "./instruction-model.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const redact = (text) => String(text).replaceAll(root, "<project>").replaceAll(os.homedir(), "<user-home>");

function version(command) {
  const result = spawnSync(command, ["--version"], { encoding: "utf8", timeout: 10000 });
  if (result.status !== 0) throw new Error(`${command}: CLI 실행 불가 (${result.error?.code ?? result.status})`);
  return result.stdout.trim();
}

function exchange(command, args, initial, onMessage) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: ["pipe", "pipe", "pipe"] });
    let completed = false;
    let stderr = "";
    const timer = setTimeout(() => finish(new Error(`${command}: 초기화 응답 시간 초과`)), 30000);
    function finish(error, result) {
      if (completed) return;
      completed = true;
      clearTimeout(timer);
      child.stdin.end();
      child.kill("SIGTERM");
      const kill = setTimeout(() => child.kill("SIGKILL"), 1000);
      kill.unref();
      if (error) reject(error); else resolve(result);
    }
    function send(message) { child.stdin.write(`${JSON.stringify(message)}\n`); }
    child.on("error", finish);
    child.stdin.on("error", (error) => { if (!completed) finish(error); });
    child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-2000); });
    child.on("exit", (code) => { if (!completed) finish(new Error(`${command}: 초기화 실패 (${code}) ${redact(stderr).slice(-700)}`)); });
    createInterface({ input: child.stdout }).on("line", (line) => {
      let message;
      try { message = JSON.parse(line); } catch { return; }
      try { onMessage(message, send, (result) => finish(null, result)); } catch (error) { finish(error); }
    });
    send(initial);
  });
}

async function codex(expected) {
  const installed = version("codex");
  const skills = await exchange("codex", ["app-server"], {
    id: 0, method: "initialize", params: { clientInfo: { name: "instruction_validation", version: "1.0.0" } },
  }, (message, send, finish) => {
    if (message.error) throw new Error(`Codex: ${message.error.message}`);
    if (message.id === 0) {
      send({ method: "initialized", params: {} });
      send({ id: 1, method: "skills/list", params: { cwds: [root], forceReload: true } });
    }
    if (message.id !== 1) return;
    const data = message.result?.data?.find((item) => path.resolve(item.cwd) === root);
    if (!data) throw new Error("Codex: 작업 공간 스킬 목록을 받지 못했습니다.");
    const relevant = data.skills.filter((item) => expected.some((skill) => skill.name === item.name));
    const checked = expected.map((skill) => {
      const matches = relevant.filter((item) => item.name === skill.name);
      if (matches.length !== 1) throw new Error(`Codex: ${skill.name} 발견 수 ${matches.length}, 정확히 1개가 필요합니다.`);
      const found = matches[0];
      if (path.resolve(found.path) !== path.join(root, skill.path) || found.enabled !== true || found.description !== skill.description) throw new Error(`Codex: ${skill.name} 경로·설명·활성 상태 불일치`);
      if (skill.interface && (found.interface?.displayName !== skill.interface.display_name || found.interface?.shortDescription !== skill.interface.short_description || found.interface?.defaultPrompt !== skill.interface.default_prompt)) throw new Error(`Codex: ${skill.name} openai.yaml 메타데이터 불일치`);
      return { name: found.name, path: skill.path, enabled: found.enabled, metadata: skill.interface ? "parsed" : "default" };
    });
    const errors = data.errors?.filter((error) => expected.some((skill) => JSON.stringify(error).includes(skill.name))) ?? [];
    if (errors.length) throw new Error(`Codex: 프로젝트 스킬 파싱 오류 ${errors.length}개`);
    finish(checked);
  });
  return { tool: "codex", version: installed, status: "passed", skills };
}

async function claude(expected) {
  const installed = version("claude");
  const skills = await exchange("claude", [
    "--print", "--input-format", "stream-json", "--output-format", "stream-json", "--verbose",
    "--no-session-persistence", "--setting-sources", "project,local",
    "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}',
    "--settings", '{"disableAllHooks":true,"autoMemoryEnabled":false}',
  ], { type: "control_request", request_id: "init", request: { subtype: "initialize", hooks: {} } }, (message, send, finish) => {
    if (message.type !== "control_response" || message.response?.request_id !== "init") return;
    if (message.response.subtype !== "success") throw new Error(`Claude: ${message.response.error ?? "초기화 실패"}`);
    const commands = message.response.response?.commands;
    if (!Array.isArray(commands)) throw new Error("Claude: 초기화 응답에 명령 목록이 없습니다.");
    const checked = expected.map((skill) => {
      const matches = commands.filter((command) => command.name === skill.name);
      if (matches.length !== 1) throw new Error(`Claude: ${skill.name} 발견 수 ${matches.length}, 정확히 1개가 필요합니다.`);
      const found = matches[0];
      // Claude 2.1.236 adds the discovery scope to the command description.
      if (![skill.description, `${skill.description} (project)`].includes(found.description) || found.argumentHint !== (skill.argumentHint ?? "")) throw new Error(`Claude: ${skill.name} 설명·인자 힌트 불일치: ${JSON.stringify(found)}`);
      return { name: found.name, argumentHint: found.argumentHint, metadata: "parsed" };
    });
    finish(checked);
  });
  return { tool: "claude", version: installed, status: "passed", scope: "project,local; hooks and MCP disabled for inspection", skills };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--help") {
    console.log("Usage: node scripts/check-instruction-runtime.mjs [--codex | --claude]\n모델 요청 없이 설치된 CLI의 프로젝트 스킬 발견과 메타데이터 해석을 검사합니다.\n보류된 도구는 버전 조회를 포함한 모든 CLI 실행을 건너뜁니다.");
    return;
  }
  if (args.length > 1 || (args.length && !["--codex", "--claude"].includes(args[0]))) throw new Error("--codex 또는 --claude만 지정할 수 있습니다.");
  const { outputs, targets } = build(root);
  const checks = targets.filter((target) => !args.length || args[0] === `--${target.name}`).map(async (target) => {
    if (target.runtime?.status === "deferred") return { tool: target.name, status: "deferred", reason: target.runtime.reason };
    const expected = Object.entries(outputs).filter(([file]) => file.startsWith(`${target.skillRoot}/`) && file.endsWith("/SKILL.md")).map(([file, record]) => {
      const name = path.basename(path.dirname(file));
      const description = JSON.parse(record.content.match(/^description: (.+)$/m)[1]);
      const metadataPath = path.join(root, `.agent-source/adapters/${target.name}/skills/${name}.json`);
      const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, "utf8")) : {};
      return { name, description, path: file, interface: metadata.interface, argumentHint: metadata["argument-hint"] };
    });
    try { return await (target.name === "codex" ? codex(expected) : claude(expected)); }
    catch (error) { return { tool: target.name, status: "failed", error: redact(error.message) }; }
  });
  const results = await Promise.all(checks);
  console.log(JSON.stringify({ checks: results, modelExecution: "not tested" }, null, 2));
  if (results.some((result) => result.status === "failed")) process.exitCode = 1;
}

try { await main(); } catch (error) { console.error(redact(error.message)); process.exitCode = 1; }
