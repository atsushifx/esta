// src: ./src/index.ts
// @(#) : @esta-core: ESTA Feature Flags
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
export * from '../shared/types/featureFlags';

// functions
import { estaFeatures, initEstaFeatures } from './initFeatureFlags';
export { estaFeatures, initEstaFeatures };

// default
export default estaFeatures;
