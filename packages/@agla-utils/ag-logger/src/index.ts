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

// constants
export { AG_LOGLEVEL } from '../shared/types';

// types
export type { AgLogLevel, AgLogLevelLabel } from '../shared/types';

// logger main
export { AgLogger, getLogger } from './AgLogger.class';
export { AgLoggerManager } from './AgLoggerManager.class';

// plugins: logger
export { ConsoleLogger } from './plugins/logger/ConsoleLogger';
export { E2eMockLogger } from './plugins/logger/E2eMockLogger';
export { MockLogger } from './plugins/logger/MockLogger';
export { NullLogger } from './plugins/logger/NullLogger';

// plugins: formatter
export { JsonFormatter } from './plugins/formatter/JsonFormatter';
export { NullFormatter } from './plugins/formatter/NullFormatter';
export { PlainFormatter } from './plugins/formatter/PlainFormatter';

// utilities
export { AgLoggerGetMessage } from './utils/AgLoggerGetMessage';
export { createTestId } from './utils/testIdUtils';
