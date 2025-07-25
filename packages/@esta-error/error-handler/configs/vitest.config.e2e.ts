// src: shared/common/configs/vitest.config.e2e.ts
// @(#) : vitest config for end-to-end test
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

// shared base config
import baseConfig from '../../../../base/configs/vitest.config.base';

// config
export default mergeConfig(baseConfig, {
  test: {
    include: [
      // CI (End-to-End) Tests
      'tests/e2e/**/*.test.ts',
      'tests/e2e/**/*.spec.ts',
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
