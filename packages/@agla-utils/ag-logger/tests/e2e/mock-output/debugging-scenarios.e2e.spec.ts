// tests/e2e/mock-output/debugging-scenarios.e2e.spec.ts
// @(#) : Production debugging workflow simulation and verification
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Testing framework - テスト実行環境
import { describe, expect, it } from 'vitest';

// Core logger functionality - ログ機能コア
import { AgLogger } from '@/AgLogger.class';

// Output formatters - 出力フォーマッター（個別import）
import { JsonFormatter } from '@/plugins/formatter/JsonFormatter';
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// Logger implementations - ログ出力実装
import { E2eMockLogger } from '@/plugins/logger/E2eMockLogger';

// Test utilities - テストユーティリティ
import { setupE2eMockLogger } from './__helpers__/e2e-mock-setup.helper';

// Shared types and constants - 共有型・定数
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogMessage } from '../../../shared/types';

/**
 * Test Scenarios:
 * - User Registration Flow: Complete workflow debugging with data validation
 * - Error Propagation: Multi-layer error tracing and root cause analysis
 * - Performance Investigation: Bottleneck identification and optimization
 * - API Integration Failures: Environmental context and pattern analysis
 */

// Phase 8.1.1b: Green - 必要なインポートの整備と存在確認

/**
 * @suite Debugging | Basic Import Structure
 * @description コア/フォーマッタ/モック実装のインポート健全性の検証。
 * @testType integration
 * @coverage AgLogger, E2eMockLogger, Plain/Json/MockFormatter, AgLogMessage 形状
 * Scenarios:
 * - AgLogger/E2eMockLogger/各Formatterがインポート可能である
 * - MockFormatter.passthrough の返却形が AgLogMessage である
 * - 主要API(createLogger, getLogger など)の型/存在を確認
 * Expects:
 * - 主要APIが未定義でなく関数として利用可能
 * - AgLogMessage(timestamp, logLevel, message, args)の構造を保持
 */
describe('Debugging Scenarios - Basic Import Structure (Green)', () => {
  // AgLogger、フォーマッター、モックの基本インポート構造を検証する
  it('should have required modules properly imported', () => {
    expect(typeof AgLogger.createLogger).toBe('function');
    expect(typeof E2eMockLogger).toBe('function');

    // フォーマッタの存在検証
    expect(PlainFormatter).toBeDefined();
    expect(JsonFormatter).toBeDefined();
    expect(MockFormatter).toBeDefined();
    expect(MockFormatter.passthrough).toBeDefined();
  });

  // MockFormatter.passthroughがAgLogMessage構造を適切に通すことを検証する
  it('should pass through AgLogMessage shape with MockFormatter.passthrough', (ctx) => {
    const mockLogger = setupE2eMockLogger('io-shape', ctx);

    const logger = AgLogger.createLogger({
      defaultLogger: mockLogger.getLoggerFunction(AG_LOGLEVEL.INFO),
      formatter: MockFormatter.passthrough,
    });
    logger.logLevel = AG_LOGLEVEL.DEBUG;

    const ts = '2024-12-01T10:30:00Z';
    const expectedIso = new Date(ts).toISOString();
    const obj = { userId: 1 };
    const arr = [1, 2];

    logger.info(ts, 'User', 'logged', 'in', 42, true, obj, arr);

    const msgs = mockLogger.getMessages(AG_LOGLEVEL.INFO);
    expect(msgs).toHaveLength(1);

    const entry = msgs[0];
    // 型・構造検証 - AgLogMessage オブジェクトであることを確認
    expect(typeof entry).toBe('object');
    expect(entry).not.toBeNull();
    expect(entry).not.toBe('string');

    // TypeScript type assertion: MockFormatter.passthrough returns AgLogMessage
    const logMessage = entry as AgLogMessage;
    expect(logMessage.logLevel).toBe(AG_LOGLEVEL.INFO);
    expect(logMessage.timestamp instanceof Date).toBe(true);
    expect(logMessage.timestamp.toISOString()).toBe(expectedIso);
    expect(logMessage.message).toBe('User logged in 42 true');
    expect(logMessage.args).toEqual([obj, arr]);
  });
});

// Phase 8.1.2: User Registration Flow with Advanced Log Search

/**
 * @suite Debugging | User Registration Flow
 * @description 登録開始〜入力検証〜完了までを詳細ログで追跡。
 * @testType e2e
 * @coverage 入力検証ログ、PlainFormatter 組み込み、既定ログレベル運用
 * Scenarios:
 * - AgLogger を PlainFormatter + MockLogger で初期化
 * - "User registration started" を識別子/メタデータ込みで出力
 * - 入力検証(email/password/age)の手順を DEBUG/INFO で記録
 * Expects:
 * - sessionId/userId 等の重要メタがログに一貫して含まれる
 * - ステップの時系列がログのみで再構築可能
 */
describe('Debugging Scenarios - User Registration Flow', () => {
  // E2eMockLoggerの初期化とテスト環境の活性化を検証する
  it('8.1.2a Green: E2eMockLogger initialization activates after startTest', (ctx) => {
    const mockLogger = setupE2eMockLogger('auth-debug', ctx);

    expect(mockLogger.getCurrentTestId()).not.toBeNull();
  });

  // PlainFormatterを使用したAgLoggerの初期化が正常に行われることを検証する
  it('8.1.2b Green: AgLogger initialization should succeed with PlainFormatter', (ctx) => {
    const mockLogger = setupE2eMockLogger('auth-debug', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();
    expect(typeof logger.info).toBe('function');
    expect(() => AgLogger.getLogger()).not.toThrow();
  });

  // ユーザー登録開始時の包括的なデータ検証とメタデータ付きログ記録をテストする
  it('8.1.2c Refactor: Enhanced user registration start with comprehensive data validation', (ctx) => {
    const mockLogger = setupE2eMockLogger('auth-debug', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Enhanced user data structure with validation metadata
    const userData = {
      userId: 'user123',
      email: 'test@example.com',
      timestamp: new Date().toISOString(),
      source: 'web-registration',
      sessionId: 'sess_abc123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 E2E-Test',
    };

    logger.info('User registration started', userData);

    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
    expect(infoMessages.length).toBeGreaterThanOrEqual(1);

    const joined = String(infoMessages[0]);
    expect(joined.includes('User registration started')).toBe(true);
    expect(joined.includes('user123')).toBe(true);
    expect(joined.includes('test@example.com')).toBe(true);
    // Refactor: Additional validation checks for comprehensive debugging
    expect(joined.includes('sess_abc123')).toBe(true);
    expect(joined.includes('web-registration')).toBe(true);
    expect(joined.includes('192.168.1.100')).toBe(true);
  });

  // 詳細なステップとメタデータを含む検証プロセスのログ記録を強化してテストする
  it('8.1.2d Refactor: Enhanced validation process logging with detailed steps and metadata', (ctx) => {
    const mockLogger = setupE2eMockLogger('auth-debug', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Enhanced validation steps with comprehensive metadata
    const validationContext = {
      sessionId: 'sess_abc123',
      userId: 'user123',
      timestamp: Date.now(),
    };

    logger.debug('User input validation started', validationContext);
    logger.debug('Validating email format', { ...validationContext, field: 'email', pattern: 'RFC5322' });
    logger.info('Email validation passed', { ...validationContext, field: 'email', duration: '5ms' });

    logger.debug('Validating password strength', {
      ...validationContext,
      field: 'password',
      criteria: ['length', 'complexity', 'common_patterns'],
    });
    logger.info('Password validation passed', {
      ...validationContext,
      field: 'password',
      strength: 'strong',
      duration: '12ms',
    });

    logger.debug('Validating age and consent', { ...validationContext, field: 'age', minAge: 18 });
    logger.info('Age and consent validation passed', { ...validationContext, field: 'age', duration: '2ms' });

    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG);
    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);

    // Enhanced validation checks
    expect(debugMessages.some((m) => String(m).includes('validation started'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('RFC5322'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('complexity'))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes('Email validation passed'))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes('Password validation passed'))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes('Age and consent validation passed'))).toBe(true);
    // Metadata verification
    expect(debugMessages.concat(infoMessages).some((m) => String(m).includes('sess_abc123'))).toBe(true);
  });

  // データベース操作のトランザクション詳細とタイミングを強化してテストする
  it('8.1.2e Refactor: Enhanced database operation with transaction details and timing', (ctx) => {
    const mockLogger = setupE2eMockLogger('auth-debug', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Enhanced database operation with comprehensive context
    const dbContext = {
      sessionId: 'sess_abc123',
      userId: 'user123',
      transactionId: 'txn_456',
      table: 'users',
      operation: 'INSERT',
    };

    const startTime = Date.now();
    logger.debug('Database save operation started', dbContext);
    logger.debug('Database connection acquired', { ...dbContext, connectionId: 'conn_789' });
    logger.debug('Transaction initiated', { ...dbContext, isolationLevel: 'READ_COMMITTED' });

    const dbId = 'db_789';
    const duration = Date.now() - startTime;
    logger.info(`User saved successfully`, {
      ...dbContext,
      userId: dbId,
      duration: `${duration}ms`,
      rowsAffected: 1,
    });
    logger.debug('Transaction committed', { ...dbContext, duration: `${duration + 2}ms` });

    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG);
    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);

    expect(debugMessages.some((m) => String(m).includes('Database save operation started'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('Transaction initiated'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('READ_COMMITTED'))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes(dbId))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes('rowsAffected'))).toBe(true);
  });

  // 包括的なメタデータと成功指標を持つ強化された登録完了処理をテストする
  it('8.1.2f Refactor: Enhanced registration completion with comprehensive metadata and success indicators', (ctx) => {
    const mockLogger = setupE2eMockLogger('auth-debug', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Enhanced completion metadata with success indicators
    const completionMetadata = {
      sessionId: 'sess_abc123',
      userId: 'db_789',
      email: 'test@example.com',
      registrationId: 'reg_xyz123',
      totalDuration: '1247ms',
      stepsCompleted: 5,
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      nextStep: 'email_verification',
    };

    logger.info('User registration completed successfully', completionMetadata);
    logger.debug('Registration cleanup initiated', {
      sessionId: 'sess_abc123',
      cleanupTasks: ['temp_files', 'session_data'],
    });
    logger.info('Welcome email queued', { userId: 'db_789', emailType: 'welcome', priority: 'normal' });

    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG);

    expect(infoMessages.some((m) => String(m).includes('User registration completed successfully'))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes('reg_xyz123'))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes('1247ms'))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes('email_verification'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('Registration cleanup'))).toBe(true);
  });

  // 複数の検索パターンと包括的フィルタリングを使用した高度なログ検索をテストする
  it('8.1.2g Refactor: Advanced log search with multiple search patterns and comprehensive filtering', (ctx) => {
    const mockLogger = setupE2eMockLogger('auth-debug', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Enhanced log output with varied patterns for advanced searching
    logger.info('User registration started', { userId: 'user123', email: 'test@example.com', phase: 'initiation' });
    logger.info('User validation completed', { userId: 'user123', validationType: 'email_format', result: 'passed' });
    logger.info('User account created', { userId: 'user123', accountId: 'acc_456', status: 'active' });
    logger.info('Database save operation successful', { userId: 'user123', dbId: 'db_789', operation: 'INSERT' });
    logger.info('User registration completed successfully', {
      userId: 'user123',
      duration: '1247ms',
      nextStep: 'verification',
    });
    logger.info('System notification sent', { type: 'welcome_email', recipient: 'test@example.com' });

    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);

    // Refactor: Multiple advanced search patterns (adjusted for PlainFormatter output)
    const userMessages = infoMessages.filter((msg) => String(msg).includes('User'));
    const registrationMessages = infoMessages.filter((msg) => String(msg).includes('registration'));
    const operationMessages = infoMessages.filter((msg) =>
      String(msg).includes('operation') || String(msg).includes('created') || String(msg).includes('completed')
    );

    // String containment searches for various categories
    const emailRelatedMessages = infoMessages.filter((msg) => String(msg).includes('email'));
    const databaseMessages = infoMessages.filter((msg) =>
      String(msg).includes('Database') || String(msg).includes('save')
    );
    const successMessages = infoMessages.filter((msg) =>
      String(msg).includes('successful') || String(msg).includes('completed')
    );

    // Comprehensive validation (adjusted expectations for realistic message counts)
    expect(userMessages.length).toBeGreaterThanOrEqual(3);
    expect(registrationMessages.length).toBeGreaterThanOrEqual(2);
    expect(operationMessages.length).toBeGreaterThanOrEqual(2);
    expect(emailRelatedMessages.length).toBeGreaterThanOrEqual(1);
    expect(databaseMessages.length).toBeGreaterThanOrEqual(1);
    expect(successMessages.length).toBeGreaterThanOrEqual(2);

    // Pattern validation for debugging scenarios integration
    expect(infoMessages.some((msg) => String(msg).includes('user123'))).toBe(true);
    expect(infoMessages.some((msg) => String(msg).includes('1247ms'))).toBe(true);
  });

  // 包括的なワークフロー追跡を含む包括的シーケンス検証をテストする
  it('8.1.2h Refactor: Comprehensive sequence validation with comprehensive workflow tracking', (ctx) => {
    const mockLogger = setupE2eMockLogger('auth-seq', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Complete workflow sequence with detailed steps and validation
    const workflowId = 'wf_' + Date.now();
    const sequenceSteps = [
      'User registration initiated',
      'Input validation started',
      'Email format validated',
      'Password strength verified',
      'Database connection established',
      'User record created',
      'Account activation prepared',
      'User registration completed successfully',
    ];

    // Log complete sequence with step tracking
    sequenceSteps.forEach((step, index) => {
      logger.info(step, {
        workflowId,
        stepNumber: index + 1,
        totalSteps: sequenceSteps.length,
        userId: 'user123',
        timestamp: Date.now() + index,
      });
    });

    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);

    // Comprehensive sequence validation
    expect(infoMessages.length).toBe(sequenceSteps.length);
    expect(String(infoMessages[0])).toContain('User registration initiated');
    expect(String(infoMessages.at(-1))).toContain('User registration completed successfully');

    // Step-by-step validation (adjusted for PlainFormatter JSON serialization)
    sequenceSteps.forEach((expectedStep, index) => {
      expect(String(infoMessages[index])).toContain(expectedStep);
      expect(String(infoMessages[index])).toContain(`"stepNumber":${index + 1}`);
    });

    // Workflow consistency
    const allMessagesContainWorkflowId = infoMessages.every((msg) => String(msg).includes(workflowId));
    expect(allMessagesContainWorkflowId).toBe(true);
  });

  // 完全なデバッグ機能のための包括的データ存在検証をテストする
  it('8.1.2i Refactor: Comprehensive data presence validation for complete debugging capabilities', (ctx) => {
    const mockLogger = setupE2eMockLogger('auth-data', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Comprehensive critical data logging for debugging purposes
    const criticalData = {
      userId: 'user123',
      email: 'test@example.com',
      sessionId: 'sess_abc123',
      registrationId: 'reg_xyz456',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 E2E-Test',
      referrer: 'https://app.example.com/signup',
      timestamp: new Date().toISOString(),
      locale: 'en-US',
      timezone: 'America/New_York',
    };

    logger.info('User registration started', criticalData);
    logger.debug('Critical data checkpoint', {
      dataIntegrity: 'verified',
      requiredFields: Object.keys(criticalData),
      fieldCount: Object.keys(criticalData).length,
    });

    // Additional critical events with data preservation
    logger.info('Validation checkpoint passed', {
      userId: criticalData.userId,
      sessionId: criticalData.sessionId,
      validationStage: 'input_verification',
    });

    logger.info('Database persistence checkpoint', {
      userId: criticalData.userId,
      email: criticalData.email,
      registrationId: criticalData.registrationId,
      persistenceStage: 'user_record_creation',
    });

    const allMessages = [
      ...mockLogger.getMessages(AG_LOGLEVEL.INFO),
      ...mockLogger.getMessages(AG_LOGLEVEL.DEBUG),
    ];
    const joined = allMessages.map(String).join('\n');

    // Enhanced data presence validation for debugging purposes
    expect(joined.includes('user123')).toBe(true);
    expect(joined.includes('test@example.com')).toBe(true);
    expect(joined.includes('sess_abc123')).toBe(true);
    expect(joined.includes('reg_xyz456')).toBe(true);
    expect(joined.includes('192.168.1.100')).toBe(true);
    expect(joined.includes('Mozilla/5.0 E2E-Test')).toBe(true);
    expect(joined.includes('https://app.example.com/signup')).toBe(true);
    expect(joined.includes('en-US')).toBe(true);

    // Data integrity verification (adjusted for JSON serialization)
    expect(joined.includes('"dataIntegrity":"verified"')).toBe(true);
    expect(joined.includes('"fieldCount":10')).toBe(true);

    // Multi-stage data persistence verification
    expect(joined.includes('input_verification')).toBe(true);
    expect(joined.includes('user_record_creation')).toBe(true);
  });
});

// Phase 8.1.3: Error Propagation Tracing Through System Layers

/**
 * @suite Debugging | Error Propagation
 * @description 階層化されたエラー伝播の文脈(原因/再スロー/補足情報)の可観測化。
 * @testType e2e
 * @coverage 例外ハンドリング方針、エラー用メタデータ設計
 * Scenarios:
 * - 下位層で例外発生→捕捉して文脈を付与→再スロー
 * - 上位層で相関キーと原因スタックを記録
 * - 最終ハンドラで失敗の要約をログ
 * Expects:
 * - 原因チェーンが復元でき、相関キーが一貫
 * - 重要な補足情報(入力/状態)が失われない
 */
describe('Debugging Scenarios - Error Propagation', () => {
  // 包括的ロギング設定を持つ強化されたエラートレース環境をテストする
  it('8.1.3a Refactor: Enhanced error tracing environment with comprehensive logging configuration', (ctx) => {
    const mockLogger = setupE2eMockLogger('error-propagation', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Enhanced environment setup with error tracing context
    const tracingContext = {
      traceId: `trace_${Date.now()}`,
      sessionId: 'sess_error123',
      component: 'error-propagation-system',
      environment: 'e2e-testing',
      logLevel: AG_LOGLEVEL.DEBUG,
    };

    logger.info('Error tracing environment initialized', tracingContext);
    logger.debug('Error propagation logging configured', {
      ...tracingContext,
      capabilities: ['layer_tracking', 'context_propagation', 'root_cause_analysis'],
    });

    expect(() => AgLogger.getLogger()).not.toThrow();
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');

    // Verify tracing environment is ready
    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG);
    expect(infoMessages.some((m) => String(m).includes('Error tracing environment initialized'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('layer_tracking'))).toBe(true);
  });

  // 包括的コンテキストとメタデータを持つ強化された表面層エラーをテストする
  it('8.1.3b Refactor: Enhanced surface layer error with comprehensive context and metadata', (ctx) => {
    const mockLogger = setupE2eMockLogger('error-propagation', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Comprehensive error context and metadata
    const surfaceErrorContext = {
      traceId: `trace_${Date.now()}`,
      layer: 'api',
      component: 'input-validator',
      error: 'invalid_input',
      errorCode: 'VALIDATION_001',
      endpoint: '/api/users/register',
      method: 'POST',
      userAgent: 'Mozilla/5.0 E2E-Test',
      ipAddress: '192.168.1.100',
      timestamp: new Date().toISOString(),
      requestId: 'req_abc123',
      severity: 'HIGH',
    };

    logger.error('Surface layer validation failed', surfaceErrorContext);
    logger.debug('Error context captured for propagation analysis', {
      traceId: surfaceErrorContext.traceId,
      propagationLayer: 'surface',
      nextLayer: 'business',
    });

    const errorMessages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG);

    expect(errorMessages.some((m) => String(m).includes('Surface layer validation failed'))).toBe(true);
    expect(errorMessages.some((m) => String(m).includes('VALIDATION_001'))).toBe(true);
    expect(errorMessages.some((m) => String(m).includes('/api/users/register'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('propagation analysis'))).toBe(true);
  });

  // ルール検証とコンテキスト変換を含む強化されたビジネス層エラーハンドリングをテストする
  it('8.1.3c Refactor: Enhanced business layer error handling with rule validation and context transformation', (ctx) => {
    const mockLogger = setupE2eMockLogger('error-propagation', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Business rule validation and error transformation
    const businessErrorContext = {
      traceId: `trace_${Date.now()}`,
      layer: 'service',
      component: 'user-service',
      cause: 'validation_failed',
      errorCode: 'BUSINESS_002',
      businessRule: 'UNIQUE_EMAIL_CONSTRAINT',
      ruleViolation: 'duplicate_email_address',
      proposedAction: 'suggest_login',
      impactLevel: 'USER_BLOCKING',
      serviceMethod: 'validateUserRegistration',
      propagatedFrom: 'surface_layer',
      timestamp: new Date().toISOString(),
    };

    logger.error('Business layer processing error', businessErrorContext);
    logger.debug('Business rule validation failed', {
      traceId: businessErrorContext.traceId,
      rule: businessErrorContext.businessRule,
      violation: businessErrorContext.ruleViolation,
      remediation: 'user_notification_required',
    });
    logger.warn('Error context transformation for data layer', {
      traceId: businessErrorContext.traceId,
      transformedContext: 'business_to_data_layer',
      nextOperation: 'rollback_transaction',
    });

    const errorMessages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG);
    const warnMessages = mockLogger.getMessages(AG_LOGLEVEL.WARN);

    expect(errorMessages.some((m) => String(m).includes('Business layer processing error'))).toBe(true);
    expect(errorMessages.some((m) => String(m).includes('UNIQUE_EMAIL_CONSTRAINT'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('Business rule validation failed'))).toBe(true);
    expect(warnMessages.some((m) => String(m).includes('rollback_transaction'))).toBe(true);
  });

  // トランザクションロールバックとデータ整合性ログを含む強化されたデータ層エラーハンドリングをテストする
  it('8.1.3d Refactor: Enhanced data layer error handling with transaction rollback and data consistency logging', (ctx) => {
    const mockLogger = setupE2eMockLogger('error-propagation', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Transaction rollback and data consistency logging
    const dataErrorContext = {
      traceId: `trace_${Date.now()}`,
      layer: 'db',
      component: 'postgres-connection',
      operation: 'insert',
      table: 'users',
      errorCode: 'E_CONN',
      sqlState: '08006',
      transactionId: 'txn_456',
      connectionPool: 'pool_primary',
      isolationLevel: 'READ_COMMITTED',
      rollbackRequired: true,
      dataConsistency: 'COMPROMISED',
      retryAttempt: 1,
      maxRetries: 3,
      timestamp: new Date().toISOString(),
    };

    logger.error('Data layer persistence error', dataErrorContext);
    logger.debug('Transaction rollback initiated', {
      traceId: dataErrorContext.traceId,
      transactionId: dataErrorContext.transactionId,
      rollbackReason: 'connection_failure',
      affectedTables: ['users', 'user_profiles'],
    });
    logger.warn('Data consistency check required', {
      traceId: dataErrorContext.traceId,
      consistencyState: 'VERIFICATION_NEEDED',
      checkpoints: ['users.id_sequence', 'user_profiles.user_id_fk'],
    });
    logger.info('Connection recovery attempt scheduled', {
      traceId: dataErrorContext.traceId,
      retryStrategy: 'exponential_backoff',
      nextAttempt: '30s',
    });

    const errorMessages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);
    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG);
    const warnMessages = mockLogger.getMessages(AG_LOGLEVEL.WARN);
    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);

    expect(errorMessages.some((m) => String(m).includes('Data layer persistence error'))).toBe(true);
    expect(errorMessages.some((m) => String(m).includes('READ_COMMITTED'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('Transaction rollback initiated'))).toBe(true);
    expect(warnMessages.some((m) => String(m).includes('Data consistency check required'))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes('Connection recovery attempt'))).toBe(true);
  });

  // 戦略詳細と成功指標を含む強化されたリカバリプロセスをテストする
  it('8.1.3e Refactor: Enhanced recovery process with strategy details and success indicators', (ctx) => {
    const mockLogger = setupE2eMockLogger('error-propagation', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Recovery strategy details and success indicators
    const recoveryContext = {
      traceId: `trace_${Date.now()}`,
      strategy: 'circuit_breaker_with_fallback',
      attempt: 1,
      maxAttempts: 3,
      timeout: '5s',
      fallbackType: 'cached_response',
      cacheKey: 'user_validation_cache',
      recoveryInitiator: 'error_handler',
      timestamp: new Date().toISOString(),
    };

    logger.warn('Recovery attempt started', recoveryContext);
    logger.debug('Circuit breaker state change', {
      traceId: recoveryContext.traceId,
      previousState: 'OPEN',
      newState: 'HALF_OPEN',
      reason: 'recovery_timeout_reached',
    });
    logger.info('Fallback mechanism activated', {
      traceId: recoveryContext.traceId,
      fallbackStrategy: recoveryContext.fallbackType,
      cacheHit: true,
      responseTime: '12ms',
    });
    logger.info('Recovery operation succeeded', {
      traceId: recoveryContext.traceId,
      finalState: 'CLOSED',
      totalRecoveryTime: '127ms',
      successRate: '100%',
      nextEvaluation: '1m',
    });

    const warnMessages = mockLogger.getMessages(AG_LOGLEVEL.WARN);
    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG);
    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);

    expect(warnMessages.some((m) => String(m).includes('Recovery attempt started'))).toBe(true);
    expect(warnMessages.some((m) => String(m).includes('circuit_breaker_with_fallback'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('Circuit breaker state change'))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes('Fallback mechanism activated'))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes('Recovery operation succeeded'))).toBe(true);
  });

  // デバッグ分析のための高度フィルタリングを使用した包括的エラーパターン検出をテストする
  it('8.1.3f Refactor: Comprehensive error pattern detection using advanced filtering for debugging analysis', (ctx) => {
    const mockLogger = setupE2eMockLogger('error-propagation', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Comprehensive error pattern detection
    const traceId = `trace_${Date.now()}`;

    logger.error('Business layer processing error: validation failed', {
      traceId,
      field: 'email',
      errorPattern: 'VALIDATION_FAILURE',
      category: 'business_rule',
    });
    logger.error('Surface layer validation failed', {
      traceId,
      layer: 'api',
      errorPattern: 'INPUT_VALIDATION',
      category: 'user_input',
    });
    logger.error('Data integrity validation error', {
      traceId,
      constraint: 'UNIQUE_CONSTRAINT',
      errorPattern: 'DATA_INTEGRITY',
      category: 'database',
    });
    logger.error('Security validation breach detected', {
      traceId,
      violation: 'INVALID_TOKEN',
      errorPattern: 'SECURITY_VIOLATION',
      category: 'authentication',
    });

    const errorMessages = mockLogger.getMessages(AG_LOGLEVEL.ERROR);

    // Advanced filtering for error analysis
    const validationErrors = errorMessages.filter((m) => String(m).includes('validation'));
    const patternSpecificErrors = errorMessages.filter((m) => String(m).includes('errorPattern'));
    const businessErrors = errorMessages.filter((m) => String(m).includes('business_rule'));
    const securityErrors = errorMessages.filter((m) => String(m).includes('SECURITY_VIOLATION'));

    expect(validationErrors.length).toBeGreaterThanOrEqual(3);
    expect(patternSpecificErrors.length).toBe(4);
    expect(businessErrors.length).toBe(1);
    expect(securityErrors.length).toBe(1);

    // Pattern-based analysis
    expect(errorMessages.some((m) => String(m).includes('VALIDATION_FAILURE'))).toBe(true);
    expect(errorMessages.some((m) => String(m).includes('INPUT_VALIDATION'))).toBe(true);
    expect(errorMessages.some((m) => String(m).includes('DATA_INTEGRITY'))).toBe(true);
  });

  // 因果関係リンクと包括的分析深度を持つ強化された根本原因特定をテストする
  it('8.1.3g Refactor: Enhanced root cause identification with causation linking and comprehensive analysis depth', (ctx) => {
    const mockLogger = setupE2eMockLogger('error-propagation', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Causation linking and analysis depth
    const rootCauseTraceId = `trace_${Date.now()}`;
    const incidentId = `incident_${Date.now()}`;

    logger.error('Surface layer validation failed', {
      traceId: rootCauseTraceId,
      incidentId,
      layer: 'api',
      errorLevel: 1,
      propagatesTo: 'business_layer',
      symptom: 'invalid_email_format',
    });

    logger.error('Business layer processing error', {
      traceId: rootCauseTraceId,
      incidentId,
      layer: 'service',
      errorLevel: 2,
      cause: 'validation_failed',
      propagatedFrom: 'surface_layer',
      propagatesTo: 'data_layer',
      businessImpact: 'user_registration_blocked',
    });

    logger.error('Data layer persistence error', {
      traceId: rootCauseTraceId,
      incidentId,
      layer: 'db',
      errorLevel: 3,
      operation: 'insert',
      propagatedFrom: 'business_layer',
      transactionStatus: 'rolled_back',
    });

    // Root cause analysis with comprehensive context
    logger.error('Root cause analysis completed', {
      traceId: rootCauseTraceId,
      incidentId,
      rootCause: 'invalid_email_format',
      rootCauseCategory: 'USER_INPUT_VALIDATION',
      affectedLayers: ['surface', 'business', 'data'],
      propagationPattern: 'cascade_failure',
      resolutionStrategy: 'input_sanitization_enhancement',
      preventionMeasures: ['client_side_validation', 'server_side_regex_update'],
      businessImpact: 'user_experience_degradation',
      technicalDebt: 'validation_logic_refactoring_required',
    });

    const errorMessages = mockLogger.getMessages(AG_LOGLEVEL.ERROR).map(String).join('\n');

    // Enhanced causation verification
    expect(errorMessages.includes('Surface layer')).toBe(true);
    expect(errorMessages.includes('Business layer')).toBe(true);
    expect(errorMessages.includes('Data layer')).toBe(true);
    expect(errorMessages.includes('Root cause analysis completed')).toBe(true);

    // Causation chain verification
    expect(errorMessages.includes('propagatesTo')).toBe(true);
    expect(errorMessages.includes('propagatedFrom')).toBe(true);
    expect(errorMessages.includes('cascade_failure')).toBe(true);

    // Analysis depth verification
    expect(errorMessages.includes('resolutionStrategy')).toBe(true);
    expect(errorMessages.includes('preventionMeasures')).toBe(true);
    expect(errorMessages.includes('technicalDebt')).toBe(true);
  });
});

// Phase 8.1.4: Performance Bottleneck Investigation

/**
 * @suite Debugging | Performance Investigation
 * @description ボトルネック特定のための段階別メトリクス/タイミングを検証。
 * @testType e2e
 * @coverage タイミング/メトリクス出力、閾値設定と観測
 * Scenarios:
 * - フェーズA/B/Cで開始/完了ログと duration(ms) を出力
 * - 閾値を超える場合は WARN/ERROR を発報
 * Expects:
 * - 全フェーズに計測ログが存在し、閾値内もしくは正しく超過扱い
 */
describe('Debugging Scenarios - Performance Investigation', () => {
  // 高精度タイミングと包括的メトリクス設定を持つ強化されたパフォーマンス監視をテストする
  it('8.1.4a Refactor: Enhanced performance monitoring with high-precision timing and comprehensive metrics configuration', (ctx) => {
    const mockLogger = setupE2eMockLogger('perf-monitor', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: High-precision timing and performance metrics
    const performanceContext = {
      monitoringSessionId: `perf_${Date.now()}`,
      environment: 'e2e_performance_testing',
      precision: 'nanosecond',
      metricsEnabled: true,
      thresholds: {
        warning: '100ms',
        critical: '500ms',
        timeout: '5000ms',
      },
      collectMetrics: ['responseTime', 'memoryUsage', 'cpuUtilization', 'throughput'],
      samplingRate: '100%',
      retentionPeriod: '24h',
    };

    logger.info('Performance monitoring initialized', performanceContext);
    logger.debug('Performance thresholds configured', {
      monitoringSessionId: performanceContext.monitoringSessionId,
      warningThreshold: performanceContext.thresholds.warning,
      criticalThreshold: performanceContext.thresholds.critical,
      baselineEstablished: true,
    });
    logger.debug('Metrics collection activated', {
      monitoringSessionId: performanceContext.monitoringSessionId,
      activeMetrics: performanceContext.collectMetrics,
      precision: performanceContext.precision,
    });

    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO);
    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG);

    expect(infoMessages.some((m) => String(m).includes('Performance monitoring initialized'))).toBe(true);
    expect(infoMessages.some((m) => String(m).includes('nanosecond'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('Performance thresholds configured'))).toBe(true);
    expect(debugMessages.some((m) => String(m).includes('Metrics collection activated'))).toBe(true);
  });

  // 粒度の細かいパフォーマンス閾値と分析を持つ強化されたステップバイステップタイミングをテストする
  it('8.1.4b Refactor: Enhanced step-by-step timing with granular performance thresholds and analysis', (ctx) => {
    const mockLogger = setupE2eMockLogger('perf-steps', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Granular timing and performance thresholds
    const sessionId = `perf_${Date.now()}`;
    const performanceThresholds = {
      fast: 10,
      normal: 50,
      slow: 100,
      critical: 200,
    };

    const performanceStep = (name: string, work: () => void, expectedTime = 50): void => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      work();

      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage();
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      const performanceLevel = duration <= performanceThresholds.fast
        ? 'EXCELLENT'
        : duration <= performanceThresholds.normal
        ? 'GOOD'
        : duration <= performanceThresholds.slow
        ? 'ACCEPTABLE'
        : 'NEEDS_OPTIMIZATION';

      logger.info(`${name} performance analysis`, {
        sessionId,
        stepName: name,
        duration: `${duration.toFixed(3)}ms`,
        expected: `${expectedTime}ms`,
        performanceLevel,
        memoryImpact: `${Math.abs(memoryDelta)}B`,
        efficiency: duration <= expectedTime ? 'within_target' : 'exceeds_target',
      });

      if (duration > performanceThresholds.slow) {
        logger.warn(`Performance threshold exceeded for ${name}`, {
          sessionId,
          threshold: `${performanceThresholds.slow}ms`,
          actual: `${duration.toFixed(3)}ms`,
          recommendation: 'optimization_required',
        });
      }
    };

    performanceStep('User Input Validation', () => {
      for (let i = 0; i < 1000; i++) { Math.sqrt(i); }
    }, 30);

    performanceStep('Business Logic Processing', () => {
      for (let i = 0; i < 5000; i++) { Math.imul(i, i); }
    }, 80);

    performanceStep('Database Query Simulation', () => {
      for (let i = 0; i < 2000; i++) { JSON.stringify({ id: i, data: 'test' }); }
    }, 60);

    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO).map(String);
    expect(infoMessages.some((m) => m.includes('User Input Validation performance analysis'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('Business Logic Processing performance analysis'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('Database Query Simulation performance analysis'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('performanceLevel'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('memoryImpact'))).toBe(true);
  });

  // タイムアウト処理とパフォーマンス劣化検出を含む強化された外部API呼び出し監視をテストする
  it('8.1.4c Refactor: Enhanced external API call monitoring with timeout handling and performance degradation detection', async (ctx) => {
    const mockLogger = setupE2eMockLogger('perf-api', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Timeout handling and performance degradation detection
    const apiCallWithMonitoring = async (endpoint: string, timeout: number): Promise<void> => {
      const callId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionId = `perf_${Date.now()}`;

      logger.debug('API call initiated', {
        sessionId,
        callId,
        endpoint,
        timeout: `${timeout}ms`,
        expectedResponse: '<200ms',
        retryPolicy: 'exponential_backoff',
      });

      const startTime = Date.now();
      const timeoutWarningThreshold = timeout * 0.8;

      // Simulate API call with potential performance degradation
      const simulateApiCall = (): void => {
        for (let i = 0; i < 5000; i++) { Math.sqrt(i); }
      };

      const warningTimer = setTimeout(() => {
        logger.warn('API call approaching timeout', {
          sessionId,
          callId,
          elapsed: `${timeoutWarningThreshold}ms`,
          remaining: `${timeout - timeoutWarningThreshold}ms`,
          status: 'PERFORMANCE_DEGRADATION',
        });
      }, timeoutWarningThreshold);

      simulateApiCall();
      clearTimeout(warningTimer);

      const duration = Date.now() - startTime;
      const performanceStatus = duration < 100
        ? 'EXCELLENT'
        : duration < 200
        ? 'GOOD'
        : duration < timeout * 0.8
        ? 'ACCEPTABLE'
        : 'DEGRADED';

      logger.info('API call completed', {
        sessionId,
        callId,
        endpoint,
        duration: `${duration.toFixed(3)}ms`,
        timeout: `${timeout}ms`,
        performanceStatus,
        utilizationRatio: `${((duration / timeout) * 100).toFixed(1)}%`,
        responseClass: duration < timeout ? 'SUCCESS' : 'TIMEOUT_RISK',
      });

      if (duration > timeout * 0.7) {
        logger.warn('Performance degradation detected', {
          sessionId,
          callId,
          degradationType: 'RESPONSE_TIME_INCREASE',
          currentPerformance: `${duration.toFixed(3)}ms`,
          baselineExpected: '100ms',
          recommendation: 'investigate_external_service_health',
        });
      }
    };

    // Test different API scenarios
    await apiCallWithMonitoring('/api/users/validate', 500);
    await apiCallWithMonitoring('/api/external/geocoding', 1000);

    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO).map(String);
    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG).map(String);
    expect(debugMessages.some((m) => m.includes('API call initiated'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('API call completed'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('performanceStatus'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('utilizationRatio'))).toBe(true);
  });

  // 自動分析と最適化推奨を含む強化されたボトルネック特定をテストする
  it('8.1.4d Refactor: Enhanced bottleneck identification with automated analysis and optimization recommendations', (ctx) => {
    const mockLogger = setupE2eMockLogger('perf-bottleneck', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Automated bottleneck analysis and optimization recommendations
    const sessionId = `bottleneck_${Date.now()}`;
    const performanceMetrics: Array<{
      name: string;
      duration: number;
      memoryDelta: number;
      cpuIntensive: boolean;
      category: string;
    }> = [];

    const analyzePerformanceStep = (name: string, category: string, work: () => void): void => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      logger.debug('Performance step initiated', {
        sessionId,
        stepName: name,
        category,
        startTime: startTime.toFixed(3),
      });

      work();

      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage();
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
      const cpuIntensive = duration > 50; // Arbitrary threshold

      performanceMetrics.push({ name, duration, memoryDelta, cpuIntensive, category });

      logger.info('Performance step completed', {
        sessionId,
        stepName: name,
        category,
        duration: `${duration.toFixed(3)}ms`,
        memoryImpact: `${memoryDelta}B`,
        cpuIntensive,
        efficiency: duration < 50 ? 'HIGH' : duration < 100 ? 'MEDIUM' : 'LOW',
      });
    };

    // Execute performance steps with different characteristics
    analyzePerformanceStep('Parse request', 'IO_PROCESSING', () => {
      JSON.parse(JSON.stringify({ data: Array(100).fill('test') }));
    });

    analyzePerformanceStep('Validate payload', 'CPU_INTENSIVE', () => {
      for (let i = 0; i < 15000; i++) { Math.imul(i, i); }
    });

    analyzePerformanceStep('Transform data', 'MEMORY_INTENSIVE', () => {
      const largeArray = Array(5000).fill(0).map((_, i) => ({ id: i, data: `item_${i}` }));
      largeArray.sort((a, b) => a.id - b.id);
    });

    analyzePerformanceStep('Write to DB', 'IO_PROCESSING', () => {
      for (let i = 0; i < 1000; i++) { JSON.stringify({ id: i, timestamp: Date.now() }); }
    });

    // Comprehensive bottleneck analysis
    const sortedByDuration = [...performanceMetrics].sort((a, b) => b.duration - a.duration);
    const totalDuration = performanceMetrics.reduce((sum, step) => sum + step.duration, 0);
    const bottleneck = sortedByDuration[0];
    const bottleneckPercentage = (bottleneck.duration / totalDuration * 100).toFixed(1);

    logger.info('Bottleneck analysis completed', {
      sessionId,
      primaryBottleneck: bottleneck.name,
      bottleneckDuration: `${bottleneck.duration.toFixed(3)}ms`,
      bottleneckPercentage: `${bottleneckPercentage}%`,
      bottleneckCategory: bottleneck.category,
      totalSteps: performanceMetrics.length,
      totalDuration: `${totalDuration.toFixed(3)}ms`,
      cpuIntensiveSteps: performanceMetrics.filter((s) => s.cpuIntensive).length,
    });

    // Generate optimization recommendations
    const optimizationRecommendations = [];
    if (bottleneck.category === 'CPU_INTENSIVE') {
      optimizationRecommendations.push('consider_async_processing', 'implement_caching', 'algorithm_optimization');
    }
    if (bottleneck.category === 'MEMORY_INTENSIVE') {
      optimizationRecommendations.push('streaming_processing', 'memory_pool_optimization', 'garbage_collection_tuning');
    }
    if (bottleneck.category === 'IO_PROCESSING') {
      optimizationRecommendations.push('connection_pooling', 'batch_processing', 'async_io_operations');
    }

    logger.warn('Performance optimization recommendations', {
      sessionId,
      targetBottleneck: bottleneck.name,
      currentPerformance: `${bottleneck.duration.toFixed(3)}ms`,
      targetImprovement: '50%',
      recommendations: optimizationRecommendations,
      priority: parseFloat(bottleneckPercentage) > 40 ? 'HIGH' : 'MEDIUM',
    });

    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO).map(String);
    const warnMessages = mockLogger.getMessages(AG_LOGLEVEL.WARN).map(String);

    expect(infoMessages.some((m) => m.includes('Bottleneck analysis completed'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('primaryBottleneck'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('bottleneckPercentage'))).toBe(true);
    expect(warnMessages.some((m) => m.includes('Performance optimization recommendations'))).toBe(true);
  });
});

// Phase 8.1.5: Intermittent API Integration Failure Investigation

/**
 * Intermittent API Integration Failure Analysis
 * @suite Debugging | Intermittent API Integration Failure
 * @description 間欠的な外部API失敗時の再試行/フォールバック/文脈記録を検証。
 * @testType e2e
 * @coverage 失敗処理方針、外部依存のデバッグ情報
 * Scenarios:
 * - 外部API呼び出しが間欠的に失敗する
 * - リトライ(回数/バックオフ)の実施と各試行の結果を記録
 * - フォールバック経路の選択と最終結果を記録
 * Expects:
 * - 試行回数/エラー詳細/フォールバック結果が追跡可能
 */
describe('Debugging Scenarios - Intermittent API Integration Failure', () => {
  // 包括的成功パターンドキュメントを含む強化された通常のAPI操作ベースラインをテストする
  it('8.1.5a Refactor: Enhanced normal API operation baseline with comprehensive success pattern documentation', (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Comprehensive success pattern documentation
    const sessionId = `baseline_${Date.now()}`;
    const baselineMetrics = {
      expectedLatency: '<100ms',
      successRate: '>99.5%',
      errorThreshold: '<0.5%',
      timeoutLimit: '5000ms',
    };

    logger.info('Baseline API operation initiated', {
      sessionId,
      pattern: 'NORMAL_OPERATION',
      baselineMetrics,
      monitoringPeriod: '5m',
    });

    // Document multiple successful operations
    const operations = [
      { method: 'GET', path: '/orders/123', expectedResponse: 'order_details' },
      { method: 'POST', path: '/orders', expectedResponse: 'order_created' },
      { method: 'PUT', path: '/orders/123', expectedResponse: 'order_updated' },
      { method: 'DELETE', path: '/orders/456', expectedResponse: 'order_deleted' },
    ];

    operations.forEach((op, index) => {
      const requestId = `req_${sessionId}_${index}`;
      const startTime = Date.now();

      logger.debug('API request sent', {
        sessionId,
        requestId,
        method: op.method,
        path: op.path,
        timestamp: new Date().toISOString(),
        expectedResponse: op.expectedResponse,
      });

      // Simulate normal processing time
      for (let i = 0; i < 100; i++) { Math.sqrt(i); }
      const latency = Date.now() - startTime;

      logger.info('API response received', {
        sessionId,
        requestId,
        status: '200 OK',
        latency: `${latency.toFixed(3)}ms`,
        responseType: op.expectedResponse,
        performanceLevel: latency < 50 ? 'EXCELLENT' : 'GOOD',
        baselineCompliant: true,
      });
    });

    logger.info('Baseline pattern established', {
      sessionId,
      operationsCompleted: operations.length,
      successRate: '100%',
      averageLatency: '<50ms',
      patternQuality: 'STABLE',
      readyForAnomalyDetection: true,
    });

    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO).map(String);
    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG).map(String);

    expect(infoMessages.some((m) => m.includes('Baseline API operation initiated'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('API response received'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('Baseline pattern established'))).toBe(true);
    expect(debugMessages.some((m) => m.includes('API request sent'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('baselineCompliant'))).toBe(true);
  });

  // パターン分析とコンテキストキャプチャを含む強化された間欠的失敗シミュレーションをテストする
  it('8.1.5b Refactor: Enhanced intermittent failure simulation with pattern analysis and context capture', (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Enhanced failure pattern analysis and context capture
    const sessionId = `intermittent_${Date.now()}`;
    const failurePatterns = {
      burstFailure: [1, 1, 0, 0, 0], // 2 consecutive failures, then success
      sporadicFailure: [0, 1, 0, 1, 0, 0, 1, 0], // Random intermittent failures
      periodicFailure: [0, 0, 1, 0, 0, 1, 0, 0, 1], // Regular interval failures
    };

    type PatternResult = {
      success: boolean;
      context: {
        sessionId: string;
        requestId: string;
        patternName: string;
        sequenceNumber: number;
        errorCode?: string;
        status?: string;
        timestamp: number;
      };
    };

    const runFailurePattern = (patternName: string, pattern: number[]): PatternResult[] => {
      let failures = 0;
      const patternResults: PatternResult[] = [];

      logger.debug('Failure pattern simulation started', {
        sessionId,
        patternName,
        patternLength: pattern.length,
        expectedFailureRate: `${(pattern.filter((x) => x === 1).length / pattern.length * 100).toFixed(1)}%`,
      });

      pattern.forEach((shouldFail, index) => {
        const requestId = `req_${sessionId}_${patternName}_${index}`;
        const timestamp = Date.now() + (index * 100); // Simulate time progression

        logger.info('API request sent', {
          sessionId,
          requestId,
          patternName,
          sequenceNumber: index + 1,
          totalRequests: pattern.length,
          timestamp,
        });

        if (shouldFail) {
          failures++;
          const errorContext = {
            sessionId,
            requestId,
            patternName,
            sequenceNumber: index + 1,
            errorType: 'INTERMITTENT_FAILURE',
            httpStatus: Math.random() > 0.5 ? '500' : '503',
            errorCode: Math.random() > 0.5 ? 'INTERNAL_SERVER_ERROR' : 'SERVICE_UNAVAILABLE',
            retryable: true,
            timestamp,
          };

          logger.error('API response failure', errorContext);
          patternResults.push({ success: false, context: errorContext });
        } else {
          const successContext = {
            sessionId,
            requestId,
            patternName,
            sequenceNumber: index + 1,
            status: '200 OK',
            latency: `${(Math.random() * 100 + 20).toFixed(3)}ms`,
            timestamp,
          };

          logger.info('API response success', successContext);
          patternResults.push({ success: true, context: successContext });
        }
      });

      const failRate = (failures / pattern.length * 100).toFixed(1);
      const consecutiveFailures = Math.max(...pattern.join('').split('0').map((s) => s.length));

      logger.error('Intermittent failure pattern analysis', {
        sessionId,
        patternName,
        totalRequests: pattern.length,
        failures,
        successes: pattern.length - failures,
        failureRate: `${failRate}%`,
        maxConsecutiveFailures: consecutiveFailures,
        patternType: consecutiveFailures > 1 ? 'BURST_FAILURE' : 'SPORADIC_FAILURE',
        impactLevel: parseFloat(failRate) > 20 ? 'HIGH' : parseFloat(failRate) > 10 ? 'MEDIUM' : 'LOW',
      });

      return patternResults;
    };

    // Execute different failure patterns
    runFailurePattern('burst', failurePatterns.burstFailure);
    runFailurePattern('sporadic', failurePatterns.sporadicFailure);

    const errorMessages = mockLogger.getMessages(AG_LOGLEVEL.ERROR).map(String);
    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO).map(String);
    const debugMessages = mockLogger.getMessages(AG_LOGLEVEL.DEBUG).map(String);

    expect(errorMessages.some((m) => m.includes('API response failure'))).toBe(true);
    expect(errorMessages.some((m) => m.includes('Intermittent failure pattern analysis'))).toBe(true);
    expect(errorMessages.some((m) => ['BURST_FAILURE', 'SPORADIC_FAILURE'].some((k) => m.includes(k)))).toBe(true);
    expect(debugMessages.some((m) => m.includes('Failure pattern simulation started'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('API response success'))).toBe(true);
  });

  // 環境、設定、ランタイムコンテキストの取得をテストする
  it('8.1.5c Green: Should capture environment, configuration, and runtime context', (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();
    logger.info(`Env: node=${process.version}`);
    logger.info(`Config: logLevel=${AG_LOGLEVEL.DEBUG}`);
    logger.info(`Runtime: platform=${process.platform}`);

    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO).map(String).join('\n');
    expect(infoMessages.includes('Env: node=')).toBe(true);
    expect(infoMessages.includes('Config: logLevel=')).toBe(true);
    expect(infoMessages.includes('Runtime: platform=')).toBe(true);
  });

  // 8.1.5c Refactor/Validate: 環境コンテキスト拡充および検証（構造化データ; MockFormatter.passthrough）
  // デバッグ分析のための包括的環境コンテキストキャプチャをテストする
  it('8.1.5c Refactor: should capture comprehensive environmental context for debugging analysis', async (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent-env', ctx);

    AgLogger.createLogger({
      formatter: MockFormatter.passthrough,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // 収集: ランタイム/OS/メモリ/リソース/ENVの代表値
    const os = await import('os');
    const envContext = {
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        cwd: process.cwd(),
      },
      memory: process.memoryUsage(),
      resource:
        typeof (process as NodeJS.Process & { resourceUsage?: () => NodeJS.ResourceUsage }).resourceUsage === 'function'
          ? (process as NodeJS.Process & { resourceUsage?: () => NodeJS.ResourceUsage }).resourceUsage()
          : {},
      osInfo: {
        cpuCores: os.cpus().length,
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
      },
      envSample: {
        NODE_ENV: process.env.NODE_ENV ?? 'undefined',
        TZ: process.env.TZ ?? 'undefined',
      },
      capturedAt: Date.now(),
    };

    logger.info('Environmental context captured', envContext);

    const msgs = mockLogger.getMessages(AG_LOGLEVEL.INFO);
    expect(msgs).toHaveLength(1);
    const entry = msgs[0] as AgLogMessage;
    // 構造化データ: args[0] に環境情報
    const payload = (entry as AgLogMessage & { args?: unknown[] }).args[0] as Record<string, unknown>;
    expect(typeof payload).toBe('object');
    expect(payload).toHaveProperty('runtime');
    expect(payload).toHaveProperty('memory');
    expect(payload).toHaveProperty('resource');
    expect(payload).toHaveProperty('osInfo');
    expect(payload).toHaveProperty('envSample');
  });

  // 失敗時のシステムリソース状態を記録するテスト
  it('8.1.5c Refactor: should record system resource states during failures', async (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent-resources', ctx);

    AgLogger.createLogger({
      formatter: MockFormatter.passthrough,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();
    const os = await import('os');

    // 疑似的な失敗に合わせてスナップショット
    const snapshot = {
      memoryUsage: process.memoryUsage(),
      resourceUsage:
        typeof (process as NodeJS.Process & { resourceUsage?: () => NodeJS.ResourceUsage }).resourceUsage === 'function'
          ? (process as NodeJS.Process & { resourceUsage?: () => NodeJS.ResourceUsage }).resourceUsage()
          : {},
      cpuCores: os.cpus().length,
      diskUsage: { usedPercent: 'N/A' }, // Node標準での取得が難しいため擬似値
      failure: {
        type: 'INTERMITTENT_FAILURE',
        code: 'SERVICE_UNAVAILABLE',
        at: Date.now(),
      },
    };

    logger.error('API failure detected with system resource snapshot', snapshot);

    const err = mockLogger.getMessages(AG_LOGLEVEL.ERROR)[0] as AgLogMessage;
    const payload = (err as AgLogMessage & { args?: unknown[] }).args[0] as Record<string, unknown>;
    expect(payload).toHaveProperty('memoryUsage');
    expect(payload).toHaveProperty('resourceUsage');
    expect(payload).toHaveProperty('cpuCores');
    expect(payload).toHaveProperty('diskUsage');
    expect(payload).toHaveProperty('failure');
  });

  // ネットワーク条件と接続状態をドキュメント化するテスト
  it('8.1.5c Refactor: should document network conditions and connectivity status', async (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent-network', ctx);

    AgLogger.createLogger({
      formatter: MockFormatter.passthrough,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();
    const os = await import('os');
    const net = {
      interfaces: Object.keys(os.networkInterfaces()),
      connectivity: 'SIMULATED',
      latencyMs: 42,
      bandwidthMbps: 100,
      dnsResolution: 'SIMULATED_OK',
      capturedAt: Date.now(),
    };
    logger.info('Network conditions snapshot', net);

    const entry = mockLogger.getMessages(AG_LOGLEVEL.INFO)[0] as AgLogMessage;
    const payload = (entry as AgLogMessage & { args?: unknown[] }).args[0] as Record<string, unknown>;
    expect(payload).toHaveProperty('interfaces');
    expect(payload).toHaveProperty('latencyMs');
    expect(payload).toHaveProperty('bandwidthMbps');
    expect(payload).toHaveProperty('dnsResolution');
  });

  // 依存サービスのヘルスインジケーターを保持するテスト
  it('8.1.5c Refactor: should preserve dependency service health indicators', (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent-deps', ctx);

    AgLogger.createLogger({
      formatter: MockFormatter.passthrough,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();
    const dependencies = [
      { name: 'user-service', status: 'HEALTHY', responseTimeMs: 30, errorRate: '0.1%' },
      { name: 'payment-service', status: 'DEGRADED', responseTimeMs: 200, errorRate: '2.5%' },
    ];
    logger.info('Dependency health snapshot', { dependencies, capturedAt: Date.now() });

    const entry = mockLogger.getMessages(AG_LOGLEVEL.INFO)[0] as AgLogMessage;
    const payload = (entry as AgLogMessage & { args?: unknown[] }).args[0] as Record<string, unknown>;
    expect(Array.isArray(payload.dependencies)).toBe(true);
    const hasDegraded = (payload.dependencies as Array<{ status: string }>).some((d) => d.status === 'DEGRADED');
    expect(hasDegraded).toBe(true);
  });

  // システムイベントとのタイミング相関をキャプチャするテスト
  it('8.1.5c Refactor: should capture timing correlation with system events', (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent-events', ctx);

    AgLogger.createLogger({
      formatter: MockFormatter.passthrough,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();
    const t0 = Date.now();
    const events = [
      { type: 'deployment', ts: t0 - 3000 },
      { type: 'maintenance_window', ts: t0 - 120000 },
      { type: 'traffic_spike', ts: t0 + 100 },
      { type: 'failure', ts: t0 + 120 },
    ];
    const correlated = ['traffic_spike'];
    logger.info('Event correlation analysis', { events, correlated, windowMs: 300 });

    const entry = mockLogger.getMessages(AG_LOGLEVEL.INFO)[0] as AgLogMessage;
    const payload = (entry as AgLogMessage & { args?: unknown[] }).args[0] as Record<string, unknown>;
    expect(Array.isArray(payload.events)).toBe(true);
    expect(Array.isArray(payload.correlated)).toBe(true);
    expect((payload.correlated as string[]).includes('traffic_spike')).toBe(true);
  });

  // 設定ドリフト検出マーカーを記録するテスト
  it('8.1.5c Refactor: should record configuration drift detection markers', async (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent-config', ctx);

    AgLogger.createLogger({
      formatter: MockFormatter.passthrough,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();
    const fs = await import('fs');
    const path = await import('path');
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string };

    const baseline = { version: pkg.version ?? '0.0.0', featureFlags: { newFeature: false }, logLevel: 'INFO' };
    const current = { version: pkg.version ?? '0.0.0', featureFlags: { newFeature: true }, logLevel: 'DEBUG' };
    const driftMarkers = Object.keys({ ...baseline, ...current }).filter((k) =>
      JSON.stringify((baseline as Record<string, unknown>)[k])
        !== JSON.stringify((current as Record<string, unknown>)[k])
    );

    logger.warn('Configuration drift detected', { baseline, current, driftMarkers });

    const warn = mockLogger.getMessages(AG_LOGLEVEL.WARN)[0] as AgLogMessage;
    const payload = (warn as AgLogMessage & { args?: unknown[] }).args[0] as Record<string, unknown>;
    expect(Array.isArray(payload.driftMarkers)).toBe(true);
    expect((payload.driftMarkers as unknown[]).length).toBeGreaterThanOrEqual(1);
  });

  // 根本原因分析のための環境データ完全性を検証するテスト
  it('8.1.5c Validate: should verify environmental data completeness for root cause analysis', (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent-validate-completeness', ctx);

    AgLogger.createLogger({
      formatter: MockFormatter.passthrough,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();
    const completeness = {
      runtime: true,
      memory: true,
      network: true,
      dependencies: true,
      config: true,
      events: true,
    };
    const complete = Object.values(completeness).every(Boolean);
    logger.info('Environmental data completeness verified', { dimensionsPresent: completeness, complete });

    const info = mockLogger.getMessages(AG_LOGLEVEL.INFO)[0] as AgLogMessage;
    const payload = (info as AgLogMessage & { args?: unknown[] }).args[0] as Record<string, unknown>;
    expect(payload.complete).toBe(true);
    expect(Object.keys(payload.dimensionsPresent as Record<string, unknown>)).toEqual([
      'runtime',
      'memory',
      'network',
      'dependencies',
      'config',
      'events',
    ]);
  });

  // 失敗パターンとの環境コンテキスト相関を検証するテスト
  it('8.1.5c Validate: should validate environmental context correlation with failure patterns', (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent-validate-correlation', ctx);

    AgLogger.createLogger({
      formatter: MockFormatter.passthrough,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();
    const failures = [1, 0, 1, 0, 1];
    const latencies = [120, 30, 140, 25, 180];
    const correlated = failures.filter((f, i) => f === 1 && latencies[i] > 100).length;
    const correlationScore = correlated / failures.filter((f) => f === 1).length; // 0..1
    logger.info('Environmental context correlation analysis', {
      correlationScore,
      evidenceCount: correlated,
      rule: 'latency>100ms -> failure',
    });

    const info = mockLogger.getMessages(AG_LOGLEVEL.INFO)[0] as AgLogMessage;
    const payload = (info as AgLogMessage & { args?: unknown[] }).args[0] as Record<string, unknown>;
    expect(typeof payload.correlationScore).toBe('number');
    expect(payload.correlationScore).toBeGreaterThan(0);
  });

  // デバッグチームの環境コンテキストアクセシビリティを確認するテスト
  it('8.1.5c Validate: should confirm environmental context accessibility for debugging teams', (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent-validate-access', ctx);

    AgLogger.createLogger({
      formatter: MockFormatter.passthrough,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();
    const structured = {
      runtime: { platform: process.platform },
      memory: { rss: process.memoryUsage().rss },
      network: { connectivity: 'SIMULATED' },
      dependencies: [{ name: 'user-service', status: 'HEALTHY' }],
      config: { logLevel: 'DEBUG' },
      events: [{ type: 'failure', ts: Date.now() }],
    };
    logger.info('Structured environmental context for searchability', structured);

    const info = mockLogger.getMessages(AG_LOGLEVEL.INFO)[0] as AgLogMessage;
    const entryObj = info as AgLogMessage & { args?: unknown[] };
    expect(typeof entryObj.message).toBe('string');
    const payload = entryObj.args[0];
    // チームの検索性: 一貫したトップレベルキーを保持
    ['runtime', 'memory', 'network', 'dependencies', 'config', 'events'].forEach((k) =>
      expect(payload).toHaveProperty(k)
    );
  });

  // 包括的調査ワークフローを含む強化された失敗パターン分析をテストする
  it('8.1.5d Refactor: Enhanced failure pattern analysis with comprehensive investigation workflow', (ctx) => {
    const mockLogger = setupE2eMockLogger('api-intermittent', ctx);

    AgLogger.createLogger({
      formatter: PlainFormatter,
      loggerMap: mockLogger.defaultLoggerMap,
      logLevel: AG_LOGLEVEL.DEBUG,
    });

    const logger = AgLogger.getLogger();

    // Refactor: Comprehensive failure pattern analysis
    const sessionId = `pattern_analysis_${Date.now()}`;
    logger.info('Advanced failure pattern analysis initiated', {
      sessionId,
      analysisType: 'COMPREHENSIVE_INTERMITTENT_FAILURE',
    });

    const failureSequence: number[] = [];
    for (let i = 0; i < 20; i++) {
      const isFail = i % 5 === 0 || i % 5 === 1; // 2連続失敗→スパイクを形成
      logger.info('API request sent', { sessionId, id: i });
      if (isFail) {
        failureSequence.push(1);
        logger.error('API response 500 Internal Server Error', { sessionId, id: i });
      } else {
        failureSequence.push(0);
        logger.info('API response 200 OK', { sessionId, id: i });
      }
    }

    // Advanced pattern analysis
    let maxBurst = 0;
    let cur = 0;
    for (const v of failureSequence) {
      cur = v ? cur + 1 : 0;
      maxBurst = Math.max(maxBurst, cur);
    }

    const failureCount = failureSequence.filter((x) => x === 1).length;
    const failureRate = (failureCount / failureSequence.length * 100).toFixed(1);

    logger.warn('Intermittent failure pattern analysis completed', {
      sessionId,
      maxConsecutiveFailures: maxBurst,
      failureRate: `${failureRate}%`,
      totalRequests: failureSequence.length,
    });

    logger.info('Investigation workflow recommendations generated', {
      sessionId,
      investigationPriority: parseFloat(failureRate) > 20 ? 'CRITICAL' : 'HIGH',
    });

    const infoMessages = mockLogger.getMessages(AG_LOGLEVEL.INFO).map(String);
    const warnMessages = mockLogger.getMessages(AG_LOGLEVEL.WARN).map(String);

    expect(infoMessages.some((m) => m.includes('Advanced failure pattern analysis initiated'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('Investigation workflow recommendations generated'))).toBe(true);
    expect(warnMessages.some((m) => m.includes('Intermittent failure pattern analysis completed'))).toBe(true);
    expect(warnMessages.some((m) => m.includes('maxConsecutiveFailures'))).toBe(true);
    expect(infoMessages.some((m) => m.includes('investigationPriority'))).toBe(true);
  });
});
