// src: /shared/configs/eslint.config.typed.base.js
// @(#) : ESLint flat config for check TypeScript types.
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// -- import
// rules
import js from '@eslint/js';
// plugins
import tseslint from '@typescript-eslint/eslint-plugin';
// parser
import tsparser from '@typescript-eslint/parser';
// importer
import importPlugin from 'eslint-plugin-import';

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
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: '.',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: typedRules,
  },
];
