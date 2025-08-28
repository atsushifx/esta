// src: shared/types/TExecRuntime.types.ts
// @(#) : TypeScript execution runtime enum
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * TypeScript実行ランタイム環境を表すenum
 *
 * アプリケーションが実行されているJavaScript/TypeScript実行環境を識別するために使用される
 */
export enum TExecRuntime {
  /** Node.js環境 - 標準的なサーバーサイドJavaScript実行環境 */
  Node = 'Node',

  /** Deno環境 - セキュアなTypeScript/JavaScript実行環境 */
  Deno = 'Deno',

  /** Bun環境 - 高速なJavaScript/TypeScript実行環境・パッケージマネージャー */
  Bun = 'Bun',

  /** GitHub Actions環境 - CI/CD実行環境 */
  GHA = 'GitHubActions',

  /** 不明な環境 - 上記以外または検出失敗時のデフォルト値 */
  Unknown = 'Unknown',
}
