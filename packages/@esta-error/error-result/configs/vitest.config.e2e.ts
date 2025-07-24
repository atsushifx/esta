// src: shared/common/configs/vitest.config.e2e.ts
// @(#) : vitest config for end-to-end test
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Path utilities for directory resolution
import path from 'path';
import { dirname } from 'path';
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
      // CI (End-to-End) Tests
      'tests/e2e/**/*.test.ts',
      'tests/e2e/**/*.spec.ts',
    ],
    exclude: [
      '**/__tests__/+.spec.ts',
      '**/__tests__/+.test.ts',
    ],
    caches: {
      dir: path.resolve(__dirname, '../../../.cache/vitest-cache/e2e/'),
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
