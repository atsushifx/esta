// src: ./helper/configs/convertConfig.ts
// @(#) : 設定データ変換ユーティリティ
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// type values
import { AgActionInstallerType } from '@shared/types';
// types
import type { AgActionEgetToolConfig, AgActionToolConfig } from '@shared/types';

// --- functions
const checkValidInstaller = (installer: AgActionInstallerType): boolean => {
  if (!installer) {
    throw new Error('Installer must set');
  }
  if (!Object.values(AgActionInstallerType).includes(installer)) {
    throw new Error(`Installer type is invalid: ${installer}`);
  }

  if (installer === AgActionInstallerType.EGET_INITIALIZE) {
    throw new Error(`Installer can use only system: ${installer}`);
  }
  return true;
};

const getEgetConfig = (raw: object): AgActionEgetToolConfig => {
  const config = raw as AgActionEgetToolConfig;
  if (!config.tool) {
    throw new Error('Tool name must set');
  }

  if (!config.package) {
    throw new Error('Package name must set');
  }
  return config;
};

// main function
export const convertConfig = (raw: object): AgActionToolConfig => {
  if (!raw) {
    throw new Error('Config is empty');
  }
  const config = raw as AgActionToolConfig;
  const installer = config.installer;
  checkValidInstaller(installer);
  switch (installer) {
    case AgActionInstallerType.EGET:
      return getEgetConfig(config);
  }
  throw new Error(`Installer type is invalid: ${installer}`);
};
