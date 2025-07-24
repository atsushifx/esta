// src: commitlint.config.ts
// @(#) : commitlint configuration for this workspace
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Commitlint configuration type definitions
import type { UserConfig } from '@commitlint/types';
// Base commitlint configuration
import { default as baseConfig } from '../../../../base/configs/commitlint.config.base';

const config: UserConfig = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // write rules if necessary
    // 'header-max-length': [2, 'always', 72], etc
  },
};

export default config;
