// src: /shared/configs/eslint.config.base.js
// @(#) : ESLint flat base config : project easy-setup-tools
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

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // --- JavaScript rules
  js.configs.recommended,

  // --- 1. common ignores
  {
    ignores: [
      '**/lib/**',
      '**/module/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/.cache/**',
    ],
  },

  // --- 2. rule definition
  {
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // project: ['./tsconfig.json'], // every package has its own tsconfig.json,
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        NodeJS: 'readonly',
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
      'import/order': 'off',
      'func-style': ['error', 'expression'],
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          moduleDirectory: ['node_modules', 'src/'],
        },
      },
    },
  },
];
