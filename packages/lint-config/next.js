import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'oxlint';
import { createConfig } from './fsd/index.ts';
import react from './react.js';

/**
 * @param {{ rootDir?: string, fsd?: import('./fsd/options.ts').FsdOptions }} [options]
 */
export function createNextConfig({ rootDir = process.cwd(), fsd = {} } = {}) {
  const root = resolve(rootDir);
  const roots = fsd.roots ?? ['src', { path: '.', aliases: { '@': 'src', '~': 'src' } }];
  const fsdConfig = createConfig({
    // Keep FSD screens separate from the framework's pages router.
    layers: ['shared', 'entities', 'features', 'widgets', 'screens', 'app'],
    ignoreLayers: ['app'],
    publicApiIgnoreLayers: ['app'],
    ...fsd,
    roots: roots.map((entry) => {
      const definition = typeof entry === 'string' ? { path: entry } : entry;
      return { ...definition, path: resolve(root, definition.path) };
    }),
  });

  return defineConfig({
    ...react,
    plugins: [...react.plugins, 'nextjs'],
    jsPlugins: [
      ...fsdConfig.jsPlugins,
      // These rules have no native equivalent in Oxlint 1.88.0.
      { name: 'next-compat', specifier: fileURLToPath(import.meta.resolve('@next/eslint-plugin-next')) },
      { name: 'hooks-compat', specifier: fileURLToPath(import.meta.resolve('eslint-plugin-react-hooks')) },
      { name: 'turbo', specifier: fileURLToPath(import.meta.resolve('eslint-plugin-turbo')) },
    ],
    env: { ...react.env, serviceworker: true },
    settings: { next: { rootDir: root } },
    ignorePatterns: [...react.ignorePatterns, '**/.next/**', '**/out/**', '**/next-env.d.ts'],
    rules: {
      ...react.rules,
      ...fsdConfig.rules,
      // @next/eslint-plugin-next 16.3.4 core-web-vitals policy.
      'nextjs/google-font-display': 'warn',
      'nextjs/google-font-preconnect': 'warn',
      'nextjs/next-script-for-ga': 'warn',
      'nextjs/no-async-client-component': 'warn',
      'nextjs/no-before-interactive-script-outside-document': 'warn',
      'nextjs/no-css-tags': 'warn',
      'nextjs/no-head-element': 'warn',
      'nextjs/no-html-link-for-pages': 'error',
      'nextjs/no-img-element': 'warn',
      'next-compat/no-location-assign-relative-destination': 'warn',
      'nextjs/no-page-custom-font': 'warn',
      'nextjs/no-styled-jsx-in-document': 'warn',
      'nextjs/no-sync-scripts': 'error',
      'nextjs/no-title-in-document-head': 'warn',
      'nextjs/no-typos': 'warn',
      'nextjs/no-unwanted-polyfillio': 'warn',
      'nextjs/inline-script-id': 'error',
      'nextjs/no-assign-module-variable': 'error',
      'nextjs/no-document-import-in-page': 'error',
      'nextjs/no-duplicate-head': 'error',
      'nextjs/no-head-import-in-document': 'error',
      'nextjs/no-script-component-in-head': 'error',
      // eslint-plugin-react-hooks 7.1.1 recommended policy.
      'react/static-components': 'error',
      'react/use-memo': 'error',
      'react/preserve-manual-memoization': 'error',
      'react/incompatible-library': 'warn',
      'react/immutability': 'error',
      'react/globals': 'error',
      'react/refs': 'error',
      'react/set-state-in-effect': 'error',
      'react/error-boundaries': 'error',
      'react/purity': 'error',
      'react/set-state-in-render': 'error',
      'react/unsupported-syntax': 'warn',
      'hooks-compat/config': 'error',
      'hooks-compat/gating': 'error',
      'turbo/no-undeclared-env-vars': 'warn',
    },
  });
}

export default createNextConfig();
