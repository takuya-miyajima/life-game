import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { ignores: ['node_modules/**', 'dist/**', 'out-tsc/**', '.angular/**', 'playwright-report/**', 'test-results/**'] },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
  },
]);
