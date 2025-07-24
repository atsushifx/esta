// src: shared/common/configs/vitest.config.integration.ts
// @(#) : vitest config for integration test
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
      // CI (Integration) Tests
      'tests/integration/**/*.test.ts',
      'tests/integration/**/*.spec.ts',
    ],
    caches: {
      dir: path.resolve(__dirname, '../../../.cache/vitest-cache/integration/'),
    },
    sequence: {
      concurrent: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
});
