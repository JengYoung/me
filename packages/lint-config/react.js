import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['typescript', 'unicorn', 'oxc', 'react', 'jsx-a11y', 'import'],
  categories: {
    correctness: 'error',
  },
  rules: {
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
