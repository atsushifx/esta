// src: ./configs/vitest.config.ci.ts
// @(#) : vitest config for integration test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs : Note path resolver
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Monorepo root directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const MonorepoRoot = path.resolve(__dirname, '../../../../');

// system config
import { mergeConfig } from 'vitest/config';

// user common config
import baseConfig from '../../../../shared/configs/vitest.config.base';

// config
export default mergeConfig(baseConfig, {
  test: {
    include: [
      // CI Tests
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts',
    ],
    cache: {
      dir: path.resolve(__dirname, '../../../../.cache/vitest-cache/ci/'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@shared': path.resolve(MonorepoRoot, 'shared/common'),
    },
  },
});
