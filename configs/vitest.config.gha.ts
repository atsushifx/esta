// src: ./configs/vitest.config.ci.ts
// @(#) : vitest config for e2e test
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

// plugins
import tsconfigPaths from 'vite-tsconfig-paths';

// user common config
import baseConfig from '../shared/configs/vitest.config.base';

// config
export default mergeConfig(baseConfig, {
  plugins: [tsconfigPaths()],
  test: {
    include: [
      // CI Tests
      'packages/@ag-utils/e2e-fixture-framework/tests/**/*.test.ts',
      'packages/@ag-utils/e2e-fixture-framework/tests/**/*.spec.ts',
    ],
    exclude: [
      '**/e2e/fixtures/**',
    ],
    testTimeout: 10000,
    caches: {
      dir: path.resolve(__dirname, '.cache/vitest-cache/ci/'),
    },
    reporters: ['default', 'junit'], // CIでのレポート出力も有効にする例
    outputFile: 'test-results/results.xml', // JUnitレポート出力先
  },
  resolve: {
    alias: {},
  },
});
