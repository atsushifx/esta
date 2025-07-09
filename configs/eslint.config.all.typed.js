// src: ./configs/eslint.config.all.typed.js
// @(#) : ESLint typed configuration for TypeScript type checking
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
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

import projectPaths from './eslint.projects.js';
// common rules
import typedRules from '../base/configs/eslint.rules.typed.js';

// directories
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// eslint configs
export default [
  {
    files: [
      'packages/**/*.ts',
      'shared/packages/**/*.ts',
    ],
    ignores: [
      '**/lib/**',
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
          noWarnOnMultipleProjects: true,
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          moduleDirectory: ['node_modules', 'src/'],
        },
      },
    },
    rules: typedRules,
  },
];
