// src: /shared/constants/defaults.ts
// @(#) : デフォルト値関連の定数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// lib s
import * as path from 'path';

// constants
import { AgDir_WORKSPACE_DIR } from './directories';

// -- constants definitions --
/**
 * @constant AgActions_DEFAULT_CONFIG_FILE
 * @description
 * 使用するツール設定ファイルの既定ベース名（拡張子なし）。
 * 使用時には、json,yaml,jsなどの拡張子付きのファイルを検索する
 */
export const AgActions_DEFAULT_CONFIG_FILE = 'tool-configs';

/**
 * @constant AgActions_DEFAULT_INSTALL_DIR
 * @description
 * ツールの規定のインストールディレクトリ
 *
 * GitHub Actions 実行環境またはローカルの作業ディレクトリ内に `.tools/bin` を作成し、
 * ダウンロードされた実行可能ファイルをここに配置する。
 */
export const AgActions_DEFAULT_INSTALL_DIR = path.join(AgDir_WORKSPACE_DIR, '.tools', 'bin');

/**
 * @constant AgActions_DEFAULT_TEMP_DIR
 * @description
 * 一時ファイルの保存先として使用されるディレクトリ。
 *
 * 各インストーラーがツール取得時に必要とする一時データ（展開・検証用）を
 * `.tools/tmp` 配下に保存するための標準パス。
 */
export const AgActions_DEFAULT_TEMP_DIR = path.join(AgDir_WORKSPACE_DIR, '.tools', 'tmp');
