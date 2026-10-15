export type FsdRoot = {
  path: string;
  /** Alias targets are relative to this FSD root, not the process cwd. */
  aliases?: Record<string, string>;
};

/** Policy shared by the Oxlint FSD rules. */
export type FsdOptions = {
  roots?: (string | FsdRoot)[];
  aliases?: Record<string, string>;
  /** Lowest to highest. Deprecated "processes" is opt-in. */
  layers?: string[];
  segmentlessLayers?: string[];
  allowCrossSliceLayers?: string[];
  allowCrossSliceSameLayer?: boolean;
  allowEntityCrossImports?: boolean;
  /** Root-relative file/directory prefixes, not globs. Applies to both ends of an import. */
  ignore?: string[];
  /** Only affects the structure rule. */
  ignoreLayers?: string[];
  /** Target layers that do not require public entrypoints; layer direction is still checked. */
  publicApiIgnoreLayers?: string[];
  /** Public entrypoint basenames, without extensions. */
  publicApiFiles?: string[];
  /** Shared segments whose child modules may expose their own public API. */
  sharedModuleSegments?: string[];
};

export const DEFAULT_FSD_LAYERS = ['shared', 'entities', 'features', 'widgets', 'pages', 'app'];

export const HERMES_OPTIONS: FsdOptions = {
  layers: ['shared', 'entities', 'features', 'widgets', 'pages', 'processes', 'app'],
  allowCrossSliceLayers: ['widgets', 'pages', 'processes', 'app'],
  ignoreLayers: ['shared', 'app'],
};

const names = {
  type: 'array',
  items: { type: 'string', pattern: '^[^/\\\\.*]+$' },
  uniqueItems: true,
};
const aliases = {
  type: 'object',
  additionalProperties: { type: 'string', minLength: 1 },
};

export const optionSchema = {
  type: 'object',
  properties: {
    roots: {
      type: 'array',
      minItems: 1,
      items: {
        anyOf: [
          { type: 'string', minLength: 1 },
          {
            type: 'object',
            properties: { path: { type: 'string', minLength: 1 }, aliases },
            required: ['path'],
            additionalProperties: false,
          },
        ],
      },
    },
    aliases,
    layers: { ...names, minItems: 1 },
    segmentlessLayers: names,
    allowCrossSliceLayers: names,
    allowCrossSliceSameLayer: { type: 'boolean' },
    allowEntityCrossImports: { type: 'boolean' },
    ignore: { type: 'array', items: { type: 'string', minLength: 1 }, uniqueItems: true },
    ignoreLayers: names,
    publicApiIgnoreLayers: names,
    publicApiFiles: { ...names, minItems: 1 },
    sharedModuleSegments: names,
  },
  additionalProperties: false,
} as const;
