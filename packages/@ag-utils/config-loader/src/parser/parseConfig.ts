// src: ./parser/parseConfig.ts
// 設定データ解析ルーター
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import { CONFIG_FILE_EXTENSIONS, type ConfigFileExtension, type ParseConfigOptions } from '@shared/types/common.types';

// parser
import { parseMarkdownConfig } from './parseMarkdownConfig';
import { parsePlaintextConfig } from './parsePlaintextConfig';
import { parseJsoncConfig, parseTSConfig, parseYamlConfig } from './parseWithModule';

// ----------------
// public
// ----------------

export const parseConfig = <T = object>(
  extension: string,
  raw: string | undefined,
  options?: ParseConfigOptions,
): T => {
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
    case CONFIG_FILE_EXTENSIONS.MD:
      return parseMarkdownConfig<T>(raw);
    case CONFIG_FILE_EXTENSIONS.ERROR:
      return parseWildcardConfig<T>(raw, options);
    default:
      return {} as T;
  }
};

const parseWildcardConfig = <T = object>(raw: string | undefined, options?: ParseConfigOptions): T => {
  if (!options?.parseAs) {
    return parsePlaintextConfig<T>(raw);
  }

  switch (options.parseAs) {
    case 'md':
      return parseMarkdownConfig<T>(raw);
    case 'plaintext':
      return parsePlaintextConfig<T>(raw);
    default:
      return parsePlaintextConfig<T>(raw);
  }
};
