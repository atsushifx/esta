---
header:
  - src: docs/specs/@esta-utils-command-runner.spec.md
  - @(#) : ESTA Utils command execution utilities
title: 🏃 コマンド実行ユーティリティ仕様書（@esta-utils/command-runner）
version: 1.0.0
created: 2025-07-14
updated: 2025-07-14
authors:
  - 🧠 つむぎ（コマンド実行アーキテクチャ）
  - 🧁 小紅（クロスプラットフォーム対応）
  - ⚙️ エルファ（シェル統合実装）
  - 👤 atsushifx（全体設計・仕様確定）
changes:
  - 2025-07-14: フロントマター追加とドキュメント統一
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## 概要

<!-- textlint-disable ja-technical-writing/sentence-length -->
<!-- markdownlint-disable line-length -->

The `@esta-utils/command-utils` package provides a comprehensive set of utilities for safe and reliable command execution in cross-platform environments. This package is designed to handle shell command
execution with proper escaping, platform-specific shell management, and command existence checking.

<!-- markdownlint-disable -->
<!-- textlint-enable -->

## Package Information

- Package Name: `@esta-utils/command-utils`
- Version: 0.0.0
- License: MIT
- Author: atsushifx
- Type: ESM Module with CommonJS compatibility

## Current Implementation Status

### Existing Features

- `commandExist`: Command existence checking utility
- Platform detection integration with `@esta-utils/get-platform`
- Windows and Linux/macOS support

### Planned Features (To Be Implemented)

- `wrapCommand`: Safe command and argument wrapping
- `shellTable`: Platform-specific shell configuration
- `runCommand`: Asynchronous command execution with timeout
- Enhanced `commandExist` using `runCommand`

## API Specifications

### 1. wrapCommand Function

```typescript
function wrapCommand(cmd: string, args: string[]): string;
```

**Purpose**: Safely wrap command and arguments with proper escaping for shell execution.

**Parameters**:

- `cmd`: Command name to execute
- `args`: Array of command arguments

**Returns**: Escaped command string ready for shell execution

**Behavior**:

- Wraps command and each argument in double quotes
- Escapes double quotes (`"`) and backslashes (`\`) within arguments
- Handles empty strings and special characters
- Returns space-separated string of escaped command and arguments

**Example**:

```typescript
wrapCommand('echo', ['Hello World', 'Path with "quotes"']);
// Returns: "echo" "Hello World" "Path with \"quotes\""
```

### 2. shellTable Configuration

```typescript
type PlatformType = 'windows' | 'linux' | 'mac';
const shellTable: Record<PlatformType, [string, string]>;
```

**Purpose**: Platform-specific shell command and argument configuration.

**Structure**:

- `windows`: `["cmd", "/c"]`
- `linux`: `["bash", "-c"]`
- `mac`: `["bash", "-c"]`

**Configuration Function**:

```typescript
function setShellForPlatform(platform: PlatformType, shell: string, arg: string): void;
```

**Purpose**: Override default shell configuration for specific platforms.

### 3. runCommand Function

```typescript
function runCommand(cmdWithArgs: string[], timeoutMs?: number): Promise<number>;
```

**Purpose**: Execute commands asynchronously through platform-appropriate shell.

**Parameters**:

- `cmdWithArgs`: Array where first element is command, rest are arguments
- `timeoutMs`: Timeout in milliseconds (default: 5000)

**Returns**: Promise resolving to exit code

**Behavior**:

- Uses `wrapCommand` for safe argument handling
- Uses `shellTable` for platform-specific shell selection
- Supports timeout with process termination
- Ignores stdout/stderr, returns only exit code
- Supports concurrent execution

**Example**:

```typescript
const exitCode = await runCommand(['git', 'status'], 10000);
if (exitCode === 0) {
  console.log('Git status succeeded');
}
```

### 4. commandExist Function (Enhanced)

```typescript
function commandExist(command: string): Promise<boolean>;
```

**Purpose**: Check if a command exists in the system PATH.

**Current Implementation**:

- Windows: Uses `where <command>` via `cmd /c`
- Linux/macOS: Uses `command -v <command>` via `sh -c`
- Returns boolean based on exit code

**Planned Enhancement**:

- Refactor to use `runCommand` for consistency
- Maintain same API for backward compatibility
- Improve error handling and timeout support

## Architecture Design

### Dependencies

- `@esta-utils/get-platform`: Platform detection
- `child_process`: Node.js process spawning
- Built-in Node.js modules for timeout and error handling

### Module Structure

```
src/
├── index.ts           # Main entry point
├── commandExist.ts    # Command existence checking
├── wrapCommand.ts     # Command wrapping utilities (planned)
├── shellTable.ts      # Shell configuration (planned)
├── runCommand.ts      # Command execution (planned)
└── types.ts          # Type definitions (planned)
```

### Error Handling Strategy

- Graceful degradation for unsupported platforms
- Timeout handling with proper process cleanup
- Comprehensive error logging for debugging
- Type-safe error patterns

### Security Considerations

- Proper argument escaping to prevent injection attacks
- Shell command validation
- Timeout limits to prevent hanging processes
- No sensitive data logging

## Usage Examples

### Basic Command Execution

```typescript
import { commandExist, runCommand } from '@esta-utils/command-utils';

// Check if git exists
if (await commandExist('git')) {
  // Execute git command safely
  const exitCode = await runCommand(['git', 'clone', 'https://github.com/user/repo.git']);
  console.log(`Git clone ${exitCode === 0 ? 'succeeded' : 'failed'}`);
}
```

### Custom Shell Configuration

```typescript
import { runCommand, setShellForPlatform } from '@esta-utils/command-utils';

// Use PowerShell on Windows
setShellForPlatform('windows', 'powershell', '-Command');

// Execute PowerShell command
await runCommand(['Get-Process', '-Name', 'node']);
```

### Concurrent Command Execution

```typescript
import { runCommand } from '@esta-utils/command-utils';

// Execute multiple commands concurrently
const results = await Promise.all([
  runCommand(['npm', 'install']),
  runCommand(['npm', 'run', 'build']),
  runCommand(['npm', 'test']),
]);

console.log('All commands completed:', results);
```

## Testing Strategy

### Unit Tests

- Command wrapping with various argument types
- Shell table configuration and override
- Platform-specific behavior validation
- Error handling and edge cases

### Integration Tests

- End-to-end command execution
- Cross-platform compatibility
- Timeout behavior validation
- Concurrent execution safety

### E2E Tests

- Real command execution scenarios
- File I/O operations with commands
- GitHub Actions environment testing

## Implementation Roadmap

### Phase 1: Core Utilities

1. Implement `wrapCommand` with comprehensive escaping
2. Create `shellTable` with platform detection
3. Add unit tests for core functionality

### Phase 2: Command Execution

1. Implement `runCommand` with timeout support
2. Integrate with existing platform detection
3. Add integration tests

### Phase 3: Enhancement & Refactoring

1. Refactor `commandExist` to use `runCommand`
2. Add comprehensive error handling
3. Performance optimization

### Phase 4: Documentation & Polish

1. Complete API documentation
2. Add usage examples
3. Final testing and validation

## Compatibility

- Node.js: >= 20
- Package Manager: pnpm >= 10
- Platforms: Windows, Linux, macOS
- Module System: ESM with CommonJS compatibility

## Migration Guide

### From Current Implementation

The existing `commandExist` function will remain backward compatible. New features will be additive, requiring no breaking changes for existing users.

### Integration with ESTA

<!-- textlint-disable ja-technical-writing/sentence-length -->

This package is designed to support the ESTA GitHub Actions framework, providing safe and reliable command execution for tool installation and automation workflows.

<!-- textlint-enable -->
