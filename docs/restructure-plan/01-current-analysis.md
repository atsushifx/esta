# Current System Analysis

# 現状システム分析

## パッケージ構成の詳細分析

### 現在のパッケージマップ

```
esta/
├── packages/
│   ├── @agla-e2e/fileio-framework/          # E2Eテストフレームワーク
│   ├── @agla-utils/ag-logger/               # 構造化ログ
│   ├── @esta-actions/tools-installer/       # GitHub Actions ツールインストーラー
│   ├── @esta-core/
│   │   ├── error-handler/                   # プロセス終了型エラー処理
│   │   ├── esta-config/                     # ESTA設定管理
│   │   ├── feature-flags/                   # フィーチャーフラグ
│   │   └── tools-config/                    # ツール設定管理
│   ├── @esta-system/exit-status/            # システム終了ステータス
│   └── @esta-utils/
│       ├── command-runner/                  # コマンド実行
│       ├── config-loader/                   # 汎用設定ローダー
│       ├── get-platform/                    # プラットフォーム検出
│       └── utils/                           # 統合ユーティリティ
└── shared/packages/
    ├── constants/                           # 共有定数
    └── types/                              # 共有型（未活用）
```

## 重複機能の詳細分析

### 1. 設定読み込み機能（最大の重複）

**重複パッケージ**: 3個

- `@esta-utils/config-loader` - 汎用設定ファイルローダー
- `@esta-core/tools-config/core/config/` - ツール設定専用
- `@esta-core/esta-config/configLoader.ts` - Esta設定専用

**重複する機能**:

```typescript
// 3箇所でほぼ同じ実装
async function loadConfig<T>(path: string): Promise<T | null> {
  // JSON/YAML/JS/TS解析
  // ファイル検索
  // バリデーション
  // エラーハンドリング
}
```

**統合による削減効果**: 約60%のコード削減

### 2. パス操作機能

**重複パッケージ**: 2個

- `@esta-core/tools-config/utils/pathUtils.ts` - 高機能版
- `@esta-core/esta-config/utils/pathNormalize.ts` - 基本版

**機能差異**:

```typescript
// tools-config版（高機能）
export const validateAndNormalizePath = (path: string): string => {
  // バリデーション + 正規化 + GitHub Actions対応
};

// esta-config版（基本）
export const normalizePath = (path: string): string => {
  // 基本的な正規化のみ
};
```

### 3. バリデーション機能

**重複パッケージ**: 複数

- `@esta-core/tools-config/tools-validator/` - eget専用バリデーター
- `@esta-core/esta-config/validators/` - Esta設定バリデーター
- 各パッケージでの個別バリデーション実装

### 4. ファイル操作機能

**重複パッケージ**: 2個

- `@agla-e2e/fileio-framework/utils/` - E2E用ファイル操作
- `@esta-actions/tools-installer/utils/` - インストール用ディレクトリ操作

## エラーハンドリングパターンの不統一

### パターン分析

```typescript
// パターン1: プロセス終了型（統一済み）
import { errorExit } from '@esta-core/error-handler';
errorExit(ExitCode.VALIDATION_FAILED, 'Validation failed');

// パターン2: null返却型
async function loadConfig(): Promise<Config | null> {
  // ファイルが見つからない場合はnull
}

// パターン3: boolean返却型
async function commandExist(): Promise<boolean> {
  // エラー詳細が失われる
}

// パターン4: throw Error型
function validatePath(path: string): string {
  if (!isValid(path)) { throw new Error('Invalid path'); }
}
```

### 問題点

1. **エラー情報の欠損**: boolean型でエラー詳細が失われる
2. **処理の不統一**: 同じ種類の処理で異なるパターン
3. **デバッグの困難**: エラー原因の特定が困難
4. **型安全性不足**: エラー時の型情報なし

## 型・定数共有の問題

### 重複する型定義

```typescript
// LogLevel型が複数箇所で定義
// @agla-utils/ag-logger/shared/types/
export type AgTLogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// @esta-core/esta-config/src/schemas/
export const LogLevelSchema = v.union([
  v.literal(0),
  v.literal(1),
  v.literal(2), // 重複！
]);

// Platform型の重複
// @esta-utils/get-platform/shared/types/
export type TPlatform = 'win32' | 'darwin' | 'linux';
// 他のパッケージでもプラットフォーム型を独自定義
```

### @shared/types の未活用

```typescript
// 現在: ほぼ空
// shared/packages/types/base/index.ts
export {};

// 理想的な活用方法
export interface SharedTypes {
  RuntimeType: 'node' | 'deno' | 'bun' | 'github-actions';
  LogLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  PlatformType: 'win32' | 'darwin' | 'linux';
  // ... 他の共通型
}
```

## ランタイム対応の不足

### 現在の対応状況

```typescript
// Node.js中心の実装
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// 部分的なDeno対応
// @esta-utils/get-platform でDeno.env使用

// Bun対応: なし
// GitHub Actions: 部分対応
```

### 対応が必要な領域

1. **ファイルシステム操作**: fs → Web File System API
2. **プロセス実行**: child_process → Deno.Command / Bun.spawn
3. **環境変数**: process.env → Deno.env / Bun.env
4. **パス操作**: path → URL / Web standards

## 依存関係の複雑さ

### 現在の依存グラフ（簡略版）

```
@shared/constants → [全パッケージ]
@agla-utils/ag-logger → [@esta-core/*, @esta-utils/*]
@esta-core/error-handler → [全パッケージ]
@esta-utils/get-platform → [@esta-utils/command-runner, @esta-actions/tools-installer]
@esta-utils/config-loader → [@esta-core/esta-config]
@esta-core/tools-config → [@esta-actions/tools-installer]
```

### 問題となる相互依存

1. **散在する依存**: 小さなパッケージ間の細かい依存関係
2. **間接依存の深さ**: A→B→C→Dのような深い依存チェーン
3. **循環依存のリスク**: 相互参照による循環依存の可能性

## パフォーマンス課題

### ビルド時間

```bash
# 現在のビルド時間（概算）
pnpm run build        # ~45秒（21パッケージ）
pnpm run test:develop  # ~30秒
pnpm run lint-all     # ~25秒
```

### バンドルサイズ

```typescript
// 重複によるバンドルサイズ増加
@esta-utils/config-loader: 15KB
@esta-core/tools-config: 25KB  // 設定機能重複
@esta-core/esta-config: 8KB   // 設定機能重複
// → 統合後予想: 30KB（38%削減）
```

## 保守性の課題

### コード理解の困難さ

1. **機能の散在**: 同じ機能が複数箇所に実装
2. **命名の不統一**: 似た機能で異なる命名規則
3. **責任境界の曖昧さ**: どこに何を実装すべきか不明確

### 変更の影響範囲

1. **横断的変更の困難**: 共通機能の変更時に複数パッケージを修正
2. **テストの重複**: 同じ機能のテストが複数箇所
3. **ドキュメントの分散**: 関連機能の説明が複数箇所に散在

## 移行の必要性

### 定量的根拠

- **パッケージ数**: 27個（管理コスト高）
- **重複コード**: 推定40-50%
- **ビルド時間**: パッケージ数に比例して増加
- **依存関係**: 50+の workspace: 依存

### 定性的根拠

- **開発者体験**: 機能発見の困難、API不統一
- **エラー対応**: デバッグ情報不足、エラー処理不統一
- **拡張性**: 新機能追加時の配置判断困難
- **保守性**: 変更時の影響範囲把握困難

この分析により、リストラクチャリングの必要性と方向性が明確になりました。
