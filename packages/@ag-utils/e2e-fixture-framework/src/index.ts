// src: ./framework/index.ts
// Test Framework Exports
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// --- Types ---
export * from '@shared/types';

// --- Core Functionality ---
// Class for running and validating fixture tests.
export * from './fixtureRunner';

// --- Utilities ---
// Utility class for file I/O operations.
export * from './io';
// Functions for scanning and discovering test cases.
export * from './AgE2eTestDiscovery';

// --- Validators ---
// Classes for validating test results.
export * from './validators';
