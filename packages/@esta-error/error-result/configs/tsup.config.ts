// src: configs/tsup.config.ts
// @(#) : tsup config for CommonJS module
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Build configuration utility
import { defineConfig } from 'tsup';
// Base build configuration
import { baseConfig } from '../../../../base/configs/tsup.config.base';

export default defineConfig({
  ...baseConfig,

  // sub packages definition
  format: ['cjs'],
  outDir: 'lib', // for CJS
  // tsconfig
  tsconfig: './tsconfig.json',
});
