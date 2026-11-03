import path from 'node:path';
import { DEFAULT_FSD_LAYERS, type FsdOptions } from './options.ts';

// This module knows only paths and FSD policy. It does not depend on the linter, ASTs or filesystem reads.
export const toPosixPath = (value: string): string =>
  value.replaceAll('\\', '/').replace(/^[a-z]:/, (drive) => drive.toUpperCase());

export const resolvePath = (base: string, value: string): string => {
  const windows = /^[a-z]:[/\\]/i.test(base) || /^[a-z]:[/\\]/i.test(value);
  return toPosixPath((windows ? path.win32 : path.posix).resolve(toPosixPath(base), toPosixPath(value)));
};

const isWithin = (parent: string, child: string): boolean =>
  child === parent || child.startsWith(parent.endsWith('/') ? parent : parent + '/');
const sourceExtension = /(?:\.d)?\.[cm]?[jt]sx?$/;
const withoutExtension = (name: string): string => name.replace(sourceExtension, '');
const isFile = (name: string): boolean => /\.[^/]+$/.test(name);

type Root = { path: string; aliases: [string, string][] };
export type FsdLocation = {
  root: string;
  layer: string;
  parts: string[];
  slice?: string;
  scope: string[];
  segmentless: boolean;
};
export type FsdViolation = {
  messageId: 'invalidDirection' | 'crossSliceSameLayer' | 'usePublicApi' | 'missingSlice' | 'missingSegment';
  data: Record<string, string>;
};

const normalizeAliases = (...groups: Record<string, string>[]): [string, string][] => {
  const aliases = new Map<string, string>();
  for (const group of groups) {
    for (const [key, target] of Object.entries(group)) {
      const prefix = key.replace(/\/\*$/, '').replace(/\/$/, '');
      const destination = target.replace(/\/\*$/, '');
      if (!prefix || prefix.includes('*') || destination.includes('*')) {
        throw new Error('FSD aliases must be exact prefixes, optionally ending in /*.');
      }
      aliases.set(prefix, destination);
    }
  }
  return [...aliases].sort(([a], [b]) => b.length - a.length);
};

export function createFsdPolicy(cwd: string, options: FsdOptions = {}) {
  const layers = options.layers ?? DEFAULT_FSD_LAYERS;
  const ranks = new Map(layers.map((layer, index) => [layer, index]));
  const segmentlessLayers = options.segmentlessLayers ?? ['app', 'shared'];
  const publicApiFiles = options.publicApiFiles ?? ['index'];
  const sharedModuleSegments = options.sharedModuleSegments ?? ['ui', 'lib'];
  const roots: Root[] = (options.roots ?? ['src'])
    .map((root) => {
      const definition = typeof root === 'string' ? { path: root } : root;
      return {
        path: resolvePath(cwd, definition.path),
        aliases: normalizeAliases({ '@': '.', '~': '.' }, options.aliases ?? {}, definition.aliases ?? {}),
      };
    })
    // oxlint-disable-next-line unicorn/no-array-sort -- map으로 생성한 새 배열만 정렬하므로 입력을 변경하지 않습니다.
    .sort((a, b) => b.path.length - a.path.length);
  if (new Set(roots.map((root) => root.path)).size !== roots.length) {
    throw new Error('FSD roots must resolve to different directories.');
  }
  const ignored = (options.ignore ?? []).map((prefix) => {
    const normalized = toPosixPath(prefix).replace(/^\.\//, '').replace(/\/$/, '');
    if (!normalized || normalized.startsWith('/') || normalized.includes('*') || normalized.split('/').includes('..')) {
      throw new Error("FSD ignore paths must be root-relative file/directory prefixes without globs or '..'.");
    }
    return normalized;
  });
  const isPublicFile = (name: string): boolean => publicApiFiles.includes(withoutExtension(name));

  function locate(filename: string): FsdLocation | undefined {
    const absolute = resolvePath(cwd, filename);
    const root = roots.find((candidate) => isWithin(candidate.path, absolute));
    if (!root) return undefined;
    const relative = absolute.slice(root.path.length).replace(/^\//, '');
    if (ignored.some((prefix) => isWithin(prefix, relative))) return undefined;
    const parts = relative.split('/').filter(Boolean);
    const layer = parts[0];
    if (!layer || !ranks.has(layer)) return undefined;
    const segmentless = segmentlessLayers.includes(layer);
    const scope = parts.slice(0, 2);
    // Shared UI/lib modules may each have an index, avoiding one large segment barrel.
    if (
      layer === 'shared' &&
      sharedModuleSegments.includes(parts[1] ?? '') &&
      parts[2] &&
      !isFile(parts[2]) &&
      !isPublicFile(parts[2])
    ) {
      scope.push(parts[2]);
    }
    return { root: root.path, layer, parts, slice: segmentless ? undefined : parts[1], scope, segmentless };
  }

  function resolveImport(source: string, importer: FsdLocation, filename: string): FsdLocation | undefined {
    if (source.startsWith('.')) return locate(resolvePath(resolvePath(filename, '..'), source));
    if (path.posix.isAbsolute(source) || path.win32.isAbsolute(source)) return locate(source);
    const root = roots.find((candidate) => candidate.path === importer.root);
    if (!root) return undefined;
    for (const [alias, target] of root.aliases) {
      if (source === alias || source.startsWith(alias + '/')) {
        return locate(resolvePath(resolvePath(root.path, target), source.slice(alias.length).replace(/^\//, '')));
      }
    }
    // Bare specifiers are npm packages unless explicitly mapped by the consumer.
    return undefined;
  }

  const sameSlice = (from: FsdLocation, to: FsdLocation): boolean =>
    from.root === to.root && from.layer === to.layer && from.slice !== undefined && from.slice === to.slice;
  const sameScope = (from: FsdLocation, to: FsdLocation): boolean =>
    from.root === to.root && from.scope.join('/') === to.scope.join('/');
  const sharedSegmentEntrypoint = (from: FsdLocation, to: FsdLocation): boolean =>
    from.root === to.root &&
    from.layer === 'shared' &&
    to.layer === 'shared' &&
    from.scope.length === 2 &&
    to.scope.length === 3 &&
    from.parts[1] === to.parts[1] &&
    from.parts.length === 3 &&
    isPublicFile(from.parts[2] ?? '');
  const entityCrossApi = (from: FsdLocation, to: FsdLocation): boolean =>
    (options.allowEntityCrossImports ?? true) &&
    from.root === to.root &&
    from.layer === 'entities' &&
    to.layer === 'entities' &&
    from.slice !== to.slice &&
    to.parts.length === 4 &&
    to.parts[2] === '@x' &&
    withoutExtension(to.parts[3] ?? '') === from.slice;

  function checkLayers(from: FsdLocation, to: FsdLocation): FsdViolation | undefined {
    if ((ranks.get(to.layer) ?? -1) > (ranks.get(from.layer) ?? -1)) {
      return { messageId: 'invalidDirection', data: { fromLayer: from.layer, toLayer: to.layer } };
    }
    if (
      from.layer === to.layer &&
      !sameSlice(from, to) &&
      !(from.segmentless && from.root === to.root) &&
      !entityCrossApi(from, to) &&
      !options.allowCrossSliceSameLayer &&
      !(options.allowCrossSliceLayers ?? []).includes(from.layer)
    ) {
      return {
        messageId: 'crossSliceSameLayer',
        data: {
          fromLayer: from.layer,
          fromSlice: from.slice ?? from.scope[1] ?? '',
          toLayer: to.layer,
          toSlice: to.slice ?? to.scope[1] ?? '',
        },
      };
    }
    return undefined;
  }

  function checkPublicApi(from: FsdLocation, to: FsdLocation, isReexport = false): FsdViolation | undefined {
    if ((options.publicApiIgnoreLayers ?? []).includes(to.layer)) return undefined;
    if (sameScope(from, to) || entityCrossApi(from, to)) return undefined;
    // A Shared segment barrel defines its API by re-exporting its own child modules.
    if (isReexport && sharedSegmentEntrypoint(from, to)) return undefined;
    const remainder = to.parts.slice(to.scope.length);
    const publicScope = to.scope.length >= 2 && !isFile(to.scope[to.scope.length - 1] ?? '');
    if (publicScope && (remainder.length === 0 || (remainder.length === 1 && isPublicFile(remainder[0] ?? '')))) {
      return undefined;
    }
    return { messageId: 'usePublicApi', data: { layer: to.layer, publicName: to.scope.slice(1).join('/') } };
  }

  function checkStructure(location: FsdLocation): FsdViolation | undefined {
    if ((options.ignoreLayers ?? []).includes(location.layer)) return undefined;
    const { parts, layer, segmentless } = location;
    const filename = parts[parts.length - 1] ?? '';
    if (segmentless) {
      if (parts.length >= 3 || (parts.length === 2 && isPublicFile(filename))) return undefined;
      return { messageId: 'missingSegment', data: { layer, slice: '' } };
    }
    if (parts.length < 3) {
      return { messageId: 'missingSlice', data: { layer } };
    }
    if (parts.length === 3 && !isPublicFile(filename)) {
      return { messageId: 'missingSegment', data: { layer, slice: parts[1] ?? '' } };
    }
    return undefined;
  }

  return { locate, resolveImport, checkLayers, checkPublicApi, checkStructure };
}
