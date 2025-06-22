// src: /src/index.ts
// @(#) : ag-logger package exports
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
export { AgLogLevel, AgLogLevelCode } from '@shared/types';

// logger interfaces
export { AgLogger } from './AgLogger.class';
export { ConsoleLogger } from './plugins/logger/ConsoleLogger';

// formatter interfaces
export { NullFormat } from './plugins/format/NullFormat';
export { PlainFormat } from './plugins/format/PlainFormat';

// utilities
export { AgLoggerGetMessage } from './utils/AgLoggerGetMessage';
