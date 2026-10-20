import { defineConfig } from 'oxlint';
import react from '@repo/lint-config/react';

export default defineConfig({
  ...react,
  overrides: [
    {
      files: ['src/base/**'],
      // Iris 코어에는 프로젝트의 컴포넌트 구조 규칙을 적용하지 않습니다.
      rules: { 'plugin-lifecycle/single-effect': 'off' },
    },
  ],
});
