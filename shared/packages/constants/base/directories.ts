// src: shared/common/constants/directories.ts
// @(#) : path and directory constants
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import * as path from 'path';
import * as process from 'process';

// -- constants definitions --
/**
 * @constant ESTA_WORKSPACE_DIR
 * @description
 * GitHub Actions 上での作業ディレクトリ、およびローカル実行時の基準ディレクトリ。
 *
 * `.tools/bin` や `.tmp/` など、ツールのインストール先や一時ファイル配置など、
 * アクション内部のディレクトリ構成のベースとして利用するための定数。
 *
 * 主にパス解決やインストールパスの構築時に参照される。
 */
export const ESTA_WORKSPACE_DIR = process.env.GITHUB_WORKSPACE ?? process.cwd();

/**
 * @constant ESTA_WINGET_INSTALL_DIR
 * @description
 * `winget` がインストールしたツールの実行可能ファイルへのリンク (ショートカット) が配置されるディレクトリ。
 * easy-setup-tools-action では、ここからデフォルトインストールディレクトリにリンクをコピーする
 */
export const ESTA_WINGET_INSTALL_DIR = path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'Winget', 'links');
