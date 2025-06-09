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

// projects
import projectPaths from './eslint.projects.js';
// base Config
import baseConfig from '../shared/configs/eslint.config.base.js';

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
        project: projectPaths,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          tsconfigRootDir: rootDir,
          project: projectPaths,
          noWarnOnMultipleProjects: true,
        },
      },
    },
  },
];
