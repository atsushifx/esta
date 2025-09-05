---
header:
  - src: packages/@agla-e2e/fileio-framework/docs/developers-guide/03-usage.ja.md
  - @(#): AgE2eFileIOFramework 使い方（Usage）
title: 使い方（Usage）
description: AgE2eFileIOFrameworkの主要APIの使い方や応用例を解説します。
version: 1.0.0
created: 2025-09-05
authors:
  - atsushifx
changes:
  - 2025-09-05: 初版作成（パッケージドキュメント標準化）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 使い方（Usage）

この章では、`AgE2eFileIOFramework` を中心に、設定ファイル操作をテストするための E2E フレームワークで利用できる主な API の使い方と応用例を紹介します。

---

### フレームワークの初期化

```typescript
import { AgE2eFileIOFramework } from '@agla-e2e/fileio-framework/src/AgE2eFileIoFramework';

const framework = new AgE2eFileIOFramework();
```

- フレームワークのインスタンスを作成。
- テスト中に繰り返し使うため、一度生成すれば使い回しが可能。

---

## 2. ファイル操作メソッドの活用例

### 2.1 ファイルの書き込み

```typescript
await framework.writeFile('./temp/example.txt', 'テスト用の内容');
```

- 指定したパスにテキストを書き込み。
- 非同期処理なので、`await`を使って完了を待つ。

### 2.2 ファイルの読み込み

```typescript
const content = await framework.readFile('./temp/example.txt');
console.log(content);
```

- ファイルの内容を文字列として取得。
- 文字コードは UTF-8を想定。

---

## 3. ディレクトリ操作

### 3.1 一時ディレクトリの作成

```typescript
const tempDir = await framework.createTempDirectory();
console.log(`一時ディレクトリを作成: ${tempDir}`);
```

- テスト用の一時ディレクトリを自動作成する。
- テスト終了後のクリーンアップにも利用可能。

### 3.2 ディレクトリの削除

```typescript
await framework.removeDirectory(tempDir);
```

- 指定したディレクトリを再帰的に削除する。

---

## 4. 応用例：ファイルの存在確認

```typescript
const exists = await framework.exists('./temp/example.txt');
if (exists) {
  console.log('ファイルが存在します');
}
```

- 指定ファイルやディレクトリの存在を確認。
- 結果は`boolean`で返される。

---

## 5. エラーハンドリング

各メソッドは Promise を返すため、`try/catch`でエラー処理を行います。

```typescript
try {
  await framework.writeFile('./temp/example.txt', '内容');
} catch (error) {
  console.error('書き込み失敗:', error);
}
```

---

## 6. まとめ

- `AgE2eFileIOFramework` はファイル・ディレクトリ操作を簡潔に扱える。
- 非同期 API を活用し、テストの信頼性と柔軟性を高めましょう。
- まずは基本 API を使いこなし、徐々に応用ケースを増やしてください。

---

*このドキュメントはAIエージェント「小紅（kobeni）」によって自動生成されました。*
