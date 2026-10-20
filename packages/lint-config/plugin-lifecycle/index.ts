import { fileURLToPath } from 'node:url';
import { definePlugin } from '@oxlint/plugins';
import { defineConfig } from 'oxlint';
import singleEffect from './single-effect.ts';

const plugin = definePlugin({
  meta: { name: 'plugin-lifecycle' },
  rules: { 'single-effect': singleEffect },
});

export function createConfig() {
  return defineConfig({
    jsPlugins: [{ name: 'plugin-lifecycle', specifier: fileURLToPath(import.meta.url) }],
    rules: { 'plugin-lifecycle/single-effect': 'error' },
  });
}

export default plugin;
