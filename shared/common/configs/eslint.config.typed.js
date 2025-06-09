// src: configs/eslint.config.typed.js
// @(#) : eslint float config for type check
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// parser
import tsparser from '@typescript-eslint/parser';

// import form common base config
import baseConfig from '../../../shared/configs/eslint.config.typed.base.js';

export default [
  ...baseConfig,

  // --- source codes settings
  {
    files: [
      'index.ts',
      'constants/**/*.ts',
      'types/**/*.ts',
    ],
    languageOptions: {
      parser: tsparser,
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
