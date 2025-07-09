// src: /src/index.ts
// @(#) : ag-logger package exports
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * @packageDocumentation
 * @module ag-logger
 *
 * This module exports the main APIs of the ag-logger package.
 * It includes log level constants, the core logger class,
 * various logger and formatter plugins, and utility functions.
 */

// types
export { AgLogLevel, AgLogLevelCode } from '@shared/types';

// logger main
export { AgLogger, getLogger } from './AgLogger.class';

// plugins: logger
export { ConsoleLogger } from './plugins/logger/ConsoleLogger';
export { E2eMockLogger } from './plugins/logger/E2eMockLogger';
export { NullLogger } from './plugins/logger/NullLogger';

// plugins: format
export { JsonFormat } from './plugins/format/JsonFormat';
export { NullFormat } from './plugins/format/NullFormat';
export { PlainFormat } from './plugins/format/PlainFormat';

// utilities
export { AgLoggerGetMessage } from './utils/AgLoggerGetMessage';
