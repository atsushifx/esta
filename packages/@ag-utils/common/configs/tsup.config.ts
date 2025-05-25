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
  clean: true,
  format: ['cjs', 'esm'],
  entry: [
    'src/**/*',
    // exclude tests
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/tests/**',
  ],
  dts: {
    entry: 'src/index.ts',
    resolve: true,
  },
  tsconfig: './tsconfig.json',
  outDir: 'lib', // for CJS
});
