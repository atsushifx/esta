// src: configs/tsup.config.module.ts
// @(#) : Tsup configuration for ESM build output
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// system config
import { defineConfig } from 'tsup';

// user config
import { baseConfig } from '../../../../base/configs/tsup.config.base';

export default defineConfig({
  ...baseConfig,
  // sub-packages definition
  format: ['esm'],
  outDir: 'module', // for ESM
  // tsconfig
  tsconfig: './tsconfig.json',
});
