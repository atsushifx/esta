// src: shared/common/configs/vitest.config.unit.ts
// @(#) : vitest config for unit test
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Path utilities for directory resolution
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
// base directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// Vitest configuration utilities
import { mergeConfig } from 'vitest/config';
// Base vitest configuration
import baseConfig from '../../../../base/configs/vitest.config.base';

// config
export default mergeConfig(baseConfig, {
  test: {
    include: [
      // Unit Test (develop test) exec only sub repositories
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
    ],
    caches: {
      dir: path.resolve(__dirname, '../../../.cache/vitest-cache/unit/'),
    },
    sequence: {
      concurrent: false, // Unit tests are run sequentially to avoid conflicts
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
});
