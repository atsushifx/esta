// src: /src/installer/prepareInstallDirectory.ts
// @(#) : インストール用ディレクトリ初期設定
//
// Copyright (c) 2025 Furukawa Atsushi <atsushifx@gmail.com>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import { mkdir } from 'fs/promises';

// constants
import { AgActions_DEFAULT_INSTALL_DIR } from '@shared/constants';

/**
 * GitHub Actions 用のツールインストールディレクトリを準備し、PATH に追加する
 * @returns 作成したディレクトリの絶対パス
 */
export const prepareInstallDirectory = async (
  installDir?: string,
): Promise<string> => {
  installDir ??= AgActions_DEFAULT_INSTALL_DIR;

  try {
    await mkdir(installDir, { recursive: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(`Failed to create directory: "${installDir}": ${message}`);
    throw err;
  }

  try {
    core.addPath(installDir);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(`Failed to add "${installDir}" to PATH: ${message}`);
    throw err;
  }

  core.info(`Added ${installDir} to PATH`);
  return installDir;
};
export default prepareInstallDirectory;
