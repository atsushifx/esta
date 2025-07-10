# @esta-system/exit-status 仕様書

## 概要

@esta-system/exit-status は、アプリケーション全体で一貫した終了ステータス管理を提供するシングルトンクラスです。
一度非ゼロ値が設定されると、ゼロ値での上書きを防ぐフェイルファスト動作を実現します。

## パッケージ情報

- **パッケージ名**: `@esta-system/exit-status`
- **バージョン**: 0.0.0
- **タイプ**: ES Module (dual package)
- **依存関係**: `@esta-core/error-handler`

## API 仕様

### ExitStatus クラス

#### 概要

static classを使用した終了ステータス管理クラス。

#### メソッド

##### `static set(status: number): void`

**目的**: 終了ステータスを設定する

**パラメータ**:

- `status` (number): 設定する終了ステータスコード

**動作仕様**:

- 正の非ゼロ値のみ受け付ける
- ゼロ値および負の値は無視される
- 一度非ゼロ値が設定されると、その後のゼロ値は無視される
- 複数の非ゼロ値が設定された場合、最後の値が保持される

**例**:

```typescript
ExitStatus.set(1); // ステータスを1に設定
ExitStatus.set(0); // 無視 - ステータスは1のまま
ExitStatus.set(-1); // 無視 - ステータスは1のまま
ExitStatus.set(2); // ステータスを2に設定
```

##### `static get(): number`

**目的**: 現在の終了ステータスを取得する

**戻り値**:

- `number`: 現在の終了ステータスコード（0=成功、非ゼロ=エラー）

**例**:

```typescript
const status = ExitStatus.get();
if (status !== 0) {
  console.error(`Process failed with exit code ${status}`);
}
```

##### `static reset(): void`

**目的**: 終了ステータスをゼロ（成功）にリセットする

**動作仕様**:

- 明示的に終了ステータスを0に設定する
- 以前に設定された非ゼロ値をクリアする唯一の方法
- 連続して呼び出しても問題ない

**例**:

```typescript
ExitStatus.set(1); // エラーステータスを設定
ExitStatus.reset(); // 成功ステータスにクリア
console.log(ExitStatus.get()); // 出力: 0
```

## 使用例

### 基本的な使用例

```typescript
import { ExitStatus } from '@esta-system/exit-status';

// エラー時の終了ステータス設定
try {
  // 何らかの処理
  throw new Error('処理エラー');
} catch (error) {
  ExitStatus.set(1);
  console.error('エラーが発生しました:', error.message);
}

// 最終的な終了ステータス確認
const finalStatus = ExitStatus.get();
process.exit(finalStatus);
```

### 複数の処理での使用例

```typescript
import { ExitStatus } from '@esta-system/exit-status';

function processFile(filename: string): void {
  try {
    // ファイル処理
  } catch (error) {
    ExitStatus.set(1); // ファイル処理エラー
  }
}

function validateConfig(): void {
  try {
    // 設定検証
  } catch (error) {
    ExitStatus.set(2); // 設定エラー
  }
}

// 複数の処理を実行
processFile('data.json');
validateConfig();

// 最終的な終了ステータス（最後に設定された値）
const status = ExitStatus.get();
console.log(`Process completed with status: ${status}`);
```

## 設計原則

### シングルトンパターン

- アプリケーション全体で単一の終了ステータスを管理
- 複数のモジュール間で一貫した状態を保持

### フェイルファスト動作

- 一度エラーステータスが設定されると、成功ステータスで上書きされない
- 最初のエラーを確実に保持し、後続の成功処理による隠蔽を防ぐ

### 入力検証

- 正の値のみ受け付け
- 負の値や不正な値は無視

## テストカバレッジ

### 基本機能テスト

- [x] 非ゼロ値の設定
- [x] 設定された値の取得
- [x] リセット機能
- [x] ゼロ値設定の動作

### 仕様固有動作テスト

- [x] 非ゼロ値設定後のゼロ値無視
- [x] 複数非ゼロ値の最後の値保持
- [x] 負の値の無視
- [x] ExitCode.SUCCESS定数との連携

### エッジケーステスト

- [x] 連続リセット呼び出し
- [x] 大きな終了コード値の処理

## 互換性

### Node.js

- 最小バージョン: 20.0.0
- ES Module サポート

### パッケージマネージャー

- 最小バージョン: pnpm >= 10

## 関連パッケージ

### @esta-core/error-handler

- ExitCode 定数の提供
- エラーハンドリングパターンとの統合

## 制限事項

- 負の終了コードは設定できない
- 一度設定された非ゼロ値は reset() 以外では変更できない
- シングルトンパターンのため、テスト時は beforeEach でリセットが必要

## 今後の拡張予定

- 終了ステータスの理由情報保持
- 複数エラーの蓄積機能
- ログ統合機能
