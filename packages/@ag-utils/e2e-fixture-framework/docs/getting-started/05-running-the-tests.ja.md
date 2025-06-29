---
title: テストを実行する
description: fixtureテストの実行方法と、結果の読み方・CIとの連携について解説します。
sidebar_position: 5
---

## 5. テストを実行する

この章では、E2E Fixture テストの実行方法と、ログの読み方・CI環境への統合方法を説明します。

---

### ▶ ローカルでの実行

テストは通常、`vitest` や `jest` のようなテストランナー経由で実行されます。

```bash
pnpm test
```

または対象パッケージで直接：

```bash
pnpm --filter @your-scope/<テスト対象パッケージ名> test
```

---

### 📦 実行例（Vitest）

```bash
✓ simple-markdown > parses basic heading (42ms)
✓ multiline-text > detects paragraph boundaries
⨯ invalid-output > unexpected difference in result
  ─ expected: { "hasHeading": false }
  ─ received: { "hasHeading": true }
```

> テスト失敗時には、`output.json` との差分が表示されます (vitestなどのテストランナーにより差異あり)

---

### 🔁 特定ケースのみを実行

`it.only()` を用いて特定のfixtureケースだけを実行することができます：

```ts
const cases = AgE2eScanFlatTests('tests/e2e/fixtures/');
const target = cases.find((c) => c.name === 'multiline-text');

it.only('multiline-text', () => {
  framework.run(target);
});
```

---

### ✅ 成功条件

- `input.*` をパーサで処理し、`output.json` と一致する構造を返す
- 出力が一致しない場合、詳細な差分がログに表示されます
- Markdown のパースには、`remark`を使用します

---

### 🤖 CIとの統合

E2E Fixture テストは、CIツール（GitHub Actions, GitLab CI など）でも自動実行できます。
これにより、**新たなパーサの実装やリファクタにより、過去の入力出力が壊れていないかを継続的に検証**できます。

たとえば GitHub Actions では以下のように設定します：

```yaml
- name: Run fixture tests
  run: pnpm test
```

> ✅ **mainブランチへのマージ前に自動で全fixtureが検証されることで、回帰バグを未然に防げます。**
