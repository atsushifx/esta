// src: shared/common/configs/eslint.config.js
// @(#) : ESLint flat config for TypeScript workspace
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs

// import form common base config
import baseConfig from '../../../../base/configs/eslint.config.base.js';

// settings
export default [
  ...baseConfig,

  // source code settings
  {
    files: [
      'index.ts',
      'src/**/*.ts',
      'types/**/*.ts',
      'tests/**/*.ts',
    ],
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
];
