// Only the work-plan hook is managed. Other settings and hooks remain user-owned.
export const HOOK_SOURCE = '.agent-source/hooks/work-plan/source.md';
export const HOOK_FILES = { codex: '.codex/hooks.json', claude: '.claude/settings.json' };
const ownedMarker = `AUTO-GENERATED from ${HOOK_SOURCE} `;

export const isHookFile = (file) => Object.values(HOOK_FILES).includes(file);
const owned = (group) =>
  Array.isArray(group?.hooks) &&
  group.hooks.some((handler) => typeof handler.command === 'string' && handler.command.includes(ownedMarker));
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;

function parse(content, file) {
  const value = content === null ? {} : JSON.parse(content);
  if (!isObject(value) || (value.hooks !== undefined && !isObject(value.hooks)))
    throw new Error(`${file}: 설정과 hooks는 객체여야 합니다.`);
  for (const groups of Object.values(value.hooks ?? {}))
    if (!Array.isArray(groups)) throw new Error(`${file}: hook 이벤트는 배열이어야 합니다.`);
  return value;
}

// Hash only the owned groups, so unrelated settings can change without drift.
export function managedContent(file, content) {
  if (!isHookFile(file)) return content;
  const { hooks = {} } = parse(content, file);
  return json(
    Object.fromEntries(
      Object.entries(hooks)
        .sort(([a], [b]) => a.localeCompare(b, 'en'))
        .map(([event, groups]) => [event, groups.filter(owned)])
        .filter(([, groups]) => groups.length),
    ),
  );
}

export function hasManagedHook(file, content) {
  return managedContent(file, content) !== '{}\n';
}

export function removeManagedHook(file, content) {
  const config = parse(content, file);
  if (config.hooks) {
    for (const [event, groups] of Object.entries(config.hooks)) {
      const kept = groups.filter((group) => !owned(group));
      // Preserve pre-existing empty arrays as well as other handlers.
      if (kept.length !== groups.length) {
        if (kept.length) config.hooks[event] = kept;
        else delete config.hooks[event];
      }
    }
    if (!Object.keys(config.hooks).length) delete config.hooks;
  }
  return Object.keys(config).length ? json(config) : null;
}

export function renderWorkPlanHook(adapter, reminder, comment) {
  const config = parse(adapter, 'work-plan-hook.json');
  const groups = config.hooks?.UserPromptSubmit;
  const handler = groups?.[0]?.hooks?.[0];
  if (
    Object.keys(config).join() !== 'hooks' ||
    Object.keys(config.hooks).join() !== 'UserPromptSubmit' ||
    groups.length !== 1 ||
    Object.keys(groups[0]).join() !== 'hooks' ||
    groups[0].hooks.length !== 1 ||
    !handler ||
    Object.keys(handler).some((key) => !['type', 'command', 'timeout'].includes(key)) ||
    handler.type !== 'command' ||
    handler.command !== '{{WORK_PLAN_COMMAND}}' ||
    !Number.isInteger(handler.timeout) ||
    handler.timeout < 1 ||
    handler.timeout > 2
  )
    throw new Error('work-plan-hook.json: UserPromptSubmit의 단일 command와 1~2초 timeout이 필요합니다.');
  if (!reminder.trim() || Buffer.byteLength(reminder) > 768)
    throw new Error(`${HOOK_SOURCE}: 알림은 비어 있지 않은 768 UTF-8 bytes 이하여야 합니다.`);
  const payload = JSON.stringify({
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: reminder },
  });
  handler.command = `printf '%s\\n' ${quote(payload)} ${comment}`;
  return config;
}

export function mergeWorkPlanHook(file, actual, desired) {
  const config = parse(removeManagedHook(file, actual), file);
  const existing = config.hooks?.UserPromptSubmit ?? [];
  config.hooks = { ...config.hooks, UserPromptSubmit: [...existing, ...desired.hooks.UserPromptSubmit] };
  return json(config);
}
