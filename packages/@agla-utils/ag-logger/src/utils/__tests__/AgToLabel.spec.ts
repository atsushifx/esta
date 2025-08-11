// src/utils/__tests__/AgToLabel.spec.ts
// @(#) : Unit tests for AgToLabel function (Log level to string conversion)
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL, AG_LOGLEVEL_TO_LABEL_MAP } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';
import { AgToLabel } from '../AgLogHelpers';

describe('AgToLabel: ラベルからLogLevelを取得する関数', () => {
  describe('正常ケース: 有効なLogLevelに対してラベル文字列を返す', () => {
    describe('標準LogLevel', () => {
      it('OFF LogLevelのときOFFラベルを返す', () => {
        expect(AgToLabel(AG_LOGLEVEL.OFF)).toBe('OFF');
      });

      it('FATAL LogLevelのときFATALラベルを返す', () => {
        expect(AgToLabel(AG_LOGLEVEL.FATAL)).toBe('FATAL');
      });

      it('ERROR LogLevelのときERRORラベルを返す', () => {
        expect(AgToLabel(AG_LOGLEVEL.ERROR)).toBe('ERROR');
      });

      it('WARN LogLevelのときWARNラベルを返す', () => {
        expect(AgToLabel(AG_LOGLEVEL.WARN)).toBe('WARN');
      });

      it('INFO LogLevelのときINFOラベルを返す', () => {
        expect(AgToLabel(AG_LOGLEVEL.INFO)).toBe('INFO');
      });

      it('DEBUG LogLevelのときDEBUGラベルを返す', () => {
        expect(AgToLabel(AG_LOGLEVEL.DEBUG)).toBe('DEBUG');
      });

      it('TRACE LogLevelのときTRACEラベルを返す', () => {
        expect(AgToLabel(AG_LOGLEVEL.TRACE)).toBe('TRACE');
      });

      it('VERBOSE LogLevelのときVERBOSEラベルを返す', () => {
        expect(AgToLabel(AG_LOGLEVEL.VERBOSE)).toBe('VERBOSE');
      });
    });

    describe('特殊LogLevel', () => {
      it('FORCE_OUTPUT LogLevelのとき空文字を返す', () => {
        expect(AgToLabel(AG_LOGLEVEL.FORCE_OUTPUT)).toBe('');
      });
    });

    describe('マップ参照の仕組み', () => {
      it('AG_LOGLEVEL_TO_LABEL_MAPから正しい値を取得する', () => {
        Object.values(AG_LOGLEVEL).forEach((level) => {
          const result = AgToLabel(level);
          const expected = level === AG_LOGLEVEL.FORCE_OUTPUT
            ? ''
            : AG_LOGLEVEL_TO_LABEL_MAP[level];
          expect(result).toBe(expected);
        });
      });
    });
  });

  describe('異常ケース: 無効な入力に対して空文字を返す', () => {
    describe('無効な数値', () => {
      it('範囲外の負数のとき空文字を返す', () => {
        expect(AgToLabel(-1 as AgLogLevel)).toBe('');
        expect(AgToLabel(-100 as AgLogLevel)).toBe('');
      });

      it('範囲外の正数のとき空文字を返す', () => {
        expect(AgToLabel(7 as AgLogLevel)).toBe('');
        expect(AgToLabel(99 as AgLogLevel)).toBe('');
        expect(AgToLabel(1000 as AgLogLevel)).toBe('');
      });
    });

    describe('型が違う値', () => {
      it('nullのとき空文字を返す', () => {
        expect(AgToLabel(null as unknown as AgLogLevel)).toBe('');
      });

      it('undefinedのとき空文字を返す', () => {
        expect(AgToLabel(undefined as unknown as AgLogLevel)).toBe('');
      });

      it('文字列のとき空文字を返す', () => {
        expect(AgToLabel('INFO' as unknown as AgLogLevel)).toBe('');
        expect(AgToLabel('4' as unknown as AgLogLevel)).toBe('');
        expect(AgToLabel('0' as unknown as AgLogLevel)).toBe('');
        expect(AgToLabel('-99' as unknown as AgLogLevel)).toBe('');
      });

      it('真偽値のとき空文字を返す', () => {
        expect(AgToLabel(true as unknown as AgLogLevel)).toBe('');
        expect(AgToLabel(false as unknown as AgLogLevel)).toBe('');
      });

      it('オブジェクトのとき空文字を返す', () => {
        expect(AgToLabel({} as unknown as AgLogLevel)).toBe('');
        expect(AgToLabel([] as unknown as AgLogLevel)).toBe('');
      });

      it('関数のとき空文字を返す', () => {
        expect(AgToLabel((() => {}) as unknown as AgLogLevel)).toBe('');
        expect(AgToLabel(AgToLabel as unknown as AgLogLevel)).toBe('');
      });
    });
  });

  describe('境界ケース: 特殊な数値とエッジケース', () => {
    describe('特殊な数値', () => {
      it('NaNのとき空文字を返す', () => {
        expect(AgToLabel(NaN as AgLogLevel)).toBe('');
      });

      it('Infinityのとき空文字を返す', () => {
        expect(AgToLabel(Infinity as AgLogLevel)).toBe('');
        expect(AgToLabel(-Infinity as AgLogLevel)).toBe('');
      });

      it('小数のとき空文字を返す', () => {
        expect(AgToLabel(4.5 as AgLogLevel)).toBe('');
        expect(AgToLabel(0.1 as AgLogLevel)).toBe('');
        expect(AgToLabel(-99.9 as AgLogLevel)).toBe('');
      });
    });

    describe('Numberオブジェクト', () => {
      it('Numberコンストラクタで作られた値のとき空文字を返す', () => {
        expect(AgToLabel(new Number(AG_LOGLEVEL.INFO) as unknown as AgLogLevel)).toBe('');
        expect(AgToLabel(new Number(4) as unknown as AgLogLevel)).toBe('');
      });
    });

    describe('ゼロの変形', () => {
      it('正規化されたゼロのときOFFラベルを返す', () => {
        expect(AgToLabel(-0 as AgLogLevel)).toBe('OFF');
        expect(AgToLabel(0.0 as AgLogLevel)).toBe('OFF');
        expect(AgToLabel(Number('0') as AgLogLevel)).toBe('OFF');
      });
    });

    describe('境界値', () => {
      it('有効範囲外の値のとき空文字を返す', () => {
        expect(AgToLabel(-100 as AgLogLevel)).toBe('');
        expect(AgToLabel(7 as AgLogLevel)).toBe('');
        expect(AgToLabel(-1 as AgLogLevel)).toBe('');
        expect(AgToLabel(-50 as AgLogLevel)).toBe('');
        expect(AgToLabel(-97 as AgLogLevel)).toBe('');
      });
    });

    describe('その他のプリミティブ型', () => {
      it('Symbolのとき空文字を返す', () => {
        expect(AgToLabel(Symbol('test') as unknown as AgLogLevel)).toBe('');
        expect(AgToLabel(Symbol.for('LOG_LEVEL') as unknown as AgLogLevel)).toBe('');
      });

      it('BigIntのとき空文字を返す', () => {
        expect(AgToLabel(4n as unknown as AgLogLevel)).toBe('');
        expect(AgToLabel(BigInt(AG_LOGLEVEL.INFO) as unknown as AgLogLevel)).toBe('');
      });
    });

    describe('配列やオブジェクト系', () => {
      it('配列のとき空文字を返す', () => {
        expect(AgToLabel([4] as unknown as AgLogLevel)).toBe('');
      });

      it('配列ライクなオブジェクトのとき空文字を返す', () => {
        expect(AgToLabel({ 0: 4, length: 1 } as unknown as AgLogLevel)).toBe('');
      });
    });
  });

  describe('性能と一貫性のテスト', () => {
    describe('性能', () => {
      it('大量のルックアップを効率的に処理する', () => {
        const startTime = Date.now();

        for (let i = 0; i < 10000; i++) {
          AgToLabel(AG_LOGLEVEL.INFO);
          AgToLabel(AG_LOGLEVEL.ERROR);
          AgToLabel(AG_LOGLEVEL.WARN);
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(duration).toBeLessThan(1000);
      });
    });

    describe('一貫性', () => {
      it('同じ入力に対して常に同じ結果を返す', () => {
        const testCases = [
          { input: AG_LOGLEVEL.INFO, expected: 'INFO' },
          { input: AG_LOGLEVEL.FORCE_OUTPUT, expected: '' },
          { input: -1 as AgLogLevel, expected: '' },
          { input: null as unknown as AgLogLevel, expected: '' },
        ];

        testCases.forEach(({ input, expected }) => {
          for (let i = 0; i < 100; i++) {
            expect(AgToLabel(input)).toBe(expected);
          }
        });
      });

      it('混在した有効無効な入力を順次処理する', () => {
        const mixedInputs = [
          AG_LOGLEVEL.INFO,
          -1 as AgLogLevel,
          AG_LOGLEVEL.ERROR,
          null as unknown as AgLogLevel,
          AG_LOGLEVEL.FORCE_OUTPUT,
          'invalid' as unknown as AgLogLevel,
          AG_LOGLEVEL.VERBOSE,
        ];

        const expectedOutputs = ['INFO', '', 'ERROR', '', '', '', 'VERBOSE'];

        mixedInputs.forEach((input, index) => {
          expect(AgToLabel(input)).toBe(expectedOutputs[index]);
        });
      });
    });
  });
});
