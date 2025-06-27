// src: ./framework/fixtureRunner.ts
// AgE2e Fixture Framework
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { ExpectedConfig } from '@shared/types';
// framework
import { AgE2eFileReader } from './io';
import { validateMarkdownResult } from './validators/markdownValidator';
import { validatePlaintextResult } from './validators/plaintextValidator';

// === 型定義 ===

export type AgE2eTestFunction<T = unknown> = (extension: string, content: string) => T;

// === AgE2e Fixture Framework クラス ===

export class AgE2eFixtureFramework<T = unknown> {
  // ------------------------------------
  // 内部プロパティ
  // ------------------------------------

  private _fileReader: AgE2eFileReader;

  // ------------------------------------
  // コンストラクタ
  // ------------------------------------

  constructor(private testFunction: AgE2eTestFunction<T>) {
    this._fileReader = new AgE2eFileReader();
  }

  // ------------------------------------
  // 外部メソッド
  // ------------------------------------

  /**
   * フィクスチャテストを実行
   */
  runTest(testCasePath: string): boolean {
    const { content, extension } = this._fileReader.readInputFile(testCasePath);
    const expected = this._fileReader.readExpectedConfig(testCasePath);

    const result = this.testFunction(extension, content);

    return this._validateResult(result, expected);
  }

  // ------------------------------------
  // 内部メソッド
  // ------------------------------------

  /**
   * 結果をバリデーション
   */
  private _validateResult(result: unknown, expected: ExpectedConfig): boolean {
    switch (expected.type) {
      case 'plaintext':
        return validatePlaintextResult(result, expected);
      case 'markdown':
        return validateMarkdownResult(result, expected);
      default:
        throw new Error(`Unknown expected type: ${(expected as { type: string }).type}`);
    }
  }
}
