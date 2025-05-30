// src: configs/eslint.config.js
// @(#) : ESLint flat config for TypeScript workspace
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
import baseConfig from '../shared/configs/eslint.config.base.js';
import projectPaths from '../shared/configs/eslint.projects.js';

// set __dirname for ESM
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../');

// settings
export default [
  ...baseConfig,

  // source code settings
  {
    files: [
      'shared/common/**/*.ts',
      'packages/**/src/**/*.ts',
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        tsconfigRootDir: rootDir,
        project: ['./tsconfig.json'],
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          tsconfigRootDir: rootDir,
          project: [
            './tsconfig.json',
            'shared/common/tsconfig.json',
            './packages/@ag-utils/get-platform/tsconfig.json',
            './packages/@ag-utils/command-utils/tsconfig.json',
            './packages/@ag-utils/common/tsconfig.json',
            './packages/@aglabo-actions/tool-installer/tsconfig.json',
          ],
        },
      },
    },
  },
];
