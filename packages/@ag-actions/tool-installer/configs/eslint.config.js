// src: configs/eslint.config.js
// @(#) : ESLint flat config for TypeScript workspace
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// import form common base config
import baseConfig from '../../../../shared/configs/eslint.config.base.js';

// set __dirname for ESM
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../');

// settings
export default [
  ...baseConfig,

  // source code settings
  {
    files: [
      'src/**/*.ts',
      'shared/**/*.ts',
      'tests/**/*.ts',
    ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: rootDir,
        project: path.resolve(rootDir, './tsconfig.json'),
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          tsconfigRootDir: rootDir,
          project: path.resolve(rootDir, './tsconfig.json'),
        },
      },
    },
  },
];
