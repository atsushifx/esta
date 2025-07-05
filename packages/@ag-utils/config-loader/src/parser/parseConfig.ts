// src: ./parser/parseConfig.ts
// 設定データ解析ルーター
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import {
  EstaExtensionToFileTypeMap,
  TEstaConfigFileType,
  type TEstaSupportedExtension,
} from '@shared/types/configFile.types';

// parser
import { parseJsoncConfig, parseTSConfig, parseYamlConfig } from './parseWithModule';

export const parseConfig = <T = object>(extension: string, raw: string | undefined): T => {
  const normalizedExt = extension.replace(/^\./, '').toLowerCase() as TEstaSupportedExtension;
  const fileType = EstaExtensionToFileTypeMap[normalizedExt];

  switch (fileType) {
    case TEstaConfigFileType.JSON:
      return parseJsoncConfig<T>(raw);
    case TEstaConfigFileType.YAML:
      return parseYamlConfig<T>(raw);
    case TEstaConfigFileType.SCRIPT:
      return parseTSConfig<T>(raw);
    default:
      return {} as T;
  }
};
