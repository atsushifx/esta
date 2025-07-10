// src: ./configs/eslint.projects.js
// @(#) : ESLint project path configuration list
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default [
  // for OSS Utils
  './packages/@agla-e2e/fileio-framework/tsconfig.json',
  './packages/@agla-utils/ag-logger/tsconfig.json',
  // shared packages
  './shared/packages/constants/tsconfig.json',
  './shared/packages/types/tsconfig.json',
  // esta-core
  'packages/@esta-core/feature-flags/tsconfig.json',
  'packages/@esta-core/error-handler/tsconfig.json',
  // esta-system
  'packages/@esta-system/exit-status/tsconfig.json',
  // utils
  './packages/@esta-utils/utils/tsconfig.json',
  './packages/@esta-utils/command-utils/tsconfig.json',
  './packages/@esta-utils/get-platform/tsconfig.json',
  './packages/@esta-utils/config-loader/tsconfig.json',
  // gha modules
  './packages/@esta-actions/tools-installer/tsconfig.json',
  // main
  './tsconfig.json',
];
