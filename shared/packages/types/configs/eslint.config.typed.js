// src: shared/common/configs/eslint.config.typed.js
// @(#) : ESLint flat config for type check
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// resolve root directory
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// directories
const __dirname = dirname(fileURLToPath(import.meta.url));
const __rootDir = path.resolve(__dirname, '..');

// parser
import tsparser from '@typescript-eslint/parser';

// import form common base config
import baseConfig from '../../../../base/configs/eslint.config.typed.base.js';

export default [
  ...baseConfig,

  // --- source codes settings
  {
    files: [
      'index.ts',
      'src/**/*.ts',
      'types/**/*.ts',
      'tests/**/*.ts',
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __rootDir,
        sourceType: 'module',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
];
