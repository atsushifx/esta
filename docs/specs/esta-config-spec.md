<!--
  src: docs/specs/esta-config-spec.md
  Copyright (c) 2025 atsushifx
  This software is released under the MIT License.
  https://opensource.org/licenses/MIT
-->

# 📘 @esta-core/config モジュール設計仕様書（簡略版）

## 1. 概要

`@esta-core/config` は、ESTA プロジェクトにおける軽量な設定管理モジュールです。`.estarc` ファイルを読み取り、**ログ出力設定**と**外部ツール設定ファイルの参照**のみを扱います。
CI/CD（例: GitHub Actions）や CLI ツールなど、シンプルな実行環境を想定した設計です。

---

## 2. 利用目的

| 用途               | 説明                                                        |
| ------------------ | ----------------------------------------------------------- |
| ログ出力の構成管理 | JSON/plain/GitHub 向けのログレベル・フォーマット定義        |
| ツール設定の委譲   | `toolsFile` により、外部 `tools.config.json` への参照を提供 |

---

## 3. 設定ファイル形式

### 3.1 サポートファイル形式

| ファイル名     | 形式 | 優先度 | 説明                 |
| -------------- | ---- | ------ | -------------------- |
| `.estarc`      | JSON | 高     | 推奨構成形式         |
| `.estarc.json` | JSON | 高     | 拡張子明示           |
| `.estarc.yaml` | YAML | 中     | YAML形式（任意対応） |

### 3.2 例: 最小設定ファイル

```json
{
  "toolsFile": "./tools.config.json",
  "logging": {
    "level": "info",
    "format": "github",
    "output": "console"
  }
}
```

---

## 4. 設定スキーマ

```ts
export interface EstaConfig {
  toolsFile?: string;
  logging?: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    format?: 'plain' | 'json' | 'github';
    output?: 'console';
  };
}
```

---

## 5. API設計

```ts
export class EstaConfig {
  static async load(options?: { configPath?: string }): Promise<EstaConfig>;

  get<T>(key: string): T | undefined;
  has(key: string): boolean;
}
```

---

## 6. 使用例

```ts
import { EstaConfig } from '@esta-core/config';

const config = await EstaConfig.load();

console.log(config.get('logging.level')); // → 'info'
console.log(config.get('toolsFile')); // → './tools.config.json'
```

---

## 7. 削除された旧要素と理由

| 削除項目       | 理由                                          |
| -------------- | --------------------------------------------- |
| runtime        | 実行環境制御は `.estarc` の責務外             |
| tools定義      | 別モジュール `@esta-core/tools-config` へ移動 |
| extensions     | 柔軟性より明示的な構成を優先                  |
| plugins/output | 簡略用途に不要                                |
| ts/js config   | 動的実行が不要な構成のため                    |

---

## 📌 補遺：実行制御フラグについて

`@esta-core/config` は構成情報に特化しており、`verbose`, `dryRun`, `quiet` などの**実行制御フラグ**は含みません。
これらは **CLI 引数** や **実行時オプション**としてアプリケーション側で制御してください。

### 推奨：実行フラグの管理構造

```ts
interface ExecutionFlags {
  dryRun?: boolean;
  verbose?: boolean;
  quiet?: boolean;
}
```

```ts
const flags = {
  dryRun: argv.dryRun || process.env.DRY_RUN === 'true',
  verbose: argv.verbose || false,
};
```

`.estarc` は構成、`flags` は挙動制御。この責務分離により、再利用性と明快さが向上します。

---

**作成日**: 2025年7月9日
**バージョン**: 2.0.0（簡略仕様）
**作成者**: atsushifx
