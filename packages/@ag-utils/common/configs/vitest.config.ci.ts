// src: ./configs/vitest.config.unit.ts
// @(#) : vitest config for integration test
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// system config
import { defineConfig } from 'vitest/config';

// user common config
import baseConfig from '../../../../shared/configs/vitest.config.base';

// constants
const __dirname = dirname(fileURLToPath(import.meta.url));

// config
export default defineConfig({
  ...baseConfig,
  plugins: [],
  test: {
    ...baseConfig.test,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
