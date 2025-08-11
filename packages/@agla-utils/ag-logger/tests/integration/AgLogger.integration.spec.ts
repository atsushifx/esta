// tests/integration/AgLogger.integration.spec.ts
// @(#) : AgLogger Integration Tests - Main integration test suite
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * AgLogger Integration Test Suite
 *
 * @description このファイルは統合テストのエントリポイントです。
 * 実際のテストは以下のファイルに分類されています：
 *
 * - aglogger/basic.integration.spec.ts - 基本的な統合動作（シングルトン、プラグイン基本統合）
 * - aglogger/configuration.integration.spec.ts - 複雑な設定組み合わせと動的設定変更
 * - aglogger/filtering.integration.spec.ts - ログレベルフィルタリングとverbose機能
 * - aglogger/dataProcessing.integration.spec.ts - 特殊データ処理（循環参照など）
 * - aglogger/edgecases.integration.spec.ts - エッジケースと複雑な外部依存シナリオ
 * - aglogger/performance.integration.spec.ts - パフォーマンステスト
 *
 * 各ファイルは独立してテストでき、明確な責務分離により保守性を向上させています。
 */

// 統合サブスイート: 各領域の統合テストを読み込み
import './aglogger/basic.integration.spec';
import './aglogger/configuration.integration.spec';
import './aglogger/filtering.integration.spec';
import './aglogger/dataProcessing.integration.spec';
import './aglogger/edgecases.integration.spec';

/**
 * Performance Integration Tests
 *
 * Note: Performance tests are separated due to their resource-intensive nature.
 * They can be run independently when needed for performance benchmarking.
 */
// パフォーマンス: 高負荷テスト（必要時のみ有効化）
// import './aglogger/performance.integration.spec';

export {};
