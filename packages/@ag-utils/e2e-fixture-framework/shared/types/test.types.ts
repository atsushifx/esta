// src: ./framework/types/test.types.ts
// テスト型定義
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export type TestCase = {
  type: string;
  name: string;
  path: string;
};

export type TestTypeInfo = {
  type: string;
  testCases: TestCase[];
};

export type FileInput = {
  content: string;
  extension: string;
};
