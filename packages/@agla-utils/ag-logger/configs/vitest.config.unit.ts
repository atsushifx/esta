// src: shared/common/configs/vitest.config.unit.ts
// @(#) : vitest config for unit test
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
      // Unit Test (develop test) exec only sub repositories
      '**/__tests__/*.test.ts',
      '**/__tests__/*.spec.ts',
    ],
    caches: {
      dir: path.resolve(__dirname, '../../../.cache/vitest-cache/unit/'),
    },
    // sequential test execution to avoid singleton state conflicts
    sequence: {
      concurrent: false,
    },
    //
    coverage: {
      reporter: ['text'],
      exclude: [
        '**/node_modules/**',
        'configs/**',
        'tests/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
});
