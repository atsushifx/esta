// src: configs/eslint.config.typed.js
// @(#) : eslint float config for type check
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import path from 'path';

// import form common base config
import baseConfig from '../../../../shared/configs/eslint.config.typed.base.js';

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
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', 'types/**.*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: path.resolve(), // 実行ディレクトリ基準
      },
    },
  },
];
