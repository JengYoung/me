import { fileURLToPath } from 'node:url';
import { definePlugin } from '@oxlint/plugins';
import { defineConfig } from 'oxlint';
import { type FsdOptions, HERMES_OPTIONS } from './options.ts';
import fsdLayerImports from './rules/fsd-layer-imports.ts';
import fsdPublicApi from './rules/fsd-public-api.ts';
import fsdSliceSegments from './rules/fsd-slice-segments.ts';

export type { FsdOptions, FsdRoot } from './options.ts';

const plugin = definePlugin({
  meta: { name: 'fsd' },
  rules: {
    'fsd-layer-imports': fsdLayerImports,
    'fsd-public-api': fsdPublicApi,
    'fsd-slice-segments': fsdSliceSegments,
  },
});

export function createConfig(options: FsdOptions = {}, namespace = 'fsd') {
  return defineConfig({
    jsPlugins: [{ name: namespace, specifier: fileURLToPath(import.meta.url) }],
    rules: Object.fromEntries(
      Object.keys(plugin.rules).map((rule) => [namespace + '/' + rule, ['error', options] as ['error', FsdOptions]]),
    ),
  });
}

export const configs = {
  recommended: createConfig(),
  hermes: createConfig(HERMES_OPTIONS, 'hermes'),
};

export default plugin;
