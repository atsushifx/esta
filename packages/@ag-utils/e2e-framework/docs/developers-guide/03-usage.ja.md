---
title: 使い方（Usage）
description: ESTA E2Eテストフレームワークの主要APIの使い方や応用例を解説します。
sidebar_position: 3
---

# 使い方（Usage）

この章では、`AgE2eFileIOFramework` を中心に、ESTAのE2Eテストフレームワークで利用できる主なAPIの使い方と応用例を紹介します。

---

## 1. フレームワークの初期化

```typescript
import { AgE2eFileIOFramework } from '@ag-utils/e2e-framework/src/AgE2eFileIoFramework';

const framework = new AgE2eFileIOFramework();
```

- フレームワークのインスタンスを作成します。
- テスト中に繰り返し使うため、一度生成すれば使い回しが可能です。

---

## 2. ファイル操作メソッドの活用例

### 2.1 ファイルの書き込み

```typescript
await framework.writeFile('./temp/example.txt', 'テスト用の内容');
```

- 指定したパスにテキストを書き込みます。
- 非同期処理なので、`await`を使って完了を待ちます。

### 2.2 ファイルの読み込み

```typescript
const content = await framework.readFile('./temp/example.txt');
console.log(content);
```

- ファイルの内容を文字列として取得します。
- 文字コードはUTF-8を想定しています。

---

## 3. ディレクトリ操作

### 3.1 一時ディレクトリの作成

```typescript
const tempDir = await framework.createTempDirectory();
console.log(`一時ディレクトリを作成: ${tempDir}`);
```

- テスト用の一時ディレクトリを自動作成します。
- テスト終了後のクリーンアップにも利用可能です。

### 3.2 ディレクトリの削除

```typescript
await framework.removeDirectory(tempDir);
```

- 指定したディレクトリを再帰的に削除します。

---

## 4. 応用例：ファイルの存在確認

```typescript
const exists = await framework.exists('./temp/example.txt');
if (exists) {
  console.log('ファイルが存在します');
}
```

- 指定ファイルやディレクトリの存在を確認します。
- 結果は`boolean`で返されます。

---

## 5. エラーハンドリング

各メソッドはPromiseを返すため、`try/catch`でエラー処理を行います。

```typescript
try {
  await framework.writeFile('./temp/example.txt', '内容');
} catch (error) {
  console.error('書き込み失敗:', error);
}
```

---

## 6. まとめ

- `AgE2eFileIOFramework` はファイル・ディレクトリ操作を簡潔に扱えます。
- 非同期APIを活用し、テストの信頼性と柔軟性を高めましょう。
- まずは基本APIを使いこなし、徐々に応用ケースを増やしてください。

---

*このドキュメントはAIエージェント「小紅（kobeni）」によって自動生成されました。*
