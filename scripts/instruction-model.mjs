import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
  HOOK_SOURCE,
  HOOK_FILES,
  managedContent,
  renderWorkPlanHook,
  mergeWorkPlanHook,
} from './instruction-hooks.mjs';

export const MANIFEST = '.agent-source/.manifest.json';
export const REGISTRY = '.agent-source/registry.md';
export const PROJECT = '.agent-source/project/source.md';
export const CODE_QUALITY = '.agent-source/conventions/code-quality/source.md';
export const TEST_WRITING = '.agent-source/conventions/test-writing/source.md';
export const REACT_BEST_PRACTICES = '.agent-source/conventions/react-best-practices/source.md';
export const SCRIPT = 'scripts/sync-instructions.mjs';
export const MARKER = 'AUTO-GENERATED from ';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROJECT_SOURCES = {
  PURPOSE: '.agent-source/project/purpose.md',
  WORKFLOW: '.agent-source/project/workflow.md',
  QUALITY: '.agent-source/project/quality.md',
  DESIGN_TOKENS: '.agent-source/project/design-tokens.md',
  CONTENT: '.agent-source/project/content.md',
  VERSIONING: '.agent-source/project/versioning.md',
  MAINTENANCE: '.agent-source/project/maintenance.md',
  NON_GOALS: '.agent-source/project/scope.md',
};
const PROJECT_REFERENCES = {
  CONTENT: [
    '.agent-source/project/content/storage.md',
    '.agent-source/project/content/mdx.md',
    '.agent-source/project/content/publishing.md',
    '.agent-source/project/content/series.md',
  ],
};
const SKILL_FACETS = {
  목적: 'PURPOSE',
  트리거: 'TRIGGERS',
  입력: 'INPUTS',
  절차: 'STEPS',
  검증: 'VERIFICATION',
  출력: 'OUTPUTS',
  제약: 'CONSTRAINTS',
  '중단 조건': 'STOP',
  'Non-goals': 'NON_GOALS',
};
const NATIVE = {
  codex: { entrypoint: 'AGENTS.md', skillRoot: '.agents/skills', prefix: '$' },
  claude: { entrypoint: 'CLAUDE.md', skillRoot: '.claude/skills', prefix: '/' },
};

export const hash = (content) => createHash('sha256').update(content).digest('hex');
export const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sorted = (object) => Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b, 'en')));
export const marker = (source, yaml = false) => {
  const text = `${MARKER}${source} by ${SCRIPT}. Do not edit; run node ${SCRIPT} --write.`;
  return yaml ? `# ${text}` : `<!-- ${text} -->`;
};
export const hasMarker = (content, source) =>
  content.includes(marker(source)) || content.includes(marker(source, true));
export const skillRoots = (target) => [target.skillRoot];
export const projectPaths = (target) => [
  target.entrypoint,
  ...(target.documents ?? []).map((doc) => doc.path),
  ...(target.rules ?? []).map((rule) => rule.path),
];

export function relativePath(value) {
  if (
    typeof value !== 'string' ||
    !value ||
    path.posix.isAbsolute(value) ||
    /[\\:]/.test(value) ||
    [...value].some((character) => character.charCodeAt(0) <= 0x20) ||
    value.split('/').some((part) => !part || part === '.' || part === '..')
  )
    throw new Error(`잘못된 상대 경로: ${JSON.stringify(value)}`);
  return value;
}

export function workspace(root) {
  root = fs.realpathSync(root);
  function resolve(relative) {
    relativePath(relative);
    let current = root;
    for (const part of relative.split('/')) {
      current = path.join(current, part);
      try {
        if (fs.lstatSync(current).isSymbolicLink())
          throw new Error(`심볼릭 링크 경로는 관리하지 않습니다: ${relative}`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    return current;
  }
  function read(relative) {
    try {
      return fs.readFileSync(resolve(relative), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }
  function files(relative, rejectLinks = false) {
    const directory = resolve(relative);
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const child = `${relative}/${entry.name}`;
      if (entry.isSymbolicLink()) {
        if (rejectLinks) throw new Error(`심볼릭 링크 경로는 관리하지 않습니다: ${child}`);
        return [];
      }
      return entry.isDirectory() ? files(child, rejectLinks) : [child];
    });
  }
  return { root, resolve, read, files };
}

function object(value, allowed, file) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${file}: 객체가 필요합니다.`);
  for (const key of Object.keys(value))
    if (!allowed.includes(key)) throw new Error(`${file}: 지원하지 않는 필드 ${key}`);
}

function projectTopic(content, file) {
  const match = /^# [^\n]+\n+([\s\S]*)$/.exec(content);
  const body = match?.[1].trim();
  if (!body?.replace(/<!--[\s\S]*?-->/g, '').trim())
    throw new Error(`${file}: 주제 제목과 비어 있지 않은 본문이 필요합니다.`);
  return body;
}

function facets(content, mapping, file) {
  const sections = {};
  let heading;
  for (const line of content.split('\n')) {
    const match = /^## (.+)$/.exec(line);
    if (match) {
      heading = match[1].trim();
      if (!Object.hasOwn(mapping, heading) || Object.hasOwn(sections, heading))
        throw new Error(`${file}: 알 수 없거나 중복된 섹션 ${heading}`);
      sections[heading] = '';
    } else if (heading) sections[heading] += `${line}\n`;
  }
  return Object.fromEntries(
    Object.entries(mapping).map(([heading, variable]) => {
      const value = sections[heading]?.trim();
      if (!value?.replace(/<!--[\s\S]*?-->/g, '').trim())
        throw new Error(`${file}: 비어 있거나 누락된 섹션 ${heading}`);
      return [variable, value];
    }),
  );
}

function parseSkill(content, name, file) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(content);
  if (!match) throw new Error(`${file}: name과 description 메타데이터가 필요합니다.`);
  const metadata = {};
  for (const line of match[1].split('\n')) {
    const field = /^(name|description):\s*(.+)$/.exec(line);
    if (!field || Object.hasOwn(metadata, field[1])) throw new Error(`${file}: 메타데이터 형식 오류`);
    metadata[field[1]] = field[2].startsWith('"') ? JSON.parse(field[2]) : field[2];
  }
  if (!SLUG.test(name) || name.length >= 64 || metadata.name !== name)
    throw new Error(`${file}: name과 폴더명은 같은 kebab-case여야 합니다.`);
  if (
    typeof metadata.description !== 'string' ||
    !metadata.description.trim() ||
    metadata.description.length > 1024 ||
    /[<>\r\n]/.test(metadata.description)
  )
    throw new Error(`${file}: description 형식 오류`);
  return { ...metadata, source: file, values: facets(content.slice(match[0].length), SKILL_FACETS, file) };
}

function render(template, values, file) {
  return template
    .replace(/\{\{([A-Z_]+)\}\}/g, (_, name) => {
      if (!Object.hasOwn(values, name)) throw new Error(`${file}: 알 수 없는 템플릿 변수 ${name}`);
      return values[name];
    })
    .trim();
}

function coverage(templates, values, file) {
  const used = templates.join('\n').match(/\{\{[A-Z_]+\}\}/g) ?? [];
  for (const variable of Object.keys(values)) {
    const count = used.filter((item) => item === `{{${variable}}}`).length;
    if (count !== 1) throw new Error(`${file}: 계약 변수 ${variable}는 정확히 한 번 포함해야 합니다 (${count}).`);
  }
}

function validateTargets(config) {
  object(config, ['version', 'targets'], 'targets.json');
  if (config.version !== 2 || !Array.isArray(config.targets) || !config.targets.length)
    throw new Error('targets.json: version 2와 하나 이상의 target이 필요합니다.');
  const names = new Set();
  const paths = [];
  for (const target of config.targets) {
    object(
      target,
      ['name', 'entrypoint', 'skillRoot', 'documents', 'rules', 'runtime', 'workPlanHook'],
      'targets.json',
    );
    const native = NATIVE[target.name];
    if (!native || names.has(target.name)) throw new Error('targets.json: 지원하지 않거나 중복된 도구입니다.');
    names.add(target.name);
    if (target.workPlanHook !== undefined && typeof target.workPlanHook !== 'boolean')
      throw new Error(`${target.name}: workPlanHook은 boolean이어야 합니다.`);
    if (target.runtime !== undefined) {
      object(target.runtime, ['status', 'reason'], `${target.name}.runtime`);
      if (!['enabled', 'deferred'].includes(target.runtime.status))
        throw new Error(`${target.name}: runtime.status는 enabled 또는 deferred여야 합니다.`);
      if (target.runtime.status === 'deferred') {
        if (
          typeof target.runtime.reason !== 'string' ||
          !target.runtime.reason.trim() ||
          /[\r\n]/.test(target.runtime.reason)
        )
          throw new Error(`${target.name}: 보류 이유는 비어 있지 않은 한 줄 문자열이어야 합니다.`);
      } else if (target.runtime.reason !== undefined)
        throw new Error(`${target.name}: 보류되지 않은 도구에 보류 이유를 지정할 수 없습니다.`);
    }
    if (target.documents !== undefined && !Array.isArray(target.documents))
      throw new Error(`${target.name}: documents는 배열이어야 합니다.`);
    for (const doc of target.documents ?? []) {
      object(doc, ['path', 'template'], target.name);
      relativePath(doc.template);
      if (
        target.name !== 'codex' ||
        !doc.path?.startsWith('.codex/') ||
        !doc.path.endsWith('.md') ||
        doc.path.includes('/skills/')
      )
        throw new Error(`${target.name}: 지원하지 않는 상세 지침 경로`);
    }
    if (target.rules !== undefined && !Array.isArray(target.rules))
      throw new Error(`${target.name}: rules는 배열이어야 합니다.`);
    for (const rule of target.rules ?? []) {
      object(rule, ['path', 'template', 'paths'], target.name);
      relativePath(rule.template);
      if (target.name !== 'claude' || !rule.path?.startsWith('.claude/rules/') || !rule.path.endsWith('.md'))
        throw new Error(`${target.name}: 지원하지 않는 규칙 경로`);
      if (
        !Array.isArray(rule.paths) ||
        !rule.paths.length ||
        rule.paths.some(
          (glob) =>
            typeof glob !== 'string' ||
            !glob ||
            /[\r\n\\]/.test(glob) ||
            glob.startsWith('/') ||
            glob.split('/').includes('..'),
        )
      )
        throw new Error(`${rule.path}: 유효한 paths 배열이 필요합니다.`);
    }
    for (const file of [
      ...projectPaths(target),
      ...skillRoots(target),
      ...(target.workPlanHook ? [HOOK_FILES[target.name]] : []),
    ]) {
      relativePath(file);
      if (paths.some((other) => file === other || file.startsWith(`${other}/`) || other.startsWith(`${file}/`)))
        throw new Error(`${target.name}: 겹치는 대상 경로 ${file}`);
      paths.push(file);
    }
    if (target.entrypoint !== native.entrypoint || target.skillRoot !== native.skillRoot)
      throw new Error(`${target.name}: 공식 발견 경로와 다릅니다.`);
  }
  return config.targets;
}

function validateMetadata(target, data, file, name) {
  if (target === 'codex') {
    object(data, ['interface', 'policy'], file);
    if (data.interface) {
      object(data.interface, ['display_name', 'short_description', 'default_prompt'], file);
      for (const value of Object.values(data.interface))
        if (typeof value !== 'string' || !value.trim() || /[\r\n]/.test(value))
          throw new Error(`${file}: interface는 한 줄 문자열이어야 합니다.`);
      const short = data.interface.short_description;
      if (short !== undefined && (short.length < 25 || short.length > 64))
        throw new Error(`${file}: short_description은 25~64자여야 합니다.`);
      if (data.interface.default_prompt && !data.interface.default_prompt.includes(`$${name}`))
        throw new Error(`${file}: default_prompt에 스킬 호출명이 필요합니다.`);
    }
    if (data.policy) {
      object(data.policy, ['allow_implicit_invocation'], file);
      if (typeof data.policy.allow_implicit_invocation !== 'boolean')
        throw new Error(`${file}: allow_implicit_invocation은 boolean이어야 합니다.`);
    }
  } else {
    object(data, ['argument-hint', 'disable-model-invocation', 'user-invocable'], file);
    for (const [key, value] of Object.entries(data)) {
      if (
        key === 'argument-hint'
          ? typeof value !== 'string' || !value || /[\r\n]/.test(value)
          : typeof value !== 'boolean'
      )
        throw new Error(`${file}: 잘못된 ${key} 타입`);
    }
  }
}

function yaml(data, indent = '') {
  return Object.entries(data)
    .map(([key, value]) => {
      if (Array.isArray(value))
        return `${indent}${key}:\n${value.map((item) => `${indent}  - ${JSON.stringify(item)}`).join('\n')}`;
      if (value && typeof value === 'object') return `${indent}${key}:\n${yaml(value, `${indent}  `)}`;
      return `${indent}${key}: ${JSON.stringify(value)}`;
    })
    .join('\n');
}

export function build(root) {
  const disk = workspace(root);
  const inputs = {};
  function source(file, optional = false) {
    const content = disk.read(file);
    if (content === null) {
      if (optional) return '';
      throw new Error(`${file}: 필수 원천 파일이 없습니다.`);
    }
    inputs[file] = hash(content);
    return content.replace(/\r\n/g, '\n').trim();
  }
  source(SCRIPT);
  source('scripts/instruction-model.mjs');
  source('scripts/instruction-hooks.mjs');
  const targets = validateTargets(JSON.parse(source('.agent-source/targets.json')));
  const runtimeStatus =
    targets
      .filter((target) => target.runtime?.status === 'deferred')
      .map(
        (target) =>
          `- ${target.name === 'claude' ? 'Claude Code' : 'Codex'}: **${target.runtime.reason}**. 지침·스킬 생성과 정적 검사는 계속한다. 사용자가 재개를 요청할 때까지 해당 도구의 CLI 실행·모델 호출·인증 복구·결제 변경을 시도하지 않는다. \`.agent-source/targets.json\`의 \`runtime.status\`를 임의로 해제하지 않는다.`,
      )
      .join('\n') || '현재 보류된 도구는 없다. 실제 실행 가능 여부는 실행 시 확인한다.';
  const codeQuality = source(CODE_QUALITY);
  if (!codeQuality.replace(/<!--[\s\S]*?-->/g, '').trim())
    throw new Error(`${CODE_QUALITY}: 코드 품질 정책이 비어 있습니다.`);
  const testWriting = source(TEST_WRITING);
  if (!testWriting.replace(/<!--[\s\S]*?-->/g, '').trim())
    throw new Error(`${TEST_WRITING}: 테스트 작성 계약이 비어 있습니다.`);
  const reactBestPractices = source(REACT_BEST_PRACTICES);
  if (!reactBestPractices.replace(/<!--[\s\S]*?-->/g, '').trim())
    throw new Error(`${REACT_BEST_PRACTICES}: React 작성 지침이 비어 있습니다.`);
  source(PROJECT);
  const project = {
    ...Object.fromEntries(
      Object.entries(PROJECT_SOURCES).map(([variable, file]) => [variable, projectTopic(source(file), file)]),
    ),
    CODE_QUALITY: codeQuality,
    TEST_WRITING: testWriting,
    REACT_BEST_PRACTICES: reactBestPractices,
  };
  for (const [variable, files] of Object.entries(PROJECT_REFERENCES)) {
    for (const file of files) {
      projectTopic(source(file), file);
      if (!project[variable].includes(`\`${file}\``))
        throw new Error(`${PROJECT_SOURCES[variable]}: 상세 원천 ${file}를 명시적으로 연결해야 합니다.`);
    }
  }
  const conventionSources = { CODE_QUALITY, TEST_WRITING, REACT_BEST_PRACTICES };
  const skills = fs
    .readdirSync(disk.resolve('.agent-source/skills'), { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
    .filter((entry) => {
      if (entry.isSymbolicLink()) throw new Error(`스킬 원천은 심볼릭 링크를 지원하지 않습니다: ${entry.name}`);
      return entry.isDirectory();
    })
    .map(({ name }) => {
      const file = `.agent-source/skills/${name}/source.md`;
      const skill = parseSkill(source(file), name, file);
      const referenceRoot = `.agent-source/skills/${name}/references`;
      const references = disk.files(referenceRoot, true).map((file) => {
        if (!file.endsWith('.md')) throw new Error(`${file}: 보조 자료는 Markdown이어야 합니다.`);
        return { name: file.slice(referenceRoot.length + 1), content: source(file) };
      });
      return { ...skill, references };
    });
  const outputs = {};
  function output(file, content, origin, target, used = []) {
    relativePath(file);
    disk.resolve(file); // Preflight every destination before any mutation.
    if (Object.hasOwn(outputs, file) || Object.hasOwn(inputs, file)) throw new Error(`생성 경로 충돌: ${file}`);
    if (/\{\{[A-Z_]+\}\}/.test(content)) throw new Error(`${file}: 미치환 템플릿 변수`);
    for (const other of targets.filter((item) => target !== 'registry' && item.name !== target)) {
      for (const otherRoot of skillRoots(other)) {
        const escaped = otherRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`${escaped}/[a-z0-9-]+/(?:SKILL\\.md|references/)`).test(content))
          throw new Error(`${file}: 다른 도구의 스킬 경로를 참조합니다.`);
      }
    }
    outputs[file] = { content: `${content.trim()}\n`, source: origin, target, facets: used };
  }
  for (const target of targets) {
    const adapter = `.agent-source/adapters/${target.name}`;
    if (target.workPlanHook) {
      if (!skills.some((skill) => skill.name === 'work-plan'))
        throw new Error(`${target.name}: hook에 필요한 work-plan 스킬이 없습니다.`);
      const desired = renderWorkPlanHook(
        source(`${adapter}/work-plan-hook.json`),
        source(HOOK_SOURCE),
        marker(HOOK_SOURCE, true),
      );
      const file = HOOK_FILES[target.name];
      output(file, mergeWorkPlanHook(file, disk.read(file), desired), HOOK_SOURCE, target.name, ['WORK_PLAN_REMINDER']);
    }
    const projectTemplate = source(`${adapter}/project.md`);
    const documents = (target.documents ?? []).map((doc) => ({
      ...doc,
      content: source(`${adapter}/${doc.template}`),
    }));
    const rules = (target.rules ?? []).map((rule) => ({ ...rule, content: source(`${adapter}/${rule.template}`) }));
    coverage(
      [projectTemplate, ...documents.map((doc) => doc.content), ...rules.map((rule) => rule.content)],
      { ...project, SKILLS: '', RUNTIME_STATUS: '' },
      adapter,
    );
    const values = {
      ...project,
      RUNTIME_STATUS: runtimeStatus,
      SKILLS:
        skills
          .map(
            (skill) =>
              `- \`${NATIVE[target.name].prefix}${skill.name}\` — ${skill.description}\n  파일: \`${target.skillRoot}/${skill.name}/SKILL.md\``,
          )
          .join('\n') || '등록된 프로젝트 스킬이 없다.',
    };
    const used = (template) => Object.keys(project).filter((key) => template.includes(`{{${key}}}`));
    const origin = (template) =>
      used(template).length === 1 ? (conventionSources[used(template)[0]] ?? PROJECT) : PROJECT;
    output(
      target.entrypoint,
      `${marker(PROJECT)}\n\n${render(projectTemplate, values, adapter)}`,
      PROJECT,
      target.name,
      used(projectTemplate),
    );
    for (const doc of documents)
      output(
        doc.path,
        `${marker(origin(doc.content))}\n\n${render(doc.content, values, doc.template)}`,
        origin(doc.content),
        target.name,
        used(doc.content),
      );
    for (const rule of rules)
      output(
        rule.path,
        `---\n${yaml({ paths: rule.paths })}\n---\n\n${marker(origin(rule.content))}\n\n${render(rule.content, values, rule.template)}`,
        origin(rule.content),
        target.name,
        used(rule.content),
      );
    for (const skill of skills) {
      const templateFile = `${adapter}/skills/${skill.name}.md`;
      const template = source(templateFile);
      const skillValues = { ...skill.values, RUNTIME_STATUS: runtimeStatus };
      coverage([template], skillValues, templateFile);
      const metadataFile = `${adapter}/skills/${skill.name}.json`;
      const metadata = JSON.parse(source(metadataFile, true) || '{}');
      validateMetadata(target.name, metadata, metadataFile, skill.name);
      const body = render(template, skillValues, templateFile);
      if (target.name === 'codex' && /\$ARGUMENTS(?:\b|\[)/.test(body))
        throw new Error(`${templateFile}: Codex는 $ARGUMENTS 치환을 사용하지 않습니다.`);
      const frontmatter = {
        name: skill.name,
        description: skill.description,
        ...(target.name === 'claude' ? metadata : {}),
      };
      for (const directory of skillRoots(target)) {
        const base = `${directory}/${skill.name}`;
        output(
          `${base}/SKILL.md`,
          `---\n${yaml(frontmatter)}\n---\n\n${marker(skill.source)}\n\n${body}`,
          skill.source,
          target.name,
          Object.keys(skill.values),
        );
        if (target.name === 'codex' && Object.keys(metadata).length)
          output(
            `${base}/agents/openai.yaml`,
            `${marker(skill.source, true)}\n${yaml(metadata)}`,
            skill.source,
            target.name,
          );
        for (const reference of skill.references)
          output(
            `${base}/references/${reference.name}`,
            `${marker(skill.source)}\n\n${reference.content}`,
            skill.source,
            target.name,
          );
      }
    }
  }
  for (const [file, { content }] of Object.entries(outputs)) {
    for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      if (/^(?:https?:|#)/.test(match[1])) continue;
      const linked = path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1].split('#')[0]));
      relativePath(linked);
      if (!Object.hasOwn(outputs, linked)) throw new Error(`${file}: 생성물 참조 누락 ${match[1]}`);
    }
  }
  for (const target of targets) {
    const entryLinks = [...outputs[target.entrypoint].content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(
      (match) => match[1],
    );
    for (const doc of target.documents ?? []) {
      if (!entryLinks.includes(doc.path))
        throw new Error(`${target.entrypoint}: 상세 지침 ${doc.path}를 명시적으로 연결해야 합니다.`);
    }
  }
  const rows = Object.entries(outputs)
    .sort(([a], [b]) => a.localeCompare(b, 'en'))
    .map(
      ([file, record]) => `| \`${file}\` | ${record.target} | ${record.facets.join(', ') || '보조 자료/메타데이터'} |`,
    )
    .join('\n');
  output(
    REGISTRY,
    `${marker(PROJECT)}\n\n# 지침 생성 목록\n\n| 산출물 | 도구 | 원천 계약 포함 |\n| --- | --- | --- |\n${rows}\n\n입력과 산출물의 해시는 \`${MANIFEST}\`에서 관리한다. 계약 포함 검사는 문장 의미의 동등성이나 모델 실행 성공을 증명하지 않는다.`,
    PROJECT,
    'registry',
  );
  const manifest = {
    version: 2,
    inputs: sorted(inputs),
    outputs: sorted(
      Object.fromEntries(
        Object.entries(outputs).map(([file, value]) => [
          file,
          {
            sha256: hash(managedContent(file, value.content)),
            source: value.source,
            target: value.target,
            facets: value.facets,
          },
        ]),
      ),
    ),
  };
  return { disk, targets, outputs, manifest };
}
