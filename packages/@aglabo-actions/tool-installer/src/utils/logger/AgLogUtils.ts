// src: /src/utils/logger/AgLogUtils.ts
// @(#) : log出力用ユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgLogLevel } from '@/shared/types';

// functions
export const agLogMessage = (...args: unknown[]): string =>
  args
    .map((arg) => {
      if (typeof arg === 'string') {
        return arg;
      }
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join('');

export const agLog = (
  level: AgLogLevel,
  ...args: unknown[]
): string => {
  // 最初のパラメータがログ日時かチェックして、日時を取得
  const getLogDate = (): Date => {
    if (args.length > 0 && typeof args[0] === 'string') {
      const timestamp = Date.parse(args[0]);
      if (!isNaN(timestamp)) {
        args.shift();
        return new Date(timestamp);
      }
    }
    return new Date();
  };

  const timeStamp = getLogDate().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const levelName = level.toString();
  const message = agLogMessage(...args);
  const log = `${timeStamp} [${levelName}] ${message}`;

  return log;
};
