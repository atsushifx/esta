---
header:
  - src: packages/@agla-e2e/fileio-framework/docs/developers-guide/09-faq.ja.md
  - @(#): AgE2eFileIOFramework よくある質問（FAQ）
title: よくある質問（FAQ）
description: AgE2eFileIOFrameworkに関するよくある質問とその回答をまとめています。
version: 1.0.0
created: 2025-09-05
authors:
  - atsushifx
changes:
  - 2025-09-05: 初版作成（パッケージドキュメント標準化）
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## よくある質問（FAQ）

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->

### Q1: テストが途中でタイムアウトしてしまいます。どうすればよいですか？

A1:
テストのタイムアウトは処理が想定以上に長くかかっている可能性があります。

- 大きなファイルを扱う場合は処理時間を見直してください。
- `vitest` のタイムアウト設定の調整も可能。
- また、非同期処理が正しく `await` されているかを確認してください。

## Q2: ファイルやディレクトリがテスト終了後に残ってしまいます。どうすればよいですか？

A2:

- フレームワークの `removeDirectory` や `removeFile` メソッドを使って、テスト後にクリーンアップ処理を入れることを推奨する。
- テストが失敗した場合でも必ずクリーンアップ処理が実行されるよう、`afterEach` や `finally` ブロックを活用しましょう。

## Q3: `AgE2eFileIOFramework` のメソッドが見つかりません。どう確認すればよいですか？

A3:

- パスやインポート文を正しく指定しているか確認してください。
- フレームワークのバージョンやリリースノートをチェックし、API 変更に注意してください。
- 直接ユーティリティ関数を使うケースもあるため、ドキュメントの API ガイドを参照するとよいでしょう。

## Q4: 複数テストの並列実行でファイル競合が発生します。どう対処すればよいですか？

A4:

- テストごとにユニークな一時ディレクトリを作成し、そのなかでファイル操作をするを推奨する。
- `createTempDirectory` メソッドを活用して、テストの独立性を確保しましょう。

---

## Q5: 何か問題があったらどこに問い合わせればよいですか？

A5:

- プロジェクトの GitHub Issue や Discussions を利用してください。
- ドキュメントの改善提案や質問も歓迎している。

---

<!-- textlint-enable -->

*このドキュメントはAIエージェント「小紅（kobeni）」によって自動生成されました。*
