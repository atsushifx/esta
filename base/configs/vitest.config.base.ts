// src: shared/configs/vitest.config.base.ts
// @(#) : vitest base configuration
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { defineConfig } from 'vitest/config';

// configs
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      // NOTE: DO NOT ENABLE THESE HERE unless you want ALL tests to run in every subpackage.
      // Recommended: define test.include in each sub-package's vitest.config.*
      // Examples:
      //   - For unit tests only: 'src/**/*.spec.ts'
      //   - For CI-wide tests: 'tests/**/*.spec.ts'
      //
      // Unit Test (develop test) : set these sub-packages vitest.config.unit.ts
      // 'src/**/*.test.ts',
      // 'src/**/*.spec.ts',
      // CI Tests (integration test) : set these sub-packages vitest.config.ci.ts
      // 'tests/**/*.test.ts',
      // 'tests/**/*.spec.ts',
    ],
    exclude: [
      'node_modules/**',
      // 出力ディレクトリ
      'dist/**',
      'lib/**',
      'module/**',
      // キャッシュ
      '.cache/**',
      // コメントアウト
      `**/#*.ts`,
      `**/#*tests*`,
    ],
    coverage: {
      reporter: ['text', 'json-summary'],
    },
  },
  resolve: {
    // set on sub-packages configs
    alias: {},
  },
});
