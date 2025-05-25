// src: configs/tsup.config.ts
// @(#) : tsup config for CommonJS module
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
  tsconfig: './tsconfig.json',
  outDir: 'lib', // for CJS
});
