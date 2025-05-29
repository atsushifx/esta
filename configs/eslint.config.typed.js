// src: configs/eslint.config.typed.js
// @(#) : eslint float config for type check
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import form common base config
import baseConfig from '../shared/configs/eslint.config.typed.base.js';

export default [
  ...baseConfig,
  // --- source code
  // source codes settings
  {
    files: [
      'packages/**/src/**/*.ts',
      'shared/common/**/*.ts',
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: '.',
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
