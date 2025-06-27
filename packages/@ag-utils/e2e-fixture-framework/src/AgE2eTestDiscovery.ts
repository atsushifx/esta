// src: ./framework/AgE2eTestDiscovery.ts
// テスト走査関数
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
// types
import type { TestCase } from '@shared/types';

// ------------------------------------
// 外部関数
// ------------------------------------

/**
 * 1段階構造用: fixtures/test-case/
 */
export const AgE2eScanFlatTests = (fixturesDir: string): readonly TestCase[] => {
  return _safeReadDirectory(fixturesDir)
    .filter(_isNotCommentedOut)
    .map((entry) => ({ entry, path: join(fixturesDir, entry) }))
    .filter(({ path }) => _isValidTestDirectory(path))
    .map(({ entry, path }) => _createTestCase(entry, entry, path));
};

/**
 * 2段階構造用: fixtures/category/test-case/
 */
export const AgE2eScanCategorizedTests = (fixturesDir: string): readonly TestCase[] => {
  return _safeReadDirectory(fixturesDir)
    .filter(_isNotCommentedOut)
    .map((entry) => ({ entry, path: join(fixturesDir, entry) }))
    .filter(({ path }) => _isDirectory(path))
    .flatMap(({ entry, path }) => _scanCategoryTestCases(path, entry));
};

// ------------------------------------
// 内部関数
// ------------------------------------

const _safeReadDirectory = (dirPath: string): readonly string[] => {
  try {
    return Object.freeze(readdirSync(dirPath));
  } catch {
    return Object.freeze([]);
  }
};

const _isDirectory = (dirPath: string): boolean => {
  try {
    return statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
};

const _isCommentedOut = (dirName: string): boolean => {
  return dirName.startsWith('#');
};

const _isNotCommentedOut = (dirName: string): boolean => {
  return !_isCommentedOut(dirName);
};

const _isValidTestDirectory = (dirPath: string): boolean => {
  if (!_isDirectory(dirPath)) {
    return false;
  }

  const files = _safeReadDirectory(dirPath);
  return _hasInputFile(files) && _hasOutputFile(files);
};

const _hasInputFile = (files: readonly string[]): boolean => {
  return files.some((file) => file.startsWith('input.'));
};

const _hasOutputFile = (files: readonly string[]): boolean => {
  return files.includes('output.json');
};

const _createTestCase = (type: string, name: string, path: string): TestCase => {
  return Object.freeze({
    type,
    name,
    path,
  });
};

const _scanCategoryTestCases = (categoryDir: string, categoryName: string): readonly TestCase[] => {
  return _safeReadDirectory(categoryDir)
    .filter(_isNotCommentedOut)
    .map((entry) => ({ entry, path: join(categoryDir, entry) }))
    .filter(({ path }) => _isValidTestDirectory(path))
    .map(({ entry, path }) =>
      _createTestCase(
        categoryName,
        `${categoryName}/${entry}`,
        path,
      )
    );
};
