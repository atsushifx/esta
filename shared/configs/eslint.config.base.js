// src: /shared/configs/eslint.config.base.js
// @(#) : ESLint flat config for TypeScript workspace
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
// tsconfig.jsonのパスを絶対パスで指定
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// constants
const __dirname = dirname(fileURLToPath(import.meta.url));

// eslint plugin
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
//
import importPlugin from 'eslint-plugin-import';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // JavaScriptの推奨設定を統合
  js.configs.recommended,

  {
    files: ['src/**/*.ts', 'tests/**/*.ts', 'types/**/*.ts'],
    ignores: ['**/lib/**', '**/module/**', '**/dist/**', '**/node_modules/**', '**/.cache/**'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': importPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import/no-unresolved': 'error',
      'import/order': ['warn', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true,
        },
      }],
      'func-style': ['error', 'expression'],
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
        },
        node: {
          moduleDirectory: ['node_modules', 'src/'],
        },
      },
    },
  },
];
