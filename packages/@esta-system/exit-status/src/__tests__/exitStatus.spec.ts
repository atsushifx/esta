import { ExitCode } from '@esta-core/error-handler';
import { beforeEach, describe, expect, test } from 'vitest';
import { ExitStatus } from '../exitStatus';

describe('ExitStatus', () => {
  beforeEach(() => {
    ExitStatus.reset();
  });

  describe('基本機能', () => {
    test('set()で非ゼロ値を設定できる', () => {
      ExitStatus.set(1);
      expect(ExitStatus.get()).toBe(1);
    });

    test('get()で設定された値を取得できる', () => {
      ExitStatus.set(42);
      expect(ExitStatus.get()).toBe(42);
    });

    test('reset()で値を0にリセットできる', () => {
      ExitStatus.set(5);
      ExitStatus.reset();
      expect(ExitStatus.get()).toBe(0);
    });

    test('set(0)で0を設定してもstatusが0のまま', () => {
      ExitStatus.set(0);
      expect(ExitStatus.get()).toBe(0);
    });
  });

  describe('仕様固有の動作', () => {
    test('一度非ゼロ値を設定したら、0を設定しても変更されない', () => {
      ExitStatus.set(1);
      ExitStatus.set(0);
      expect(ExitStatus.get()).toBe(1);
    });

    test('複数の非ゼロ値を設定した場合、最後の値が保持される', () => {
      ExitStatus.set(1);
      ExitStatus.set(2);
      expect(ExitStatus.get()).toBe(2);
    });

    test('負の終了コードは設定されない', () => {
      ExitStatus.set(-1);
      expect(ExitStatus.get()).toBe(0);
    });

    test('ExitCode.SUCCESS定数が0として正しく動作する', () => {
      ExitStatus.set(ExitCode.SUCCESS);
      expect(ExitStatus.get()).toBe(0);
    });
  });

  describe('エッジケース', () => {
    test('連続してreset()を呼んでも問題ない', () => {
      ExitStatus.set(1);
      ExitStatus.reset();
      ExitStatus.reset();
      expect(ExitStatus.get()).toBe(0);
    });

    test('大きな終了コード値も正しく処理される', () => {
      ExitStatus.set(255);
      expect(ExitStatus.get()).toBe(255);
    });
  });
});
