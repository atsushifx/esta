---
header:
  - src: packages/@agla-e2e/fileio-framework/docs/developers-guide/04-api-guide.ja.md
  - @(#): AgE2eFileIOFramework APIガイド (API Guide)
title: ファイルIOフレームワーク APIガイド (API Guide)
description: AgE2eFileIOFrameworkの主要APIを機能別に分類し、使い方と共に解説します。
version: 1.0.0
created: 2025-09-05
authors:
  - atsushifx
changes:
  - 2025-09-05: 初版作成 (パッケージドキュメント標準化)
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## APIガイド（API Guide）

このドキュメントでは、`AgE2eFileIOFramework` および関連ユーティリティの主なメソッドを機能別に分類し、
使い方や返り値などをわかりやすくまとめています。

### ファイル操作系

<!-- markdownlint-disable line-length -->

| メソッド名   | 説明                               | 引数                                  | 戻り値             | 備考                       |
| ------------ | ---------------------------------- | ------------------------------------- | ------------------ | -------------------------- |
| `writeFile`  | ファイルに文字列を書き込む         | `filePath: string`, `content: string` | `Promise<void>`    | UTF-8文字列対応            |
| `readFile`   | ファイルの内容を文字列で取得       | `filePath: string`                    | `Promise<string>`  | UTF-8文字列対応            |
| `exists`     | ファイルやディレクトリの存在を確認 | `path: string`                        | `Promise<boolean>` | 存在すれば`true`           |
| `removeFile` | ファイルを削除                     | `filePath: string`                    | `Promise<void>`    | 存在しない場合は無視される |

<!-- markdownlint-enable -->

## 2. ディレクトリ操作系

<!-- markdownlint-disable line-length -->

| メソッド名            | 説明                               | 引数              | 戻り値            | 備考                             |
| --------------------- | ---------------------------------- | ----------------- | ----------------- | -------------------------------- |
| `createTempDirectory` | 一時ディレクトリを作成する         | なし              | `Promise<string>` | 作成したディレクトリのパスを返す |
| `removeDirectory`     | ディレクトリを再帰的に削除する     | `dirPath: string` | `Promise<void>`   | 存在しない場合は無視される       |
| `removeDirectorySync` | 同期的にディレクトリを再帰削除する | `dirPath: string` | `void`            | テスト外での利用推奨             |

<!-- markdownlint-enable -->

## 3. 使い方例

### ファイル書き込みと読み込み

```typescript
await framework.writeFile('./temp/sample.txt', 'サンプルテキスト');
const content = await framework.readFile('./temp/sample.txt');
console.log(content); // サンプルテキスト
```

### 一時ディレクトリの作成と削除

```typescript
const tempDir = await framework.createTempDirectory();
console.log(tempDir);
// 処理後
await framework.removeDirectory(tempDir);
```

## 4. 注意点

- すべての非同期メソッドは Promise を返すため、`await`を使った呼び出しが推奨される。
- 同期的なディレクトリ削除は主にスクリプトや初期化処理での利用を想定している。
