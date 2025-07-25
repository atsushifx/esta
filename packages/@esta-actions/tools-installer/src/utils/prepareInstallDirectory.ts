// src: ./src/utils/prepareInstallDirectory.ts
// @(#) : GitHub Actions installation directory preparation utility
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import { mkdir } from 'fs/promises';

// GitHub Actions core
import * as core from '@actions/core';

// constants
import { ESTA_DEFAULT_INSTALL_DIR } from '@shared/constants';

/**
 * GitHub Actions 用のツールインストールディレクトリを準備し、PATH に追加する
 * @returns 作成したディレクトリの絶対パス
 */
export const prepareInstallDirectory = async (
  installDir?: string,
): Promise<string> => {
  const finalInstallDir = installDir ?? ESTA_DEFAULT_INSTALL_DIR;

  try {
    await mkdir(finalInstallDir, { recursive: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(`Failed to create directory: "${finalInstallDir}": ${message}`);
    throw err;
  }

  try {
    core.addPath(finalInstallDir);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(`Failed to add "${finalInstallDir}" to PATH: ${message}`);
    throw err;
  }

  core.info(`Added ${finalInstallDir} to PATH`);
  return finalInstallDir;
};
export default prepareInstallDirectory;
