// src: ./shared/types/featureFlags.ts
// @(#) : ESTA Feature Flags
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import { DISABLE, ENABLE } from '@shared/constants';

export enum TEstaExecutionMode {
  'GITHUB_ACTIONS' = 'GHA',
  'CLI' = 'CLI',
}

export type TEstaFeatureFlags = {
  executionMode: TEstaExecutionMode;
};
