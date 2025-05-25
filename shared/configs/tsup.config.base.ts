// src: /shared/tsup.config.base.ts
// @(#) : tsup 基本設定
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// types
import type { Options } from 'tsup';

// ✅ __dirname for ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

export const baseConfig: Options = {
  format: ['esm'],
  target: 'es2022',
  clean: true,
  dts: true,
  sourcemap: true,
  minify: false,
  splitting: true,
  shims: false,
  outDir: './lib',
  // overwrite it if sub-packages is necessary
  entry: [
    'src/index.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/tests/**',
  ],
};
