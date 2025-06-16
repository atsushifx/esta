// src: /src/helpers/AgLoggerGetMessage.ts
// @(#)  : 引数 → メッセージ変換
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { AgLogParsedMessage } from "@shared/types/AgLogger.types";

export const AgLoggerGetMessage = (...args: unknown[]): AgLogParsedMessage => {
  const logMessage = [...args.map(String)].join('')

  return {
    message: logMessage,
    args: [],
  }
};

