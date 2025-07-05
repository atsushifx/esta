---
title: はじめに（Getting Started）
description: AgE2eFileIOFrameworkの環境構築と簡単なサンプルでの使い方を解説します。
sidebar_position: 2
---

# はじめに（Getting Started）

## 1. 環境構築

本プロジェクトの開発に必要なツールやバージョン要件は、
[onboarding 開発環境の前提要件](../../docs/onboarding/requirements.ja.md) を参照してください。

必要なツール例：Node.js、pnpm、Git、PowerShell など

---

## 2. テストの実行方法

設定ファイル操作のテストを実行するには以下のコマンドを使います。

```bash
pnpm run test:ci
```

- テストコードは `packages/@agla-e2e/fileio-framework/tests/e2e/` 配下にあります。
- 変更を加えた場合は必ずテストが通るか確認してください。

---

## 3. Hello, World的なテストコード例

```typescript
// vitest
import { describe, expect, it } from 'vitest';
// framework
import { AgE2eFileIOFramework } from '@agla-e2e/fileio-framework/src/AgE2eFileIoFramework';

describe('簡単な設定ファイル操作テスト', () => {
  const framework = new AgE2eFileIOFramework();

  it('ファイルを書き込み読み込む', async () => {
    const filePath = './temp/hello.txt';
    const content = 'Hello, AgE2eFileIOFramework!';

    await framework.writeFile(filePath, content);
    const readContent = await framework.readFile(filePath);

    expect(readContent).toBe(content);
  });
});
```

このHelloWorldExampleは、**Vitest**を使ってユニットテストしています。
VitestはJavaScript/TypeScript向けの軽量で高速なテストランナーで、
`describe`や`it`でテストケースを構造化し、`expect`で検証を行います。

### 1. インポート部分

```typescript
// vitest
import { describe, expect, it } from 'vitest';
// framework
import { AgE2eFileIOFramework } from '@agla-e2e/fileio-framework/src/AgE2eFileIoFramework';
```

- vitestからテスト関数をインポートし、テスト定義と検証に使用します。
- AgE2eFileIOFrameworkは設定ファイル操作をテストするためのフレームワークです。

### 2. describe ブロック

```typescript
describe('簡単な設定ファイル操作テスト', () => {
  // テストコード
});
```

- テストケースのグループ名を定義し、関連テストをまとめます。
- `Vitest`は`describe`内のテストコードを実行し、テスト結果を出力します。

### 3. it ブロック

```typescript
it('ファイルを書き込み読み込む', async () => {
  // テスト本体
});
```

- 個別のテストケースを定義。
- ここではファイルの書き込みと読み込みを検証します。

### 4. ファイル書き込み・読み込み

```typescript
await framework.writeFile(filePath, content);
const readContent = await framework.readFile(filePath);
```

- ファイルに文字列を書き込み、その後読み込みます。
- 非同期処理なので`await`で完了を待ちます。

### 5. 期待値との比較

```typescript
expect(readContent).toBe(content);
```

- 読み込んだ内容が書き込んだ内容と一致するかを検証します。
- 一致すればテスト成功、不一致なら失敗となります。

---

このテストは設定ファイル操作フレームワークの基本的なファイルI/O機能が正しく動作するかを確認するものです。
Vitestの使い方とファイル操作の流れが理解しやすいシンプルな例となっています。

---

## 4. まとめ

- 必要な環境を整え、依存パッケージをインストールするだけで準備完了。
- コマンド一つで設定ファイル操作のテストを簡単に実行可能。
- サンプルコードを参考に、まずは基本的な設定ファイル操作テストから始めましょう。

---

*このドキュメントはAIエージェント「小紅（kobeni）」によって自動生成されました。*
