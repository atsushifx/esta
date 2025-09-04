---
header:
  - src: docs/specs/@agla-e2e--fileio-framework.spec.md
  - @(#): E2Eファイル入出力テストフレームワーク仕様書
title: 📁 E2Eファイル入出力テストフレームワーク仕様書（@agla-e2e/fileio-framework）
description: E2Eテストにおけるファイル入出力操作を簡素化しテストの信頼性を向上させるフレームワークの技術仕様書
version: 1.0.0
created: 2025-09-04
authors:
  - atsushifx
changes:
  - 2025-09-04: フロントマター標準化対応
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 📁 E2Eファイル入出力テストフレームワーク仕様書

## 概要

`@agla-e2e/fileio-framework`は、E2E テストにおけるファイル入出力操作を簡素化し、テストの信頼性を向上させるためのフレームワークです。ファイル操作のテスト、一時ファイルの管理、非同期・同期両方のファイル操作をサポートします。

## 主要機能

### 1. ファイル操作テスト支援

- 同期・非同期両方のファイル操作 API
- テスト用一時ファイルの作成・管理
- ファイル内容の検証機能

### 2. テストデータ管理

- テストフィクスチャの作成・管理
- 一時ディレクトリの自動作成・削除
- テストデータの分離

### 3. 非同期操作サポート

- Promise/async-await ベースの API
- 同期処理との統一インターフェース
- エラーハンドリングの統一

## API仕様

### 主要クラス

#### `AgE2eFileIoFramework`

E2E ファイル操作テストのメインクラス。

**主要メソッド:**

- `createTempFile(content?: string): Promise<string>` - 一時ファイル作成
- `createTempDir(): Promise<string>` - 一時ディレクトリ作成
- `writeFile(path: string, content: string): Promise<void>` - ファイル書き込み
- `readFile(path: string): Promise<string>` - ファイル読み込み
- `deleteFile(path: string): Promise<void>` - ファイル削除
- `fileExists(path: string): Promise<boolean>` - ファイル存在確認
- `cleanup(): Promise<void>` - 一時ファイルクリーンアップ

#### ユーティリティ関数

```typescript
// 非同期操作
export async function createTestFile(content: string): Promise<string>;
export async function readTestFile(path: string): Promise<string>;
export async function deleteTestFile(path: string): Promise<void>;

// 同期操作
export function createTestFileSync(content: string): string;
export function readTestFileSync(path: string): string;
export function deleteTestFileSync(path: string): void;
```

## 型定義

```typescript
interface E2eFileOptions {
  readonly tempDir?: string;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly cleanup?: boolean;
}

interface FileTestResult {
  readonly path: string;
  readonly content: string;
  readonly size: number;
  readonly created: Date;
}

type AsyncFileOperation<T> = (path: string) => Promise<T>;
type SyncFileOperation<T> = (path: string) => T;
```

## 使用例

### 基本的な使用

```typescript
import { AgE2eFileIoFramework } from '@agla-e2e/fileio-framework';

describe('ファイル操作テスト', () => {
  let fileFramework: AgE2eFileIoFramework;

  beforeEach(() => {
    fileFramework = new AgE2eFileIoFramework();
  });

  afterEach(async () => {
    await fileFramework.cleanup();
  });

  it('ファイル作成・読み込み・削除', async () => {
    // ファイル作成
    const filePath = await fileFramework.createTempFile('test content');

    // ファイル存在確認
    expect(await fileFramework.fileExists(filePath)).toBe(true);

    // ファイル読み込み
    const content = await fileFramework.readFile(filePath);
    expect(content).toBe('test content');

    // ファイル削除
    await fileFramework.deleteFile(filePath);
    expect(await fileFramework.fileExists(filePath)).toBe(false);
  });
});
```

### 設定ファイルテスト

```typescript
import { AgE2eFileIoFramework } from '@agla-e2e/fileio-framework';
import { loadConfig } from '@esta-utils/config-loader';

describe('設定ファイル読み込みテスト', () => {
  let fileFramework: AgE2eFileIoFramework;

  beforeEach(() => {
    fileFramework = new AgE2eFileIoFramework();
  });

  afterEach(async () => {
    await fileFramework.cleanup();
  });

  it('JSON設定ファイルの読み込み', async () => {
    // テスト用設定ファイル作成
    const configContent = JSON.stringify({
      name: 'test-app',
      version: '1.0.0',
      debug: true,
    });

    const configPath = await fileFramework.createTempFile(configContent);

    // 設定ファイル読み込みテスト
    const config = await loadConfig({
      configName: path.basename(configPath, '.json'),
      searchDirs: [path.dirname(configPath)],
    });

    expect(config.name).toBe('test-app');
    expect(config.version).toBe('1.0.0');
    expect(config.debug).toBe(true);
  });
});
```

### 複数ファイル操作テスト

```typescript
import { AgE2eFileIoFramework } from '@agla-e2e/fileio-framework';

describe('複数ファイル操作テスト', () => {
  let fileFramework: AgE2eFileIoFramework;

  beforeEach(() => {
    fileFramework = new AgE2eFileIoFramework();
  });

  afterEach(async () => {
    await fileFramework.cleanup();
  });

  it('複数ファイルの一括操作', async () => {
    // 一時ディレクトリ作成
    const tempDir = await fileFramework.createTempDir();

    // 複数ファイル作成
    const files = ['file1.txt', 'file2.txt', 'file3.txt'];
    const createdFiles = [];

    for (const [index, fileName] of files.entries()) {
      const filePath = path.join(tempDir, fileName);
      await fileFramework.writeFile(filePath, `Content ${index + 1}`);
      createdFiles.push(filePath);
    }

    // 作成されたファイルの確認
    for (const filePath of createdFiles) {
      expect(await fileFramework.fileExists(filePath)).toBe(true);
    }

    // ファイル内容の確認
    const content1 = await fileFramework.readFile(createdFiles[0]);
    expect(content1).toBe('Content 1');
  });
});
```

### 同期・非同期両対応

```typescript
import {
  createTestFile,
  createTestFileSync,
  readTestFile,
  readTestFileSync,
} from '@agla-e2e/fileio-framework';

describe('同期・非同期操作テスト', () => {
  it('非同期操作', async () => {
    const filePath = await createTestFile('async content');
    const content = await readTestFile(filePath);

    expect(content).toBe('async content');
  });

  it('同期操作', () => {
    const filePath = createTestFileSync('sync content');
    const content = readTestFileSync(filePath);

    expect(content).toBe('sync content');
  });
});
```

## 内部実装

### ファイル操作抽象化

```typescript
class AgE2eFileIoFramework {
  private tempFiles: Set<string> = new Set();
  private tempDirs: Set<string> = new Set();

  async createTempFile(content?: string): Promise<string> {
    const tempFile = path.join(os.tmpdir(), `test-${Date.now()}-${Math.random().toString(36).slice(2)}`);

    if (content) {
      await fs.writeFile(tempFile, content, 'utf8');
    } else {
      await fs.writeFile(tempFile, '', 'utf8');
    }

    this.tempFiles.add(tempFile);
    return tempFile;
  }

  async cleanup(): Promise<void> {
    // 一時ファイルの削除
    for (const file of this.tempFiles) {
      try {
        await fs.unlink(file);
      } catch (error) {
        // エラーを無視（ファイルが既に削除されている場合など）
      }
    }

    // 一時ディレクトリの削除
    for (const dir of this.tempDirs) {
      try {
        await fs.rmdir(dir, { recursive: true });
      } catch (error) {
        // エラーを無視
      }
    }

    this.tempFiles.clear();
    this.tempDirs.clear();
  }
}
```

### エラーハンドリング

```typescript
class FileOperationError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly path: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'FileOperationError';
  }
}

function handleFileError(operation: string, path: string, error: Error): never {
  throw new FileOperationError(
    `Failed to ${operation} file: ${path}`,
    operation,
    path,
    error,
  );
}
```

## 設計原則

### 1. テストの独立性

- 各テストケースで独立した一時ファイルを使用
- テスト間でのファイル共有を回避
- 自動クリーンアップによる影響排除

### 2. 使いやすさ

- 直感的な API 設計
- 同期・非同期両対応
- エラーメッセージの充実

### 3. 信頼性

- 確実なクリーンアップ機能
- エラーハンドリングの統一
- テストの再実行性確保

### 4. 拡張性

- 新しいファイル操作の追加容易性
- カスタムファイル操作の実装支援
- プラグイン機能の検討

## 依存関係

### 外部依存

- `fs/promises`: Node.js 標準ファイルシステム API
- `path`: パス操作ユーティリティ
- `os`: OS 情報取得

### 内部依存

- `@shared/types`: 共通型定義
- `@shared/constants`: 共通定数

## テスト仕様

### ユニットテスト

- 各 API 関数の動作確認
- エラーハンドリングの検証
- 同期・非同期両方の動作確認

### 統合テスト

- 実際のファイル操作での動作確認
- クリーンアップ機能の検証
- パフォーマンステスト

## 使用場面

### 1. 設定ファイルのテスト

```typescript
// 設定ファイル読み込み機能のテスト
it('設定ファイル読み込みテスト', async () => {
  const configData = { name: 'test', version: '1.0.0' };
  const configPath = await fileFramework.createTempFile(JSON.stringify(configData));

  const loadedConfig = await loadConfig({
    configName: path.basename(configPath, '.json'),
    searchDirs: [path.dirname(configPath)],
  });

  expect(loadedConfig).toEqual(configData);
});
```

### 2. ファイル処理機能のテスト

```typescript
// ファイル処理機能のテスト
it('ファイル変換機能テスト', async () => {
  const inputContent = 'original content';
  const inputPath = await fileFramework.createTempFile(inputContent);

  // テスト対象の処理実行
  const outputPath = await processFile(inputPath);

  // 結果の確認
  const outputContent = await fileFramework.readFile(outputPath);
  expect(outputContent).toBe('processed content');
});
```

### 3. 複数ファイル操作のテスト

```typescript
// 複数ファイル操作のテスト
it('バッチ処理テスト', async () => {
  const tempDir = await fileFramework.createTempDir();

  // 複数の入力ファイル作成
  const inputFiles = [];
  for (let i = 0; i < 5; i++) {
    const filePath = path.join(tempDir, `input${i}.txt`);
    await fileFramework.writeFile(filePath, `input content ${i}`);
    inputFiles.push(filePath);
  }

  // バッチ処理実行
  const results = await processBatch(inputFiles);

  // 結果の検証
  expect(results).toHaveLength(5);
  for (const result of results) {
    expect(result.success).toBe(true);
  }
});
```
