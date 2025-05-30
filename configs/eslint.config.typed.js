// src: /configs/eslint.config.typed.js
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

// plugins
import tseslint from '@typescript-eslint/eslint-plugin';
// parser
import tsparser from '@typescript-eslint/parser';

// import form common base config
import projectPaths from '../shared/configs/eslint.projects.js';
import typedRules from '../shared/configs/eslint.rules.typed.js';

// directories
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// eslint configs
export default [
  {
    files: [
      'shared/**/*.ts',
      'packages/**/*.ts',
    ],
    ignores: [
      '*lib/**',
      '**/module/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/.cache/**',
      '**/configs/**',
    ],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: projectPaths,
        tsconfigRootDir: rootDir,
        sourceType: 'module',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: projectPaths,
          tsconfigRootDir: rootDir,
        },
      },
    },
    rules: typedRules,
  },
];
