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

export default defineConfig({
  ...baseConfig,
  clean: true,
  format: ['esm'],
  entry: [
    'src/index.ts',
  ],
  tsconfig: './tsconfig.json',
  outDir: 'module', // for ESM
});
