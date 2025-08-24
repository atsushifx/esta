# MockFormatter リファクタリング計画（AgMockFormatter統合）

## 概要 / 背景

- 目的: MockFormatterを単純化し、AgMockFormatterベースクラスと統計機能をAgLoggerConfigに統合する
- ねらい: コード重複削除、統計機能の一元化、自動インスタンス化による利便性向上
- タイミング: 現在のE2Eテスト改修が完了後に実装

---

## 要件

- 既存互換: `MockFormatter.json`等のエクスポートは維持（破壊的変更なし）
- 統計機能: `callCount`, `lastMessage`をAgMockFormatterで管理
- 自動インスタンス化: AgLoggerConfigでAgMockConstructor検出時に自動でインスタンス生成
- 型安全性: AgMockConstructor型による明確な区別

---

## 設計方針

### 1. AgMockConstructor型の定義

```typescript
// FormatRoutine関数の型定義
export type AgFormatRoutine = (msg: AgLogMessage) => AgFormattedLogMessage | never;

export interface AgMockConstructor {
  new(routine?: AgFormatRoutine, ...args: any[]): { execute: AgFormatFunction; getStats(): any; reset(): void };
  readonly __isMockConstructor: true;
}

export type AgFormatterInput = AgFormatFunction | AgMockConstructor;
```

### 2. AgMockFormatterベースクラス

```typescript
export class AgMockFormatter implements AgMockConstructor {
  static readonly __isMockConstructor = true;
  private callCount = 0;
  private lastMessage: AgLogMessage | null = null;

  constructor(private formatRoutine: AgFormatRoutine) {}

  public readonly execute: AgFormatFunction = (msg: AgLogMessage) => {
    this.callCount++;
    this.lastMessage = msg;
    return this.formatRoutine(msg);
  };

  getStats() {
    return { callCount: this.callCount, lastMessage: this.lastMessage };
  }
  reset(): void {
    this.callCount = 0;
    this.lastMessage = null;
  }
}
```

### 3. AgLoggerConfig統合

- AgLoggerConfig.setLoggerConfigでAgMockConstructor検出
- 検出時に自動インスタンス化: `new formatter()`
- プライベートプロパティ`_formatterInstance`に保存
- `_options.formatter`には`instance.execute`を設定

### 4. 新しいMockFormatter定義

```typescript
// FormatRoutine関数群（型安全）
const messageOnlyRoutine: AgFormatRoutine = (msg: AgLogMessage): string => msg.message;
const jsonRoutine: AgFormatRoutine = (msg: AgLogMessage): string =>
  JSON.stringify({
    timestamp: msg.timestamp.toISOString(),
    logLevel: msg.logLevel,
    message: msg.message,
    ...(msg.args.length > 0 && { args: msg.args }),
  });
const passthroughRoutine: AgFormatRoutine = (msg: AgLogMessage): AgLogMessage => msg;

/**
 * ErrorThrowFormatter: AgMockFormatterを拡張した特別クラス
 * setErrorMessage による動的エラーメッセージ変更をサポート
 */
class ErrorThrowFormatter extends AgMockFormatter {
  static readonly __isMockConstructor = true;
  private currentErrorMessage: string;

  constructor(defaultErrorMessage?: string) {
    const errorRoutine: AgFormatRoutine = (msg: AgLogMessage): never => {
      throw new Error(this.currentErrorMessage);
    };
    super(errorRoutine);
    this.currentErrorMessage = defaultErrorMessage || 'Default mock error';
  }

  setErrorMessage(errorMessage: string): void {
    this.currentErrorMessage = errorMessage;
  }

  getErrorMessage(): string {
    return this.currentErrorMessage;
  }
}

// MockFormatter: シンプル定義
export const MockFormatter = {
  messageOnly: AgMockFormatter, // ベースクラスそのまま（routine: AgFormatRoutine）
  json: AgMockFormatter, // ベースクラスそのまま（routine: AgFormatRoutine）
  passthrough: AgMockFormatter, // ベースクラスそのまま（routine: AgFormatRoutine）
  errorThrow: ErrorThrowFormatter, // 拡張クラス（setErrorMessage対応）
} as const;
```

---

## 変更対象

### 新規作成

- `src/shared/types/AgMockConstructor.interface.ts` - AgMockConstructor型定義
- `src/plugins/formatter/AgMockFormatter.class.ts` - ベースクラス

### 修正対象

- `src/internal/AgLoggerConfig.class.ts` - setLoggerConfigメソッド拡張
- `src/utils/AgLogValidators.ts` - isValidFormatter関数更新（必要に応じて）
- `src/plugins/formatter/MockFormatter.ts` - 全面リファクタリング

### テスト更新

- `src/plugins/formatter/__tests__/MockFormatter.spec.ts` - 新しいAPI対応
- `src/internal/__tests__/AgLoggerConfig.spec.ts` - AgMockConstructor対応テスト追加

---

## 実装手順

### Phase 1: 基盤整備

1. AgMockConstructor型定義作成
2. AgMockFormatterベースクラス実装
3. 型ガード関数（isAgMockConstructor）追加

### Phase 2: AgLoggerConfig統合

1. setLoggerConfigメソッド拡張
   - AgMockConstructor検出ロジック追加
   - _formatterInstanceプライベートプロパティ追加
   - 自動インスタンス化実装
2. 統合テスト追加

### Phase 3: MockFormatter置き換え

1. formatRoutine関数群定義
2. 新しいMockFormatter実装
3. 既存テストの動作確認・更新

### Phase 4: 最終確認

1. 既存APIの互換性確認
2. 統計機能の動作確認
3. E2Eテストでの統合確認

---

## 使用例

### 新しい使用パターン

```typescript
// 自動インスタンス化（通常のフォーマッター）
const logger1 = createLogger({
  formatter: MockFormatter.messageOnly, // AgMockConstructor → 自動でインスタンス化
});

// 自動インスタンス化（errorThrow）
const logger2 = createLogger({
  formatter: MockFormatter.errorThrow, // ErrorThrowFormatter → 自動でインスタンス化
});

// 統計取得（AgLoggerConfig経由）
const stats = config._formatterInstance?.getStats();

// errorThrowでの動的エラーメッセージ変更
if (config._formatterInstance instanceof ErrorThrowFormatter) {
  config._formatterInstance.setErrorMessage('Custom error message');
}

// 従来通りの手動使用も可能
const instance = new MockFormatter.messageOnly();
const result = instance.execute(message);

// カスタムroutine指定
const customRoutine: AgFormatRoutine = (msg) => `CUSTOM: ${msg.message}`;
const customInstance = new MockFormatter.messageOnly(customRoutine);
const customResult = customInstance.execute(message);
```

### 互換性維持

```typescript
// 既存コードはそのまま動作
const formatter = MockFormatter.json;
const logger = createLogger({ formatter });
```

### errorThrow特別機能

```typescript
// エラーメッセージ動的変更
const errorLogger = createLogger({ formatter: MockFormatter.errorThrow });

// AgLoggerConfig経由でエラーメッセージ変更
if (config._formatterInstance instanceof ErrorThrowFormatter) {
  config._formatterInstance.setErrorMessage('Test scenario error');
}

// 実行時に新しいエラーメッセージでエラー投げ
errorLogger.error('This will throw with custom message');
```

---

## 互換性と影響

- 破壊的変更なし: 既存のMockFormatter使用パターンは維持
- 型安全性向上: AgMockConstructor型による明確な区別
- 統計機能強化: AgLoggerConfig統合による一元管理
- コード簡素化: 重複する統計機能コードの削除

---

## テスト戦略（atsushifx式BDD）

### Feature: AgMockFormatter統計機能

- it: `messageOnlyRoutine`で`callCount`と`lastMessage`が更新される
- it: `reset()`で統計がクリアされる

### Feature: AgLoggerConfig自動インスタンス化

- it: `setLoggerConfig`でAgMockConstructorを検出してインスタンス化する
- it: 生成されたインスタンスの`execute`が`_options.formatter`に設定される

### Feature: MockFormatter互換性

- it: 既存の`MockFormatter.messageOnly`使用パターンが動作する
- it: 統計取得が正常に機能する

### Feature: ErrorThrowFormatter特別機能

- it: `setErrorMessage`でエラーメッセージが動的に変更される
- it: `getErrorMessage`で現在のエラーメッセージが取得できる
- it: デフォルトエラーメッセージが正しく設定される

### Feature: 型安全性

- it: `AgMockConstructor`型が正しく認識される
- it: `isAgMockConstructor`型ガードが正常に動作する
- it: `ErrorThrowFormatter`の`instanceof`チェックが正常に動作する

---

## リスクと緩和

- 破壊的変更リスク: 段階的移行により既存コードの動作を保証
- 複雑性増加: ベースクラス統合により実装を単純化
- テスト工数: 既存テストの大部分は変更なしで動作

---

## 成功基準

- 既存テストグリーン維持
- 新機能（自動インスタンス化、統計機能）の正常動作
- MockFormatterコードの簡素化達成
- AgLoggerConfig統合による統計機能の一元化完了

---

## スケジュール

- Week 1: Phase 1-2 (基盤整備 + AgLoggerConfig統合)
- Week 2: Phase 3 (MockFormatter置き換え)
- Week 3: Phase 4 (最終確認 + ドキュメント更新)

---

実装完了時には、MockFormatterが大幅に簡素化され、統計機能がAgLoggerConfigに一元化された状態となる。
