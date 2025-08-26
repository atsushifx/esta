// src: shared/configs/eslint.config.typed.base.js
// @(#) : ESLint flat config for TypeScript type checking
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// -- import
// plugins
import tseslint from '@typescript-eslint/eslint-plugin';
// parser
import tsparser from '@typescript-eslint/parser';

// -- rules
import typedRules from './eslint.rules.typed.js';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: [
      '**/*.ts',
    ],
    ignores: [
      '**/lib/**',
      '**/module/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/.cache/**',
      '**/configs/**',
      '**/scripts/**',
    ],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
      },
    },
    rules: typedRules,
  },
];
