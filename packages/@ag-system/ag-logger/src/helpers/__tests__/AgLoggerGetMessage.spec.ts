// src: /src/__tests__/AgLoggerGetName.spec.ts
// @(#) : メッセージ取得ユニットテスト
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';

// test unit
import { AgLoggerGetMessage } from '../AgLoggerGetMessage';

// test main
describe('AgLoggerGetMessage', () => {
  describe('通常のログメッセージ (引数にJSONに渡すオブジェクトがない)', () => {
    it('引数がユーザーidのみ', () => {
      const userid = 'u1029165';
      const result = AgLoggerGetMessage('userid=', userid);
      expect(result.message).toEqual('userid=u1029165');
      expect(result.args).toEqual([]);
    });

    it('バックティックによる変数展開', () => {
      const userid = 'u1029165';
      const result = AgLoggerGetMessage(`userid=${userid}`);

      expect(result.message).toEqual('userid=u1029165');
      expect(result.args).toEqual([]);
    });

    it('複数パラメータ', () => {
      const dtDate = '2022-06-10';
      const dtTime = '10:30:00';
      const result = AgLoggerGetMessage('date:', dtDate, ' time:', dtTime);
      expect(result.message).toEqual('date:2022-06-10 time:10:30:00');
      expect(result.args).toEqual([]);
    });

    it('primitive type', () => {
      const result = AgLoggerGetMessage('number:', 123, ' string:', 'abc', ' boolean:', true);
      expect(result.message).toEqual('number:123 string:abc boolean:true');
      expect(result.args).toEqual([]);
    })
  });
});
