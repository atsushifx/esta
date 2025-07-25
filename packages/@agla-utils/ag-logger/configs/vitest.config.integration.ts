// src: shared/common/configs/vitest.config.integration.ts
// @(#) : vitest config for integration test
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs for base directory
import path, { dirname } from 'path';
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
      // CI (Integration) Tests
      'tests/integration/**/*.test.ts',
      'tests/integration/**/*.spec.ts',
    ],
    exclude: [
      '**/__tests__/*',
    ],
    caches: {
      dir: path.resolve(__dirname, '../../../.cache/vitest-cache/integration/'),
    },
    // parallel test
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
