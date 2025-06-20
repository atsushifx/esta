// src: /src/__tests__/AgLoggerGetName.spec.ts
// @(#) : メッセージ取得ユニットテスト
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// internal modules
import { AgLogLevelCode } from '@shared/types/AgLogger.types';

// test unit
import { AgLoggerGetMessage } from '../AgLoggerGetMessage';

// test main
describe('AgLoggerGetMessage', () => {
  describe('通常のログメッセージ (引数にJSONに渡すオブジェクトがない)', () => {
    it('引数がユーザーidのみ', () => {
      const userid = 'u1029165';
      const result = AgLoggerGetMessage(AgLogLevelCode.INFO, 'userid=', userid);
      expect(result.logLevel).toEqual(AgLogLevelCode.INFO);
      expect(result.message).toEqual('userid=u1029165');
      expect(result.args).toEqual([]);
    });

    it('バックティックによる変数展開', () => {
      const userid = 'u1029165';
      const result = AgLoggerGetMessage(AgLogLevelCode.DEBUG, `userid=${userid}`);

      expect(result.logLevel).toEqual(AgLogLevelCode.DEBUG);
      expect(result.message).toEqual('userid=u1029165');
      expect(result.args).toEqual([]);
    });

    it('複数パラメータ', () => {
      const dtDate = '2022-06-10';
      const dtTime = '10:30:00';
      const result = AgLoggerGetMessage(AgLogLevelCode.WARN, 'date:', dtDate, ' time:', dtTime);
      expect(result.logLevel).toEqual(AgLogLevelCode.WARN);
      expect(result.message).toEqual('date:2022-06-10 time:10:30:00');
      expect(result.args).toEqual([]);
    });

    it('primitive type', () => {
      const result = AgLoggerGetMessage(AgLogLevelCode.ERROR, 'number:', 123, ' string:', 'abc', ' boolean:', true);
      expect(result.logLevel).toEqual(AgLogLevelCode.ERROR);
      expect(result.message).toEqual('number:123 string:abc boolean:true');
      expect(result.args).toEqual([]);
    });
  });

  describe('パラメータ付きメッセージ (単純なオブジェクト付き)', () => {
    it('単純なオブジェクト', () => {
      const result = AgLoggerGetMessage(AgLogLevelCode.TRACE, 'user:', { name: 'John Doe' });
      expect(result.logLevel).toEqual(AgLogLevelCode.TRACE);
      expect(result.message).toEqual('user:');
      expect(result.args).toEqual([{ name: 'John Doe' }]);
    });
  });

  describe('timestamp付きメッセージ', () => {
    it('最初の引数がISO日時文字列の場合、そのtimestampが設定される', () => {
      const timestampStr = '2025-01-15T10:30:00.000Z';
      const result = AgLoggerGetMessage(AgLogLevelCode.FATAL, timestampStr, 'test message');

      expect(result.logLevel).toEqual(AgLogLevelCode.FATAL);
      expect(result.message).toEqual('test message');
      expect(result.timestamp).toEqual(new Date(timestampStr));
      expect(result.args).toEqual([]);
    });

    it('最初の引数が有効な日時文字列の場合、そのtimestampが設定される', () => {
      const timestampStr = '2025-06-18 15:45:30';
      const result = AgLoggerGetMessage(AgLogLevelCode.INFO, timestampStr, 'log entry');

      expect(result.logLevel).toEqual(AgLogLevelCode.INFO);
      expect(result.message).toEqual('log entry');
      expect(result.timestamp).toEqual(new Date(timestampStr));
      expect(result.args).toEqual([]);
    });

    it('timestampありで複数引数とオブジェクト', () => {
      const timestampStr = '2025-01-01T00:00:00.000Z';
      const result = AgLoggerGetMessage(AgLogLevelCode.DEBUG, timestampStr, 'user:', 'john', { id: 123 });

      expect(result.logLevel).toEqual(AgLogLevelCode.DEBUG);
      expect(result.message).toEqual('user:john');
      expect(result.timestamp).toEqual(new Date(timestampStr));
      expect(result.args).toEqual([{ id: 123 }]);
    });
  });
});
