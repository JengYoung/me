import { defineConfig } from 'oxlint';
import { createConfig as createPluginLifecycleConfig } from './plugin-lifecycle/index.ts';

const pluginLifecycle = createPluginLifecycleConfig();

export default defineConfig({
  plugins: ['typescript', 'unicorn', 'oxc', 'react', 'jsx-a11y', 'import'],
  jsPlugins: pluginLifecycle.jsPlugins,
  categories: {
    correctness: 'error',
  },
  rules: {
    ...pluginLifecycle.rules,
    'no-unused-vars': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'warn',
  },
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: ['**/dist/**', '**/build/**', '**/coverage/**', '**/storybook-static/**', '**/.turbo/**'],
});
