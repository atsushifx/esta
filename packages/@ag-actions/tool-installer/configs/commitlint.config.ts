// src: commitlint.config.ts
// @(#) : commitlint configuration for this workspace
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import commitlint config type
import type { UserConfig } from '@commitlint/types';

// import base Config
import { default as baseConfig } from '../../../../shared/configs/commitlint.config.base.js';

const config: UserConfig = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // write rules if necessary
    // 'header-max-length': [2, 'always', 72], etc
  },
};

export default config;
