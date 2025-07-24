// src: configs/tsup.config.module.ts
// @(#) : tsup config for esm module
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Build configuration utility
import { defineConfig } from 'tsup';
// Base build configuration
import { baseConfig } from '../../../../base/configs/tsup.config.base';

// configs
export default defineConfig({
  ...baseConfig,

  // sub-packages definition
  format: ['esm'],
  outDir: 'module', // for ESM
  // tsconfig
  tsconfig: './tsconfig.json',
});
