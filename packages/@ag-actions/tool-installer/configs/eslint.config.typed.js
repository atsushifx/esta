// src: configs/eslint.config.typed.js
// @(#) : eslint float config for type check
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// parser
import tsparser from '@typescript-eslint/parser';

// import form common base config
import baseConfig from '../../../../shared/configs/eslint.config.typed.base.js';

// directories
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// eslint configs
export default [
  ...baseConfig,

  // source codes settings
  {
    files: [
      'src/**/*.ts',
      'shared/**/*.ts',
      'tests/**/*.ts',
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: rootDir,
        sourceType: 'module',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
          tsconfigRootDir: rootDir,
        },
      },
    },
  },
];
