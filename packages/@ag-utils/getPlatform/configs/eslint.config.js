// src: configs/eslint.config.js
// @(#) : ESLint flat config for TypeScript workspace
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import path from 'path';

// plugins
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

// import form common base config
import baseConfig from '../../../../shared/configs/eslint.config.base.js';
// settings
export default [
  {
    ignores: [
      'lib/**',
      'module/**',
      'node_modules/**',
      '.cache/**',
    ],
  },

  ...baseConfig,

  // source codes
  {
    files: [
      'src/**/*.ts',
      'types/**/*.ts',
      'test/**/*.ts',
    ],
    languageOptions: {
      globals: {
        'NodeJS': 'readonly',
      },
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: path.resolve(),
      },
    },
  },
  // setting files
  {
    files: [
      '*.config*.ts',
      '*.config*.js',
    ],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: false, // 型チェックを無効化
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/order': 'warn',
    },
  },
];
