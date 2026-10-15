import { defineConfig } from 'oxfmt';

export default defineConfig({
  singleQuote: true,
  jsxSingleQuote: false,
  semi: true,
  useTabs: false,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 120,
  bracketSameLine: false,
  ignorePatterns: ['**/dist/**', '**/build/**', '**/coverage/**', '**/storybook-static/**', '**/.turbo/**'],
});
