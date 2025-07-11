// src: ./configs/vitest.config.ci.ts
// @(#) : vitest config for integration test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
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
import baseConfig from '../../../../base/configs/vitest.config.base';

// config
export default mergeConfig(baseConfig, {
  test: {
    include: [
      // CI Tests
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts',
      // Example E2E Tests
      'example/e2e/**/*.test.ts',
      'example/e2e/**/*.spec.ts',
    ],
    caches: {
      dir: path.resolve(__dirname, '../../../../.cache/vitest-cache/ci/'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
});
