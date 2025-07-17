// src/toolsValidator/utils/pathUtils.ts
// @(#) : パス検証・正規化ユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * パス文字列の基本検証
 * - 空文字列でないこと
 * - 無効文字を含まないこと
 * - 連続スラッシュを含まないこと
 *
 * @param path 検証するパス文字列
 * @returns パスが基本的に有効かどうか
 */
const isValidPathFormat = (path: string): boolean => {
  // 空文字列チェック
  if (!path || path.trim().length === 0) {
    return false;
  }

  const trimmedPath = path.trim();

  // 無効な文字をチェック（Windows/Unix共通）
  const invalidChars = /[<>"|*?]/;
  if (invalidChars.test(trimmedPath)) {
    return false;
  }

  // 連続するスラッシュは無効
  if (trimmedPath.includes('//') || trimmedPath.includes('\\\\')) {
    return false;
  }

  return true;
};

/**
 * ディレクトリパスの正規化
 * - パス区切り文字を統一
 * - 末尾のスラッシュを除去
 * - 相対パス記号の解決
 *
 * @param path 正規化するパス
 * @returns 正規化されたパス
 */
export const normalizePath = (path: string): string => {
  if (!isValidPathFormat(path)) {
    throw new Error(`Invalid path format: ${path}`);
  }

  let normalized = path.trim();

  // Windowsパスの判定
  const isWindowsPath = /^[a-zA-Z]:[\\/]/.test(normalized);

  if (isWindowsPath) {
    // Windowsパスの場合: バックスラッシュに統一
    normalized = normalized.replace(/\//g, '\\');
  } else {
    // Unix系パスの場合: フォワードスラッシュに統一
    normalized = normalized.replace(/\\/g, '/');
  }

  // 末尾のスラッシュを除去（ルートディレクトリ以外）
  const rootPatterns = [
    /^[a-zA-Z]:\\?$/, // Windows root (C:\ or C:)
    /^\/$/, // Unix root (/)
  ];

  const isRoot = rootPatterns.some((pattern) => pattern.test(normalized));
  if (!isRoot && (normalized.endsWith('/') || normalized.endsWith('\\'))) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
};

/**
 * パス文字列の検証と正規化を行う
 *
 * @param path 検証・正規化するパス文字列
 * @returns 正規化されたパス
 * @throws パスが無効な場合はエラー
 */
export const validateAndNormalizePath = (path: string): string => {
  const normalized = normalizePath(path);

  // 正規化後の追加検証
  const trimmedPath = normalized;

  // 絶対パスの検証
  const isUnixAbsolute = trimmedPath.startsWith('/');
  const isWindowsAbsolute = /^[a-zA-Z]:[\\]/.test(trimmedPath);

  // 相対パスの検証
  const isRelative = trimmedPath.startsWith('./')
    || trimmedPath.startsWith('../')
    || trimmedPath.startsWith('.\\')
    || trimmedPath.startsWith('..\\')
    || trimmedPath === '.'
    || trimmedPath === '..'
    || (!trimmedPath.startsWith('/') && !isWindowsAbsolute);

  // 絶対パスまたは相対パスのいずれかである必要がある
  if (!isUnixAbsolute && !isWindowsAbsolute && !isRelative) {
    throw new Error(`Path must be absolute or relative: ${path}`);
  }

  return normalized;
};

/**
 * 2つのパスが同じディレクトリを指しているかチェック
 *
 * @param path1 比較するパス1
 * @param path2 比較するパス2
 * @returns 同じディレクトリかどうか
 */
export const arePathsEqual = (path1: string, path2: string): boolean => {
  try {
    const normalized1 = validateAndNormalizePath(path1);
    const normalized2 = validateAndNormalizePath(path2);

    // 大文字小文字を無視して比較（Windowsの場合を考慮）
    return normalized1.toLowerCase() === normalized2.toLowerCase();
  } catch {
    return false;
  }
};
