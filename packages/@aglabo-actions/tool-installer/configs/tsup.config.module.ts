// src: configs/tsup.config.module.ts
// @(#) : tsup config for esm module
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// system config
import { defineConfig } from 'tsup';

// user config
import { baseConfig } from '../../../../shared/configs/tsup.config.base';

// configs
export default defineConfig({
  ...baseConfig,

  // sub-packages definition
  format: ['esm'],
  outDir: 'module', // for ESM
  // tsconfig
  tsconfig: './tsconfig.json',
});
