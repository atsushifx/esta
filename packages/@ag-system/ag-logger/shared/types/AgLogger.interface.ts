
// src: /shared/types/AgLogger.interface.ts
// @(#) : Logger Interface Definitions
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type
import type { AgLogLevel } from './AgLogger.types';

export type AgLoggerFunction = (...args: unknown[]) => void;

export type AgFormatFunction = (level: AgLogLevel, ...args: unknown[]) => string;

export type AgLoggerMap<T extends AgLoggerFunction = AgLoggerFunction> = Record<AgLogLevel, T | null>;

