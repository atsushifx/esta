// src: ./parser/parseConfig.ts
// 設定データ解析ルーター
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import { CONFIG_FILE_EXTENSIONS, type ConfigFileExtension } from '@shared/types/common.types';

// parser
import { parseJsoncConfig, parseTSConfig, parseYamlConfig } from './parseWithModule';

export const parseConfig = <T = object>(extension: string, raw: string | undefined): T => {
  const normalizedExt = extension.replace(/^\./, '').toLowerCase() as ConfigFileExtension;

  switch (normalizedExt) {
    case CONFIG_FILE_EXTENSIONS.JSON:
    case CONFIG_FILE_EXTENSIONS.JSONC:
      return parseJsoncConfig<T>(raw);
    case CONFIG_FILE_EXTENSIONS.YAML:
    case CONFIG_FILE_EXTENSIONS.YML:
      return parseYamlConfig<T>(raw);
    case CONFIG_FILE_EXTENSIONS.TS:
    case CONFIG_FILE_EXTENSIONS.JS:
      return parseTSConfig<T>(raw);
    default:
      return {} as T;
  }
};
