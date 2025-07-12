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
- エラーハンドリング: ExitError による構造化されたエラー情報とエラーコード

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

try {
  const config = await loadConfig({
    baseNames: 'myapp',
    appName: 'myapp',
  });

  if (config === null) {
    console.log('設定ファイルが見つかりません');
    // デフォルト設定を使用
  } else {
    console.log(config);
  }
} catch (error: any) {
  // ExitError のハンドリング
  console.error('設定読み込みエラー:', error.message);
}
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

try {
  const config = await loadConfig<AppConfig>({
    baseNames: 'myapp',
    appName: 'myapp',
  });

  if (config === null) {
    // デフォルト設定を使用
    const defaultConfig: AppConfig = {
      name: 'Default App',
      version: '1.0.0',
      debug: false,
    };
    // configは型安全にアクセス可能
    console.log(defaultConfig.name); // string
    console.log(defaultConfig.debug); // boolean
  } else {
    // configは型安全にアクセス可能
    console.log(config.name); // string
    console.log(config.debug); // boolean
  }
} catch (error: any) {
  console.error('設定読み込みエラー:', error.code, error.message);
}
```

#### 4.3 複数のベース名での検索

```typescript
// 優先順位: estarc → esta.config の順で検索
try {
  const config = await loadConfig({
    baseNames: ['estarc', 'esta.config'],
    appName: 'myapp',
  });

  if (config === null) {
    console.log('どの設定ファイルも見つかりません');
  } else {
    console.log('設定を読み込みました:', config);
  }
} catch (error: any) {
  console.error('設定読み込みエラー:', error.code, error.message);
}
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

- ファイル I/O エラーが発生した場合: `ExitError` (エラーコード: `FILE_IO_ERROR`)
- 設定ファイルの解析に失敗した場合: `ExitError` (エラーコード: `CONFIG_ERROR`)
- 不明なエラーが発生した場合: `ExitError` (エラーコード: `UNKNOWN_ERROR`)
- 設定ファイルが見つからない場合: `null` を返す（エラーは投げない）

#### `parseConfig<T>(extension: string, content: string): Promise<T>`

設定ファイルの内容を解析します。
(拡張子に対応した`parseXXX`関数を使用します)

| 引数         | 型       | 説明               |
| ------------ | -------- | ------------------ |
| `extensions` | `string` | ファイル拡張子     |
| `content`    | `string` | 設定ファイルの内容 |

**リターン値**:

- `Promise<T>`: 解析された設定オブジェクト

**例外**:

- サポートされていないスクリプト形式の場合: `Error`
- スクリプト実行に失敗した場合: `Error`

#### `findConfigFile(baseNames: string[], appName: string, searchType: TSearchConfigFileType): string | null`

設定ファイルのパスを検索します。

| 引数         | 型                  | 説明                                                 |
| ------------ | ------------------- | ---------------------------------------------------- |
| `baseNames`  | `string[]`          | 設定ファイルリスト                                   |
| `appName`    | `string`            | アプリケーション名 (`.config/<appName>`のように使用) |
| `searchType` | `TSearchConfigType` | パス検索種別 ('System', 'User', 'Project')           |

**リターン値**:

- `string | null`: 見つかった設定ファイルのパス、見つからない場合は `null`

### 8. エラーハンドリング

`@esta-utils/config-loader` は、`ExitError` を使用して構造化されたエラー情報を提供します。

#### 8.1 エラーの種類

| エラーコード    | 説明                      | 例                                       |
| --------------- | ------------------------- | ---------------------------------------- |
| `FILE_IO_ERROR` | ファイル I/O 関連のエラー | ファイルが存在しない、アクセス権限エラー |
| `CONFIG_ERROR`  | 設定ファイル解析エラー    | 不正なJSON、YAML構文エラー               |
| `UNKNOWN_ERROR` | 予期しないエラー          | その他の不明なエラー                     |

#### 8.2 ExitError の構造

```typescript
interface ExitError extends Error {
  code: string; // エラーコード（FILE_IO_ERROR, CONFIG_ERROR, など）
  message: string; // 詳細なエラーメッセージ
}
```

#### 8.3 一般的なエラーハンドリングパターン

```typescript
import { loadConfig } from '@esta-utils/config-loader';
import { ExitCode } from '@shared/constants';

try {
  const config = await loadConfig({
    baseNames: 'myapp',
    appName: 'myapp',
  });

  if (config === null) {
    console.log('設定ファイルが見つかりません。デフォルト設定を使用します。');
    // デフォルト設定を使用
    const defaultConfig = { name: 'Default App', debug: false };
    return defaultConfig;
  }

  return config;
} catch (error: any) {
  if (error.code === ExitCode.FILE_IO_ERROR) {
    console.error('ファイル I/O エラー:', error.message);
    // ファイルアクセス権限やディスク容量を確認
  } else if (error.code === ExitCode.CONFIG_ERROR) {
    console.error('設定ファイル解析エラー:', error.message);
    // 設定ファイルの構文を確認
  } else if (error.code === ExitCode.UNKNOWN_ERROR) {
    console.error('不明なエラー:', error.message);
    // ログに記録し、開発者に報告
  } else {
    console.error('予期しないエラー:', error.message);
  }

  // エラー時のフォールバック処理
  throw error;
}
```

#### 8.4 ファイル I/O エラーの詳細

```typescript
try {
  const config = await loadConfig({ baseNames: 'myapp', appName: 'myapp' });
} catch (error: any) {
  if (error.code === ExitCode.FILE_IO_ERROR) {
    // Node.js の errno による詳細判定
    if (error.message.includes('ENOENT')) {
      console.error('ファイルまたはディレクトリが存在しません');
    } else if (error.message.includes('EACCES')) {
      console.error('ファイルアクセス権限がありません');
    } else if (error.message.includes('ENOSPC')) {
      console.error('ディスク容量が不足しています');
    }
  }
}
```

#### 8.5 設定ファイル形式エラー

```typescript
try {
  const config = await parseConfig('.json', invalidJsonContent);
} catch (error: any) {
  if (error.code === ExitCode.CONFIG_ERROR) {
    console.error('設定ファイル解析エラー:', error.message);

    // ファイル形式別の対処法
    if (error.message.includes('JSON')) {
      console.log('JSON構文を確認してください（末尾のカンマ、クォートの対応など）');
    } else if (error.message.includes('YAML')) {
      console.log('YAMLインデントを確認してください（スペースとタブの混在を避ける）');
    } else if (error.message.includes('script')) {
      console.log('JavaScript/TypeScriptの構文とexport文を確認してください');
    }
  }
}
```

### 9. トラブルシューティング

#### 9.1 設定ファイルが見つからない

`loadConfig` は設定ファイルが見つからない場合、エラーを投げずに `null` を返します。

```typescript
const config = await loadConfig({ baseNames: 'myapp', appName: 'myapp' });

if (config === null) {
  console.log('設定ファイルが見つかりません');
  // デフォルト設定を使用するか、エラーハンドリングを実行
}
```

**確認事項:**

- ファイル名とパスを確認
- `appName`が正しく設定されているか確認
- 検索タイプが適切か確認

#### 9.2 JSON構文エラー（CONFIG_ERROR）

```typescript
// ExitError with code: CONFIG_ERROR
// message: "Failed to parse config file '/path/to/config.json': Unexpected token } in JSON"
```

**解決方法:**

- JSON 構文を確認（末尾のカンマ、クォートの対応など）
- JSONC ファイルの場合は`.jsonc`拡張子を使用
- エラーメッセージから具体的な構文エラー箇所を特定

#### 9.3 YAML解析エラー（CONFIG_ERROR）

```typescript
// ExitError with code: CONFIG_ERROR
// message: "Failed to parse config file '/path/to/config.yaml': bad indentation of a mapping entry"
```

**解決方法:**

- YAML インデントを確認（スペースとタブの混在を避ける）
- 文字列に特殊文字がある場合はクォートで囲む
- YAML構文チェッカーでファイルを検証

#### 9.4 TypeScript/JavaScript実行エラー（CONFIG_ERROR）

```typescript
// ExitError with code: CONFIG_ERROR
// message: "Failed to parse config file '/path/to/config.ts': tsx execution failed: Cannot resolve module"
```

**解決方法:**

- 必要な依存関係がインストールされているか確認
- モジュールパスが正しいか確認
- TypeScript設定ファイル（tsconfig.json）を確認
- サポートされているスクリプト形式（export default、defineConfig、オブジェクトリテラル）を使用

#### 9.5 ファイルアクセス権限エラー（FILE_IO_ERROR）

```typescript
// ExitError with code: FILE_IO_ERROR
// message: "File I/O error accessing config file '/path/to/config.json': EACCES: permission denied"
```

**解決方法:**

- ファイルまたはディレクトリの読み取り権限を確認
- 実行ユーザーに適切な権限を付与
- ファイルパスが正しいか確認

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
