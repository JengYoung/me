import { defineConfig } from 'oxfmt';
import react from '@repo/format-config/react';

export default defineConfig({
  ...react,
  ignorePatterns: [...react.ignorePatterns, 'src/base/**'],
});
