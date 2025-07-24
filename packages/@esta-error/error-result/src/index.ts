// src: index.ts
// @(#) : main entry point for error-result package
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// export constants
export * from '../shared/constants';
// export types and interfaces
export * from '../shared/types';
// export function results
export * from './errors/ErrorResult';
export * from './errors/TupleResult';
// export factories
export * from './handlers/ErrorResultFactory';
