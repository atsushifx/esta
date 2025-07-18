// src/internal/types/validation.ts
// @(#) : 検証関連の内部型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import type { ToolEntry } from '../../../shared/types';

/**
 * ツール検証結果
 */
export type ValidateToolsResult = {
  /** 検証成功フラグ */
  success: boolean;
  /** 有効なツールエントリー */
  validEntries: ToolEntry[];
  /** エラーの配列 */
  errors: Array<{
    /** エラーが発生したインデックス */
    index: number;
    /** エラーが発生したエントリー */
    entry: ToolEntry;
    /** エラーメッセージ */
    error: string;
  }>;
};
