// src: /src/index.ts
// @(#) : ag-logger package exports
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
export { AgLogLevel, AgLogLevelCode } from '@shared/types';

// classes
export { AgLogger } from './AgLogger.class';
export { ConsoleLogger } from './ConsoleLogger.class';

// utilities
export { agLog, agLogMessage } from './AgLogUtils';
