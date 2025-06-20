// src: ./configs/vitest.config.unit.ts
// @(#) : vitest config for unit test
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs for base directory
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
// base directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// system config
import { mergeConfig } from 'vitest/config';

// user common config
import baseConfig from '../../../../shared/configs/vitest.config.base';

// config
export default mergeConfig(baseConfig, {
  test: {
    include: [
      // Unit Test (develop test) exec only sub repositories
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
    ],
    caches: {
      dir: path.resolve(__dirname, '../../../../.cache/vitest-cache/unit'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
});
