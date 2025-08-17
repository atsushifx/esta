//
// Copyright (C) 2025 atsushifx
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

// types
import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AgLogMessage } from '../../../../shared/types';
import type { AgFormatRoutine } from '../../../../shared/types/AgMockConstructor.class';

// target
import { MockFormatter } from '../MockFormatter';

/**
 * MockFormatter.errorThrow 包括的テストスイート
 *
 * atsushifx式BDD厳格プロセスに従い、正常系・異常系・エッジケースを網羅
 * 各it/expectごとにRed-Green-Refactorサイクルを維持
 */
describe('MockFormatter.errorThrow - 包括的テスト', () => {
  // 共通テストデータ
  const createTestMessage = (message = 'Test message'): AgLogMessage => ({
    timestamp: new Date('2025-01-01T00:00:00.000Z'),
    logLevel: AG_LOGLEVEL.INFO,
    message,
    args: [],
  });

  const dummyRoutine: AgFormatRoutine = (msg) => msg;

  describe('正常系テスト（Normal Cases）', () => {
    describe('基本動作の確認', () => {
      it('デフォルトエラーメッセージでErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        // Act & Assert
        expect(() => instance.execute(testMessage)).toThrow('Default mock error');
      });

      it('カスタムデフォルトエラーメッセージでErrorを投げる', () => {
        // Arrange
        const customMessage = 'Custom initialization error';
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine, customMessage);
        const testMessage = createTestMessage();

        // Act & Assert
        expect(() => instance.execute(testMessage)).toThrow(customMessage);
      });

      it('AgMockConstructorマーカーを持つ', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;

        // Act & Assert
        expect(FormatterClass.__isMockConstructor).toBe(true);
      });
    });

    describe('動的エラーメッセージ変更', () => {
      it('setErrorMessageで実行時にエラーメッセージを変更できる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const newErrorMessage = 'Runtime changed error';

        // Act & Assert - 初期状態
        expect(() => instance.execute(testMessage)).toThrow('Default mock error');

        // Act - メッセージ変更
        instance.setErrorMessage(newErrorMessage);

        // Assert - 変更後
        expect(() => instance.execute(testMessage)).toThrow(newErrorMessage);
      });

      it('複数回のsetErrorMessageでメッセージが順次変更される', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        const firstMessage = 'First error message';
        const secondMessage = 'Second error message';
        const thirdMessage = 'Third error message';

        // Act & Assert - 第1回変更
        instance.setErrorMessage(firstMessage);
        expect(() => instance.execute(testMessage)).toThrow(firstMessage);

        // Act & Assert - 第2回変更
        instance.setErrorMessage(secondMessage);
        expect(() => instance.execute(testMessage)).toThrow(secondMessage);

        // Act & Assert - 第3回変更
        instance.setErrorMessage(thirdMessage);
        expect(() => instance.execute(testMessage)).toThrow(thirdMessage);
      });
    });

    describe('エラーメッセージ取得', () => {
      it('getErrorMessageで現在のエラーメッセージを取得できる', () => {
        // Arrange
        const customMessage = 'Initial custom message';
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine, customMessage);

        // Act & Assert - 初期メッセージ
        expect(instance.getErrorMessage()).toBe(customMessage);
      });

      it('setErrorMessage後にgetErrorMessageで変更されたメッセージを取得できる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const newMessage = 'Changed message';

        // Act
        instance.setErrorMessage(newMessage);

        // Assert
        expect(instance.getErrorMessage()).toBe(newMessage);
      });
    });

    describe('統計機能の正常動作', () => {
      it('executeでエラーが投げられても統計が正しく更新される', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        // Act & Assert - 初期状態
        expect(instance.getStats().callCount).toBe(0);
        expect(instance.getStats().lastMessage).toBeNull();

        // Act - 1回目実行
        expect(() => instance.execute(testMessage)).toThrow();

        // Assert - 1回目後
        expect(instance.getStats().callCount).toBe(1);
        expect(instance.getStats().lastMessage).toEqual(testMessage);

        // Act - 2回目実行
        expect(() => instance.execute(testMessage)).toThrow();

        // Assert - 2回目後
        expect(instance.getStats().callCount).toBe(2);
        expect(instance.getStats().lastMessage).toEqual(testMessage);
      });

      it('resetで統計が正しくクリアされる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        // Act - 複数回実行して統計を蓄積
        expect(() => instance.execute(testMessage)).toThrow();
        expect(() => instance.execute(testMessage)).toThrow();
        expect(() => instance.execute(testMessage)).toThrow();

        // Assert - 統計が蓄積されていることを確認
        expect(instance.getStats().callCount).toBe(3);
        expect(instance.getStats().lastMessage).toEqual(testMessage);

        // Act - リセット
        instance.reset();

        // Assert - 統計がクリアされたことを確認
        expect(instance.getStats().callCount).toBe(0);
        expect(instance.getStats().lastMessage).toBeNull();
      });

      it('setErrorMessage後も統計機能が正常に動作する', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        // Act - 初回実行
        expect(() => instance.execute(testMessage)).toThrow();

        // Assert - 初回統計確認
        expect(instance.getStats().callCount).toBe(1);

        // Act - エラーメッセージ変更
        instance.setErrorMessage('New error message');

        // Act - 変更後実行
        expect(() => instance.execute(testMessage)).toThrow('New error message');

        // Assert - 統計が継続されていることを確認
        expect(instance.getStats().callCount).toBe(2);
        expect(instance.getStats().lastMessage).toEqual(testMessage);
      });
    });
  });

  describe('異常系テスト（Error Cases）', () => {
    describe('null/undefined処理', () => {
      it('nullメッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        // Act - nullメッセージを設定
        instance.setErrorMessage(null as unknown as string);

        // Assert - nullが文字列化されてエラーメッセージになる
        expect(() => instance.execute(testMessage)).toThrow('null');
      });

      it('undefinedメッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        // Act - undefinedメッセージを設定
        instance.setErrorMessage(undefined as unknown as string);

        // Assert - undefinedが空文字列になってErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow('');
      });

      it('undefinedをデフォルトメッセージに設定した場合の動作', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine, undefined as unknown as string);
        const testMessage = createTestMessage();

        // Act & Assert - undefinedはデフォルト引数になりDefault mock errorになる
        expect(() => instance.execute(testMessage)).toThrow('Default mock error');
      });
    });

    describe('非文字列パラメータでの型安全性', () => {
      it('数値をメッセージに設定した場合の動作', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const numberMessage = 12345;

        // Act - 数値をメッセージに設定
        instance.setErrorMessage(numberMessage as unknown as string);

        // Assert - 数値が文字列化される
        expect(() => instance.execute(testMessage)).toThrow('12345');
      });

      it('booleanをメッセージに設定した場合の動作', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        // Act - booleanをメッセージに設定
        instance.setErrorMessage(true as unknown as string);

        // Assert - booleanが文字列化される
        expect(() => instance.execute(testMessage)).toThrow('true');
      });

      it('オブジェクトをメッセージに設定した場合の動作', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const objectMessage = { error: 'test error', code: 500 };

        // Act - オブジェクトをメッセージに設定
        instance.setErrorMessage(objectMessage as unknown as string);

        // Assert - オブジェクトが文字列化される
        expect(() => instance.execute(testMessage)).toThrow('[object Object]');
      });

      it('配列をメッセージに設定した場合の動作', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const arrayMessage = ['error1', 'error2', 'error3'];

        // Act - 配列をメッセージに設定
        instance.setErrorMessage(arrayMessage as unknown as string);

        // Assert - 配列が文字列化される
        expect(() => instance.execute(testMessage)).toThrow('error1,error2,error3');
      });
    });

    describe('不正なコンストラクタ引数', () => {
      it('nullをデフォルトメッセージに設定した場合の動作', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine, null as unknown as string);
        const testMessage = createTestMessage();

        // Act & Assert - nullが文字列化される
        expect(() => instance.execute(testMessage)).toThrow('null');
      });

      it('数値をデフォルトメッセージに設定した場合の動作', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine, 404 as unknown as string);
        const testMessage = createTestMessage();

        // Act & Assert - 数値が文字列化される
        expect(() => instance.execute(testMessage)).toThrow('404');
      });

      it('オブジェクトをデフォルトメッセージに設定した場合の動作', () => {
        // Arrange
        const errorObject = { message: 'Custom error', status: 'failed' };
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine, errorObject as unknown as string);
        const testMessage = createTestMessage();

        // Act & Assert - オブジェクトが文字列化される
        expect(() => instance.execute(testMessage)).toThrow('[object Object]');
      });
    });
  });

  describe('エッジケース（Edge Cases）', () => {
    describe('特殊な文字列パターン', () => {
      it('空文字列メッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const emptyMessage = '';

        // Act - 空文字列を設定
        instance.setErrorMessage(emptyMessage);

        // Assert - 空文字列でErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow('');
      });

      it('非常に長いメッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const longMessage = 'A'.repeat(1000); // 1000文字のメッセージ

        // Act - 長いメッセージを設定
        instance.setErrorMessage(longMessage);

        // Assert - 長いメッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(longMessage);
      });

      it('改行文字を含むメッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const multilineMessage = 'Line 1\nLine 2\nLine 3';

        // Act - 改行文字を含むメッセージを設定
        instance.setErrorMessage(multilineMessage);

        // Assert - 改行文字を含むメッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(multilineMessage);
      });

      it('タブ文字を含むメッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const tabMessage = 'Column1\tColumn2\tColumn3';

        // Act - タブ文字を含むメッセージを設定
        instance.setErrorMessage(tabMessage);

        // Assert - タブ文字を含むメッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(tabMessage);
      });

      it('制御文字を含むメッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const controlMessage = 'Error\u0000with\u0007control\u001bchars';

        // Act - 制御文字を含むメッセージを設定
        instance.setErrorMessage(controlMessage);

        // Assert - 制御文字を含むメッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(controlMessage);
      });
    });

    describe('Unicode文字処理', () => {
      it('日本語メッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const japaneseMessage = 'エラーが発生しました：データベース接続に失敗';

        // Act - 日本語メッセージを設定
        instance.setErrorMessage(japaneseMessage);

        // Assert - 日本語メッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(japaneseMessage);
      });

      it('絵文字を含むメッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const emojiMessage = '🚨 Critical Error 💥 System Failure 🔥';

        // Act - 絵文字を含むメッセージを設定
        instance.setErrorMessage(emojiMessage);

        // Assert - 絵文字を含むメッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(emojiMessage);
      });

      it('複合Unicode文字でも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const complexUnicode = '👨‍💻 Developer Error: 한국어 中文 عربي';

        // Act - 複合Unicode文字を含むメッセージを設定
        instance.setErrorMessage(complexUnicode);

        // Assert - 複合Unicode文字を含むメッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(complexUnicode);
      });
    });

    describe('特殊フォーマット文字列', () => {
      it('JSON形式文字列メッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const jsonMessage = '{"error": "Database connection failed", "code": 500, "timestamp": "2025-01-01T00:00:00Z"}';

        // Act - JSON形式文字列を設定
        instance.setErrorMessage(jsonMessage);

        // Assert - JSON形式文字列でErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(jsonMessage);
      });

      it('HTMLタグを含むメッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const htmlMessage = '<span class="error">Critical Error:</span> <b>System Failure</b>';

        // Act - HTMLタグを含むメッセージを設定
        instance.setErrorMessage(htmlMessage);

        // Assert - HTMLタグを含むメッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(htmlMessage);
      });

      it('正規表現パターンを含むメッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const regexMessage = 'Invalid pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/';

        // Act - 正規表現パターンを含むメッセージを設定
        instance.setErrorMessage(regexMessage);

        // Assert - 正規表現パターンを含むメッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(regexMessage);
      });

      it('エスケープシーケンスを含むメッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const escapeMessage = 'Path error: "C:\\Users\\test\\file.txt" not found';

        // Act - エスケープシーケンスを含むメッセージを設定
        instance.setErrorMessage(escapeMessage);

        // Assert - エスケープシーケンスを含むメッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(escapeMessage);
      });
    });

    describe('境界値テスト', () => {
      it('単一文字メッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const singleChar = 'X';

        // Act - 単一文字メッセージを設定
        instance.setErrorMessage(singleChar);

        // Assert - 単一文字メッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(singleChar);
      });

      it('スペースのみのメッセージでも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const spacesMessage = '   ';

        // Act - スペースのみのメッセージを設定
        instance.setErrorMessage(spacesMessage);

        // Assert - スペースのみのメッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(spacesMessage);
      });

      it('極端に長いメッセージ（10000文字）でも正常にErrorを投げる', () => {
        // Arrange
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const extremelyLongMessage = 'Error: ' + 'A'.repeat(9993); // 10000文字のメッセージ

        // Act - 極端に長いメッセージを設定
        instance.setErrorMessage(extremelyLongMessage);

        // Assert - 極端に長いメッセージでErrorを投げる
        expect(() => instance.execute(testMessage)).toThrow(extremelyLongMessage);
      });
    });
  });
});
