// src: ./configs/vitest.config.ci.ts
// @(#) : vitest config for integration test
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
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
import baseConfig from '../../../../base/configs/vitest.config.base';

// config
export default mergeConfig(baseConfig, {
  test: {
    include: [
      // CI Tests
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts',
    ],
    caches: {
      dir: path.resolve(__dirname, '../../../../.cache/vitest-cache/ci/'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@shared/types': path.resolve(__dirname, '../shared/types'),
      '@shared/constants': path.resolve(MonorepoRoot, 'shared/common/constants'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@esta-utils/get-platform': path.resolve(MonorepoRoot, 'packages/@esta-utils/get-platform/src'),
      '@esta-utils/command-utils': path.resolve(MonorepoRoot, 'packages/@esta-utils/command-utils/src'),
    },
  },
});
