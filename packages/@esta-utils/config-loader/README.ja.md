---
title: "@esta-utils/config-loader"
description: "ユニバーサル設定ファイルローダー — JSON、YAML、JavaScript/TypeScript設定ファイルの統一読み込みライブラリ"
tags:
  - config
  - tools
---

## @esta-utils/config-loader

ユニバーサル設定ファイルローダー - JSON、YAML、JavaScript/TypeScript 設定ファイルの統一的な読み込みライブラリ。

### 1. 概要

アプリケーションごとに散在しがちな設定ファイル (JSON, YAML, JS, TS) を一元管理し、ファイル形式を気にせず同じ呼び出し方で読み込めるライブラリです。`loadConfig()` に必要な情報を渡すだけで、最適なファイルを自動検出・パースします。

#### 1.1 特徴

<!-- textlint-disable ja-technical-writing/max-comma -->

- 複数形式をサポート: `JSON`, `JSONC`, `YAML`, `JavaScript`, `TypeScript` の各設定ファイル形式を読み込み可能
- 型安全: TypeScript ジェネリクスによる型安全な設定読み込み
- 柔軟な検索: 複数のベース名や検索タイプ (`USER`、`SYSTEM`、`PROJECT`) をサポート
- ドットファイル対応: `.config` などのドットプレフィックス付きファイルの自動検出
- 優先順位制御: 複数の設定ファイルがある場合の読み込み優先順位
- エラーハンドリング: 詳細なエラー情報とトラブルシューティング機能

<!-- textlint-enable -->

#### 1.2 サポートされるファイル形式

| 形式       | 拡張子          | 説明                   |
| ---------- | --------------- | ---------------------- |
| JSON       | `.json`         | 標準JSON形式           |
| JSONC      | `.jsonc`        | コメント付きJSON形式   |
| YAML       | `.yaml`, `.yml` | YAML形式               |
| JavaScript | `.js`           | JavaScript設定ファイル |
| TypeScript | `.ts`           | TypeScript設定ファイル |
| 拡張子なし | (なし)          | JSON形式として処理     |

### 2. 必須環境（Prerequisites）

- Node.js: v14 以上（推奨は v16+）
- pnpm: v6 以上 / npm: v6 以上 / yarn: v1.22 以上
- TypeScript: 4.9 以上（TS 設定ファイルを使う場合）
- 対応 OS: Windows, macOS, Linux

### 3. インストール

```bash
# pnpm (推奨)
pnpm add @esta-utils/config-loader

# npm
npm install @esta-utils/config-loader

# yarn
yarn add @esta-utils/config-loader
```

### 4. 基本的な使い方

#### 4.1 基本的な設定ファイル読み込み

```typescript
import { loadConfig } from '@esta-utils/config-loader';

// リターン値: Promise<{ [key: string]: any }>
const config = await loadConfig({
  baseNames: 'myapp',
  appName: 'myapp',
});

console.log(config);
```

#### 4.2 型安全な設定読み込み

```typescript
interface AppConfig {
  name: string;
  version: string;
  debug: boolean;
  database?: {
    host: string;
    port: number;
  };
}

const config = await loadConfig<AppConfig>({
  baseNames: 'myapp',
  appName: 'myapp',
});

// configは型安全にアクセス可能
console.log(config.name); // string
console.log(config.debug); // boolean
```

#### 4.3 複数のベース名での検索

```typescript
// 優先順位: estarc → esta.config の順で検索
const config = await loadConfig({
  baseNames: ['estarc', 'esta.config'],
  appName: 'myapp',
});
```

### 5. 設定ファイル例

#### 5.1 JSON設定ファイル (myapp.json, myappRc)

```json
{
  "name": "My Application",
  "version": "1.0.0",
  "debug": true,
  "database": {
    "host": "localhost",
    "port": 5432
  }
}
```

#### 5.2 JSONC設定ファイル (myapp.jsonc)

```jsonc
{
  // アプリケーション設定
  "name": "My Application",
  "version": "1.0.0",
  /* デバッグフラグ
     開発環境でのみtrue */
  "debug": true,
  "database": {
    "host": "localhost",
    "port": 5432
  }
}
```

#### 5.3 YAML設定ファイル (myapp.yaml)

```yaml
name: My Application
version: 1.0.0
debug: true
database:
  host: localhost
  port: 5432
features:
  - authentication
  - logging
  - monitoring
```

#### 5.4 TypeScript設定ファイル (myapp.ts)

```typescript
export default {
  name: 'My Application',
  version: '1.0.0',
  debug: process.env.NODE_ENV === 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
  features: ['authentication', 'logging', 'monitoring'],
};
```

#### 5.5 JavaScript設定ファイル (myapp.js)

```javascript
module.exports = {
  name: 'My Application',
  version: '1.0.0',
  debug: process.env.NODE_ENV === 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
};
```

### 6. 高度な使用方法

#### 6.1 検索タイプの指定

```typescript
import { loadConfig, TSearchConfigFileType } from '@esta-utils/config-loader';

// ユーザー固有の設定を検索
const userConfig = await loadConfig({
  baseNames: 'myapp',
  appName: 'myapp',
  searchType: TSearchConfigFileType.USER,
});

// システム全体の設定を検索
const systemConfig = await loadConfig({
  baseNames: 'myapp',
  appName: 'myapp',
  searchType: TSearchConfigFileType.SYSTEM,
});

// プロジェクト固有の設定を検索
const projectConfig = await loadConfig({
  baseNames: 'myapp',
  appName: 'myapp',
  searchType: TSearchConfigFileType.PROJECT,
});
```

#### 6.2 設定ファイルの優先順位

同じベース名で複数の拡張子のファイルが存在する場合、以下の優先順位で読み込まれます。

1. `.ts` (TypeScript)
2. `.js` (JavaScript)
3. `.yaml` (YAML)
4. `.yml` (YAML)
5. `.jsonc` (JSONC)
6. `.json` (JSON)
7. 拡張子なし (JSON として処理)

#### 6.3 ドットファイルの優先順位

- `myapp.json` > `.myapp.json` (ドットなしファイルが優先)
- ドットプレフィックス付きファイルは、通常ファイルが見つからない場合のフォールバック

### 7 API リファレンス

#### `loadConfig<T>(options: LoadConfigOptions): Promise<T>`

| 引数    | 型                  | 説明                                        |
| ------- | ------------------- | ------------------------------------------- |
| options | `LoadConfigOptions` | `baseNames`, `appName`, `searchType` を指定 |

設定ファイルを読み込み、解析された設定オブジェクトを返します。

**リターン値**:

- `Promise<T>`: 解析された設定オブジェクト

**例外**:

- 設定ファイルが見つからない場合、`Error`をスロー

#### `parseConfig<T>(extension: string, content: string): Promise<T>`

設定ファイルの内容を解析します。
(拡張子に対応した`parseXXX`関数を使用します)

| 引数         | 型       | 説明               |
| ------------ | -------- | ------------------ |
| `extensions` | `string` | ファイル拡張子     |
| `content`    | `string` | 設定ファイルの内容 |

**リターン値**:

- `Promise<T>`: 解析された設定オブジェクト

#### `findConfigFile(baseNames: string[], appName: string, searchType: TSearchConfigFileType): string`

設定ファイルのパスを検索します。

| 引数         | 型                  | 説明                                                 |
| ------------ | ------------------- | ---------------------------------------------------- |
| `baseNames`  | `string[]`          | 設定ファイルリスト                                   |
| `appName`    | `string`            | アプリケーション名 (`.config/<appName>`のように使用) |
| `searchType` | `TSearchConfigType` | パス検索種別 ('System', 'User', 'Project')           |

**リターン値**:

- `string`: 見つかった設定ファイルのパス

### 8. エラーハンドリング

#### 一般的なエラーパターン

```typescript
try {
  const config = await loadConfig({
    baseNames: 'myapp',
    appName: 'myapp',
  });
} catch (error) {
  if (error.message.includes('Config file not found')) {
    console.error('設定ファイルが見つかりません');
    // デフォルト設定を使用
    const defaultConfig = { name: 'Default App', debug: false };
  } else {
    console.error('設定ファイルの読み込みエラー:', error.message);
  }
}
```

#### 設定ファイル形式エラー

```typescript
try {
  const config = await parseConfig('.json', invalidJsonContent);
} catch (error) {
  console.error('JSON解析エラー:', error.message);
  // 構文エラーの詳細情報を取得
}
```

### 9. トラブルシューティング

#### 9.1 設定ファイルが見つからない

```bash
Error: Config file not found.
```

**解決方法:**

- ファイル名とパスを確認
- `appName`が正しく設定されているか確認
- 検索タイプが適切か確認

#### 9.2 JSON構文エラー

```bash
Error: Unexpected token } in JSON
```

**解決方法:**

- JSON 構文を確認（末尾のカンマ、クォートの対応など）
- JSONC ファイルの場合は`.jsonc`拡張子を使用

#### 9.3 YAML解析エラー

```bash
Error: bad indentation of a mapping entry
```

**解決方法:**

- YAML インデントを確認（スペースとタブの混在を避ける）
- 文字列に特殊文字がある場合はクォートで囲む

#### 9.4 TypeScript/JavaScript実行エラー

```bash
Error: Cannot resolve module
```

**解決方法:**

- 必要な依存関係がインストールされているか確認
- モジュールパスが正しいか確認

### 10. デバッグ

#### 10.1 詳細ログの有効化

```typescript
// 環境変数でデバッグモードを有効化
process.env.DEBUG = 'config-loader:*';

const config = await loadConfig({
  baseNames: 'myapp',
  appName: 'myapp',
});
```

#### 10.2 検索パスの確認

```typescript
import { findConfigFile } from '@esta-utils/config-loader';

// 実際の検索パスを確認
try {
  const filePath = findConfigFile(['myapp'], 'myapp', TSearchConfigFileType.USER);
  console.log('見つかった設定ファイル:', filePath);
} catch (error) {
  console.error('検索エラー:', error.message);
}
```

### 11. パフォーマンス考慮事項

#### 11.1 推奨事項

1. **設定ファイルのキャッシュ**: 頻繁に読み込む場合は結果をキャッシュ
2. **ベース名の順序**: よく使用するファイル形式を最初に指定
3. **検索範囲の限定**: 必要な検索タイプのみを使用

#### 11.2 例: 設定キャッシュの実装

```typescript
class ConfigCache {
  private cache = new Map<string, any>();

  async getConfig<T>(options: LoadConfigOptions): Promise<T> {
    const key = JSON.stringify(options);

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const config = await loadConfig<T>(options);
    this.cache.set(key, config);
    return config;
  }

  clear(): void {
    this.cache.clear();
  }
}

const configCache = new ConfigCache();
const config = await configCache.getConfig({ baseNames: 'myapp', appName: 'myapp' });
```

### ライセンス、その他

#### 貢献

プルリクエストやイシューは歓迎します。貢献ガイドラインについては、プロジェクトルートの`CONTRIBUTING.md`を参照してください。

#### 関連パッケージ

- `@esta-utils/get-platform`: プラットフォーム検出ユーティリティ
- `@agla-e2e/fileio-framework`: E2E テストフレームワーク

#### ライセンス

Copyright © 2025- atsushifx <http://github.com/atsushifx>
Released under the MIT License
https://opensource.org/license/mit

Powered by AI エージェント [Elpha, Kobeni, Tsumugi]
