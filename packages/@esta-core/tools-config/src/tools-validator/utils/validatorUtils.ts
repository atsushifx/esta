// src/tools-validator/utils/validatorUtils.ts
// @(#) : バリデーション用ユーティリティ関数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// validation option types
import type { ValidOption } from '../../internal/types/validation';
// validation error messages
import { VALIDATION_ERROR_MESSAGES } from '@/internal/constants/validation';

export const isValidGitHubRepoFormat = (repository: string): boolean => {
  const pattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
  return pattern.test(repository);
};

export const isValidSemverOrLatest = (version: string): boolean => {
  if (version === 'latest') {
    return true;
  }
  const semverPattern = /^v?\d+\.\d+\.\d+$/;
  return semverPattern.test(version);
};

const getInvalidOptions = (
  options: Record<string, string>,
  validator: ValidOption[],
): string[] => {
  const validKeys = validator.flatMap((opt) => [opt.short, opt.long].filter((s) => s !== ''));
  return Object.keys(options).filter((k) => !validKeys.includes(k));
};

const hasDuplicatedOptions = (
  options: Record<string, string>,
  validator: ValidOption[],
): boolean => {
  const shortToLongMap = new Map<string, string>(
    validator.flatMap((opt) =>
      [
        opt.short ? [opt.short, opt.long] : null,
        opt.long ? [opt.long, opt.long] : null,
      ].filter((e): e is [string, string] => e !== null)
    ),
  );
  const longs = Object.keys(options)
    .map((k) => shortToLongMap.get(k))
    .filter((s): s is string => !!s);
  return new Set(longs).size < longs.length;
};

const getMissingValueOptions = (
  options: Record<string, string>,
  validator: ValidOption[],
): string[] => {
  return Object.entries(options)
    .filter(([k, v]) => {
      const def = validator.find((d) => d.short === k || d.long === k);
      return def?.requireValue && v.trim() === '';
    })
    .map(([k]) => k);
};

const getUnexpectedValueOptions = (
  options: Record<string, string>,
  validator: ValidOption[],
): string[] => {
  return Object.entries(options)
    .filter(([k, v]) => {
      const def = validator.find((d) => d.short === k || d.long === k);
      return def && !def.requireValue && v.trim() !== '';
    })
    .map(([k]) => k);
};

export const chkValidOptions = (
  options: Record<string, string> | undefined,
  validator: ValidOption[],
): string => {
  if (!options) {
    return '';
  }

  // 無効なオプション
  if (getInvalidOptions(options, validator).length > 0) {
    const invalidOptions = getInvalidOptions(options, validator);
    return invalidOptions.join(', ');
  }

  // オプションの重複
  if (hasDuplicatedOptions(options, validator)) {
    return VALIDATION_ERROR_MESSAGES.DUPLICATED_OPTIONS;
  }

  // 必要な値
  const missingValueOptions = getMissingValueOptions(options, validator);
  if (missingValueOptions.length > 0) {
    return `${VALIDATION_ERROR_MESSAGES.OPTION_HAS_NO_VALUE}: ${missingValueOptions.join(', ')}`;
  }

  // 不要な値
  const unexpectedValueOptions = getUnexpectedValueOptions(options, validator);
  if (unexpectedValueOptions.length > 0) {
    return `${VALIDATION_ERROR_MESSAGES.OPTION_HAS_UNEXPECTED_VALUE}: ${unexpectedValueOptions.join(', ')}`;
  }

  return '';
};
