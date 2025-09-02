# テストケース再構成 - 引き継ぎドキュメント

Generated: 2025-08-31\
Current Working Directory: `C:\Users\atsushifx\workspaces\develop\esta\shared\packages\types`\
Branch: feat-118/esta/agla-error\
Project: ESTA Monorepo - @shared/types Package

## エグゼクティブサマリー

このドキュメントは、`@shared/types`パッケージのテストケース再構成プロジェクトの引き継ぎ情報を提供します。現状の94テストを起点に、必要に応じてテスト追加を許容しつつ、Given/When/Then構造での3階層describe + 正常系/異常系/エッジケース統合を実現するプロジェクトです。なお、本パッケージ（抽象層）ではランタイムガード/フォールバック処理は実装せず、実装クラスやファクトリ層で扱う方針とします。

### 主要成果物

1. **詳細実行計画書**: [TODO.md](TODO.md) - 完全な実装仕様とタスクID付きチェックリスト
2. **現状テスト分析**: 94テスト（ユニット82 + ファンクショナル4 + インテグレーション8）の完全分析済み
3. **この引き継ぎドキュメント**: プロジェクト背景と実装指針

## プロジェクト背景・目的

### モノレポ構造概要

```
esta/ (root)
├── packages/              # メイン機能パッケージ
│   ├── @esta-core/        # コアインフラ (error-handler含む)
│   ├── @esta-actions/     # GitHub Actions統合
│   ├── @esta-utils/       # アプリケーションユーティリティ
│   └── @agla-utils/       # 汎用ユーティリティ (ag-logger含む)
├── shared/packages/       # 内部共有モジュール
│   ├── constants/         # 共有定数
│   └── types/            # 🎯 対象パッケージ - AglaError抽象クラス
└── docs/                 # プロジェクトドキュメント
```

### AglaError/ErrorSeverity アーキテクチャ理解

#### **抽象ベースクラス (types/AglaError.types.ts:59-152)**

```typescript
export abstract class AglaError extends Error {
  // コアプロパティ (ゲッターで公開)
  get errorType(): string;
  get code(): string | undefined;
  get severity(): ErrorSeverity | undefined;
  get timestamp(): Date | undefined;
  get context(): Record<string, unknown> | undefined;

  // コアメソッド
  constructor(errorType: string, message: string, options?: AglaErrorOptions);
  toString(): string;
  toJSON(): object;
  abstract chain(cause: Error): AglaError; // 具象クラスで実装必須
}
```

#### **ErrorSeverity列挙型 (types/ErrorSeverity.types.ts:13-22)**

```typescript
export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}
```

### 現在のテストカバレッジ分析

#### **既存テストレベル構成** ✅

```
src/__tests__/
├── AglaError.spec.ts                    # メインユニットテスト (48テスト)
├── ErrorSeverity.spec.ts                # 列挙型テスト (23テスト)
├── AglaError.chain-compatibility.spec.ts # チェーン互換性 (3テスト)
├── AglaError.inheritance.spec.ts        # 継承テスト (3テスト)
├── AglaError.serialization.spec.ts     # シリアライゼーション (3テスト)
├── AglaError.typescript.spec.ts        # TypeScript型安全性 (2テスト)
├── functional/
│   ├── AglaError.functional.spec.ts     # 機能レベルテスト (3テスト)
│   └── ErrorSeverity.functional.spec.ts # 列挙型機能テスト (1テスト)
└── helpers/
    ├── TestAglaError.class.ts           # 具象テスト実装
    └── test-types.ts                     # テストユーティリティ型

tests/integration/
├── AglaError.integration.spec.ts            # 内部パッケージ統合 (2テスト)
└── AglaError.external-systems.integration.spec.ts # 外部システム統合 (6テスト)
```

#### **テスト手法: atsushifx式 BDD**

全テストが厳格なBDD命名規則に従っています:

```typescript
describe('Given [文脈/状態]', () => {
  describe('When [アクション発生]', () => {
    it('Then should [期待される動作]', () => {
      // Arrange
      // Act
      // Assert (テストあたり単一の期待値)
    });
  });
});
```

## 現状分析結果

### テストケース詳細分類

#### **振る舞い別分類**

- **コンストラクタ系**: 基本パラメータ、オプション、レガシー互換性（15テスト）
- **プロパティ系**: readonly制約、アクセス、デフォルト値（6テスト）
- **JSON操作系**: シリアライゼーション、プロパティ包含/除外（5テスト）
- **チェーン系**: エラーチェーン、コンテキスト結合（8テスト）
- **継承系**: Error継承、name/stack、instanceof（6テスト）
- **バリデーション系**: ErrorSeverity検証（23テスト）
- **エッジケース系**: 特殊文字、循環参照、境界値（31テスト）

#### **目的別分類**

- **基本機能検証**: 54テスト (57%)
- **エラーハンドリング**: 23テスト (25%)
- **型安全性**: 8テスト (9%)
- **パフォーマンス**: 3テスト (3%)
- **互換性**: 6テスト (6%)

#### **テスト種類別分類**

- **正常系**: 42テスト (45%)
- **異常系**: 31テスト (33%)
- **エッジケース**: 21テスト (22%)

### なぜテスト再構成が必要か

#### **現在の課題**

1. **構造の不整合**: 2-4階層のdescribe階層が混在
2. **分類の不明確**: 正常系/異常系/エッジケースが分散
3. **重複コード**: 25%のコード重複率
4. **BDD準拠度**: 70% (目標95%)

#### **目標構造**

```
Given [対象オブジェクト/状態]
├── When [正常な操作/条件]     # 正常系テスト群
│   └── Then [期待される正常結果]
├── When [異常な操作/条件]     # 異常系テスト群
│   └── Then [期待されるエラー処理]
└── When [境界値/特殊条件]     # エッジケーステスト群
    └── Then [期待されるエッジケース処理]
```

## 実装戦略・技術的決定事項

### コア戦略: 既存テストロジックの完全維持

#### **重要原則**

1. **テスト数方針**: 現状94テストを起点に、品質担保・仕様補完のためのテスト追加を許容（重複・冗長は不可）
2. **ロジック保持**: 既存のit/expect内容は変更しない
3. **構造リファクタリングのみ**: describe階層のみ再構成

#### **実装アプローチ**

```typescript
// ❌ 現在: 分散した構造
describe('Given AglaError constructor with valid inputs', () => {
  describe('When creating error with basic parameters only', () => {
    it('Then should set errorType property correctly', () => { ... });
    it('Then should set message property correctly', () => { ... });
  });
  // 他の When節が別の場所に分散...
});

// ✅ 目標: 統合された構造  
describe('Given AglaError constructor', () => {
  describe('When 正常な操作', () => {
    it('Then should set errorType correctly', () => { ... });
    it('Then should set message correctly', () => { ... });
    it('Then should set all options correctly', () => { ... });
  });
  describe('When 異常な操作', () => {
    it('Then handles invalid parameters as per implementer policy', () => { /* 実装クラス/ファクトリ側でガード or フォールバックを選択 */ });
    it('Then handles null options as per implementer policy', () => { /* 本抽象層では挙動変更しない */ });
  });
  describe('When エッジケース', () => {
    it('Then should handle empty strings', () => { ... });
    it('Then should handle special characters', () => { ... });
  });
});
```

### ファイル構造計画

```
src/__tests__/
├── AglaError.spec.ts                    # 🔄 再構成: コンストラクタ+プロパティ+JSON
├── AglaError.chaining.spec.ts           # 🔄 再構成: チェーン機能
├── AglaError.inheritance.spec.ts        # 🔄 再構成: 継承+TypeScript
├── ErrorSeverity.spec.ts                # 🔄 再構成: 列挙型+バリデーション
├── functional/
│   ├── AglaError.functional.spec.ts     # 🔄 再構成: ワークフロー統合
│   └── ErrorSeverity.functional.spec.ts # 🔄 再構成: 列挙型統合
└── helpers/ (変更なし)

tests/integration/
├── AglaError.integration.spec.ts            # 🔄 再構成: 内部統合
└── AglaError.external-systems.integration.spec.ts # 🔄 再構成: 外部統合
```

## 実装ガイドライン

### **必須技術要件**

#### **新テスト構造パターン**

```typescript
// 新しい標準的な再構成パターン（改良版）
describe('Given [対象]', () => {
  // 共通操作による統一的なテスト構造
  describe('When [共通テストロジック/操作]', () => {
    // 正常系: 期待される標準的な使用ケース
    it('Then 正常系：[有効パラメータで正常結果]', () => {
      // 既存テストコードをそのまま移動
    });

    // 異常系: エラー処理、不正な入力
    it('Then 異常系：[無効パラメータでエラー処理]', () => {
      // 既存テストコードをそのまま移動
    });

    // エッジケース: 境界値、特殊条件
    it('Then エッジケース：[境界値で適切な処理]', () => {
      // 既存テストコードをそのまま移動
    });
  });
});
```

#### **構造変更の要点**

**旧構造（非効率）:**

```typescript
describe('Given [対象]', () => {
  describe('When [正常な操作]', () => {/* 正常系専用 */});
  describe('When [異常な操作]', () => {/* 異常系専用 */});
  describe('When [境界値操作]', () => {/* エッジケース専用 */});
});
```

**新構造（効率的）:**

```typescript
describe('Given [対象]', () => {
  describe('When [共通操作]', () => {
    it('Then 正常系：[結果]', () => {/* パラメータ違い */});
    it('Then 異常系：[結果]', () => {/* パラメータ違い */});
    it('Then エッジケース：[結果]', () => {/* パラメータ違い */});
  });
});
```

#### **テストカテゴリ分類基準**

- **正常系**: 期待される標準的な使用パターン、成功ケース（有効パラメータによる結果）
- **異常系**: 不正な入力、例外ハンドリング、エラー状態（無効パラメータによる結果）
- **エッジケース**: 境界値、特殊文字、複雑なオブジェクト、パフォーマンス（境界値パラメータによる結果）

### ランタイムガード/フォールバック方針（重要）

- 本パッケージ（`AglaError` 抽象クラス）では、ランタイムガード（不正入力での即時throw）やフォールバック（Unknownエラーへの丸め込み）は実装しない。
- これらは利用側の責務（実装クラス/ファクトリ層）とし、必要に応じて以下を採用する:
  - ランタイムガード: 不正入力検出時に例外を投げて失敗を顕在化。
  - フォールバック: 不正入力時に `UNKNOWN_ERROR` 等へ丸め、`context` に元入力/理由を保持。
- 本パッケージのテスト範囲は抽象層のAPI保証に限定。ガード/フォールバックは機能/統合テスト、または実装パッケージ側で検証する。

### **品質保証要件**

#### **必須品質チェック**

実装後、これらが全てパスすること:

```bash
pnpm run lint              # ESLint (通常)
pnpm run lint:types        # ESLint (型対応)
pnpm run check:types       # 厳格なTypeScriptコンパイル
pnpm run test:develop      # ユニットテスト
pnpm run test:functional   # ファンクショナルテスト  
pnpm run test:ci           # インテグレーションテスト
pnpm run test:all          # 全テストスイート
```

#### **軽量化・最適化目標**

- **テスト数**: 価値の低い冗長テストを削減して最適化（目安50–65）が目標。ただし仕様補完・回帰防止のための追加は許容（最終件数は増減可、品質優先）。
- **実行時間**: 約30%短縮目標
- **保守コスト**: 約35%削減目標
- **コードカバレッジ**: 90%以上維持
- **テスト品質**: 大幅向上（価値あるテストのみ保持）

#### **削除対象テスト**

- **自明な定数値テスト（4テスト）**: ErrorSeverity enum定数確認
- **instanceof チェックテスト（6-8テスト）**: 継承関係確認
- **デフォルト値テスト（9テスト）**: undefined/null デフォルト値確認
- **重複バリデーションテスト（10-15テスト）**: パラメータ化テストに統合

### **新テスト構成・実装要件**

#### **フェーズ別テスト分類**

- **フェーズ2A: ユニットテスト（35-40テスト）**: 単一機能・クラス・メソッド
- **フェーズ2B: ファンクショナルテスト（8-10テスト）**: 機能統合・ワークフロー
- **フェーズ2C: インテグレーションテスト（6-8テスト）**: システム統合
- **フェーズ2D: E2Eテスト（5-7テスト）**: エンドユーザー視点・新設

#### **Red-Green-Refactorサイクル**

- **🔴 RED**: テスト失敗確認（実装前）
- **🟢 GREEN**: 最小実装でテスト通過
- **🔄 REFACTOR**: コード改善・リファクタリング

#### **BDD準拠要件**

- Markdownチェックボックス形式（`- [ ]` `- [x]`）
- 全テスト記述でGiven/When/Then形式使用
- 自然言語記述（技術実装詳細なし）
- 明確なArrange/Act/Assert構造

## 実装上の注意点・回避すべき落とし穴

### **落とし穴1: テストロジックの変更**

```typescript
// ❌ 問題: 既存テストロジックを変更
expect(error.errorType).toBe('MODIFIED_TYPE'); // 元は 'TEST_ERROR'

// ✅ 解決策: ロジックは完全に保持
expect(error.errorType).toBe('TEST_ERROR'); // 既存のまま
```

### **落とし穴2: 過度な統合**

```typescript
// ❌ 問題: 関連のないテストを無理に統合
describe('Given AglaError for everything', () => {
  // コンストラクタ、JSON、チェーン、継承が混在...
});

// ✅ 解決策: 論理的にグループ化
describe('Given AglaError constructor', () => {
  // コンストラクタ関連のみ
});
describe('Given AglaError for JSON operations', () => {
  // JSON関連のみ
});
```

### **落とし穴3: describe階層の不整合**

```typescript
// ❌ 問題: 階層レベルの不統一
describe('Given A', () => {
  describe('When B', () => {
    describe('And C', () => { // 4階層になってしまう
      it('Then D', () => { ... });
    });
  });
});

// ✅ 解決策: 厳格に3階層
describe('Given A', () => {        // レベル1
  describe('When B', () => {       // レベル2
    it('Then C and D', () => {     // レベル3 - itで結合
      // CとDの両方をテスト
    });
  });
});
```

## 成功基準・検証方法

### **フェーズ1成功基準** (設計・計画)

- [x] 全94テストの詳細分析完了
- [x] 振る舞い別・目的別・種類別分類完了
- [x] Given/When/Then構造設計完了
- [x] TODO.md実行計画書作成完了

### **フェーズ2成功基準** (実装)

- [ ] 全テストファイル再構成完了
- [ ] 3階層describe構造統一
- [ ] 正常系/異常系/エッジケース分類実装
- [ ] 既存94テストを含む全テスト動作確認（追加分を含めて緑）

### **フェーズ3成功基準** (品質保証)

- [ ] 全品質チェックパス
- [ ] パフォーマンス目標達成
- [ ] BDD準拠度95%以上達成
- [ ] コード重複率10%未満達成

### **全体成功検証**

```bash
# これらのコマンドが全てパスすること
pnpm run test:all         # 回帰なし
pnpm run lint             # コード品質（通常）
pnpm run lint:types       # コード品質（型対応）
pnpm run check:types      # 型安全性
```

## 今後の実装手順

### **フェーズ2: テスト再構成実装** (優先度: HIGH)

#### **実装順序** (TODO.mdのタスクIDに従って)

1. **P2-001 シリーズ**: AglaErrorコンストラクタテスト再構成
2. **P2-002 シリーズ**: AglaErrorオプション機能テスト再構成
3. **P2-003 シリーズ**: AglaErrorプロパティアクセステスト再構成
4. **P2-004 シリーズ**: AglaErrorシリアライゼーションテスト再構成
5. **P2-005 シリーズ**: AglaErrorチェーン機能テスト再構成
6. **P2-006 シリーズ**: AglaError継承機能テスト再構成
7. **P2-007 シリーズ**: ErrorSeverityバリデーションテスト再構成
8. **P2-008 シリーズ**: ファンクショナルテスト統合
9. **P2-009 シリーズ**: インテグレーションテスト統合

#### **各ファイル実装パターン**

```typescript
// ステップ1: 既存のdescribe/itを全て特定
// ステップ2: 振る舞い別にグループ化
// ステップ3: 正常系/異常系/エッジケースに分類
// ステップ4: 新しいdescribe構造に再配置
// ステップ5: テスト実行・検証
```

### **フェーズ3: 品質保証・検証** (優先度: MEDIUM)

- 全テストケース実行確認
- カバレッジ測定・維持
- パフォーマンステスト
- ドキュメント更新

### **作業見積もり**

- **フェーズ2**: 8-12時間
- **フェーズ3**: 3-4時間
- **総作業時間**: 11-16時間

## リファレンス・参考資料

### **必須参照ファイル**

1. **詳細実行計画**: `TODO.md` - 完全なタスクリストと仕様
2. **AglaError実装**: `types/AglaError.types.ts:59-152`
3. **ErrorSeverity実装**: `types/ErrorSeverity.types.ts:13-22`
4. **既存テスト例**: `src/__tests__/AglaError.spec.ts`
5. **テストヘルパー**: `src/__tests__/helpers/TestAglaError.class.ts`

### **設定参照**

- **ベースVitestConfig**: `configs/vitest.config.unit.ts`
- **パッケージスクリプト**: `package.json`
- **TypeScript設定**: `tsconfig.json`

### **アーキテクチャ参照**

- 既存のBDDパターンとモノレポ規約に従う
- atsushifx式BDD手法の厳格な適用
- 型安全性とパフォーマンスの両立

## 問い合わせ・質問

実装時の疑問点について:

1. **詳細仕様**: `TODO.md` で粒度の細かい実装ステップを確認
2. **既存パターン**: `src/__tests__/`ディレクトリの既存テストパターンを参照
3. **品質基準**: 既存のBDD規約とモノレポ規約に従う
4. **技術的詳細**: TypeScript厳格モード下での実装

**実装準備完了。全ての基盤研究・計画が完成済み。**

---

## 関連ドキュメント

### 📋 プロジェクト文書

- **[README.md](README.md)**: パッケージ概要・使用方法・開発ガイド
- **[TODO.md](TODO.md)**: マスター実行計画書（軽量化対応済み）
- **[TODO.optimized.md](TODO.optimized.md)**: 詳細実装チェックリスト（Red-Green-Refactor組み込み）

### 🎯 計画書

- **[docs/refactor.plan.md](docs/refactor.plan.md)**: テスト構造リファクタリング詳細計画
- **[docs/test-optimization.plan.md](docs/test-optimization.plan.md)**: テスト軽量化・最適化戦略
- **[docs/index.md](docs/index.md)**: ドキュメント構成・概要

### ⚙️ 設定・ガイド

- **[AGENTS.md](AGENTS.md)**: リポジトリガイドライン（テスト最適化情報含む）

## 連絡先・サポート

- **タスク詳細**: [TODO.md](TODO.md)内のタスクID参照
- **コード例**: `src/__tests__/`内の既存テストパターン
- **品質基準**: プロジェクトのBDD規約とTypeScript厳格ルール

---

**作成日**: 2025-08-31\
**最終更新**: 2025-08-31\
**ステータス**: 軽量化計画完成・実装準備完了・全ドキュメント整備完了

**Ready for optimized implementation. All planning, optimization strategy, and documentation complete.**
