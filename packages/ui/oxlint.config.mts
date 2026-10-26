import { defineConfig } from 'oxlint';
import react from '@repo/lint-config/react';

export default defineConfig({
  ...react,
  overrides: [
    {
      files: ['src/base/**'],
      // Iris 코어에는 프로젝트의 성능·구조 컨벤션을 적용하지 않습니다.
      rules: {
        'plugin-lifecycle/single-effect': 'off',
        'react/no-object-type-as-default-prop': 'off',
        'import/no-dynamic-require': 'off',
        'unicorn/prefer-set-has': 'off',
        'unicorn/no-array-sort': 'off',
      },
    },
  ],
});
