// src: configs/eslint.config.js
// @(#) : ESLint flat config for TypeScript workspace
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// parser

// import form common base config
import baseConfig from '../shared/configs/eslint.config.base.js';

// settings
export default [
  ...baseConfig,

  // source code settings
  {
    files: [
      'packages/**/src/**/*.ts',
      'shared/common/**/*.ts',
    ],
    settings: {
      'import/resolver': {
        typescript: {
          project: [
            './packages/@ag-utils/common/tsconfig.json',
            './packages/@ag-utils/command-utils/tsconfig.json',
            './packages/@ag-utils/get-platform/tsconfig.json',
            './packages/@aglabo-actions/tool-installer/tsconfig.json',
            './shared/common/tsconfig.json',
            './tsconfig.json',
          ],
          alwaysTryTypes: true,
        },
      },
    },
  },
];
