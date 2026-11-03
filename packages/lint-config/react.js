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
    // Vercel React Best Practices 중 구문으로 검사할 수 있는 성능·구조 규칙입니다.
    'react/no-object-type-as-default-prop': 'warn',
    'import/no-dynamic-require': ['error', { esmodule: true }],
    'unicorn/prefer-set-has': 'warn',
    'unicorn/no-array-sort': ['warn', { allowAfterSpread: true, allowExpressionStatement: false }],
  },
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: ['**/dist/**', '**/build/**', '**/coverage/**', '**/storybook-static/**', '**/.turbo/**'],
});
