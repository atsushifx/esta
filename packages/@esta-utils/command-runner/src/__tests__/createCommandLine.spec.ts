// src: packages/@esta-utils/command-runner/src/__tests__/createCommandLine.spec.ts
// @(#) : Test for createCommandLine utility
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest
import { describe, expect, it } from 'vitest';
// test target
import { createCommandLine } from '../runCommand';

describe('createCommandLine', () => {
  describe('basic functionality', () => {
    it('should create command line with no arguments', () => {
      const result = createCommandLine('echo', []);
      expect(result).toBe('`echo`');
    });

    it('should create command line with single argument', () => {
      const result = createCommandLine('echo', ['hello']);
      expect(result).toBe('`echo "hello"`');
    });

    it('should create command line with multiple arguments', () => {
      const result = createCommandLine('ls', ['-la', '/tmp']);
      expect(result).toBe('`ls "-la" "/tmp"`');
    });
  });

  describe('argument handling', () => {
    it('should quote all arguments', () => {
      const result = createCommandLine('echo', ['hello', 'world']);
      expect(result).toBe('`echo "hello" "world"`');
    });

    it('should handle arguments with spaces', () => {
      const result = createCommandLine('echo', ['hello world']);
      expect(result).toBe('`echo "hello world"`');
    });

    it('should handle arguments with double quotes', () => {
      const result = createCommandLine('echo', ['say "hello"']);
      expect(result).toBe('`echo "say "hello""`');
    });

    it('should handle arguments with single quotes', () => {
      const result = createCommandLine('echo', ["say 'hello'"]);
      expect(result).toBe('`echo "say \'hello\'"`');
    });

    it('should handle arguments with backticks', () => {
      const result = createCommandLine('echo', ['say `hello`']);
      expect(result).toBe('`echo "say `hello`"`');
    });

    it('should handle arguments with backslashes', () => {
      const result = createCommandLine('echo', ['C:\\Program Files\\Test']);
      expect(result).toBe('`echo "C:\\Program Files\\Test"`');
    });

    it('should handle arguments with mixed special characters', () => {
      const result = createCommandLine('echo', ['hello "world" and `test`']);
      expect(result).toBe('`echo "hello "world" and `test`"`');
    });
  });

  describe('edge cases', () => {
    it('should handle empty command', () => {
      const result = createCommandLine('', []);
      expect(result).toBe('``');
    });

    it('should handle empty arguments', () => {
      const result = createCommandLine('echo', ['']);
      expect(result).toBe('`echo ""`');
    });

    it('should handle multiple empty arguments', () => {
      const result = createCommandLine('echo', ['', '', '']);
      expect(result).toBe('`echo "" "" ""`');
    });

    it('should handle arguments with only spaces', () => {
      const result = createCommandLine('echo', ['   ']);
      expect(result).toBe('`echo "   "`');
    });

    it('should handle arguments with tabs and newlines', () => {
      const result = createCommandLine('echo', ['hello\tworld\n']);
      expect(result).toBe('`echo "hello\tworld\n"`');
    });
  });

  describe('complex scenarios', () => {
    it('should handle file paths with spaces', () => {
      const result = createCommandLine('cp', ['C:\\Program Files\\app.exe', 'D:\\My Documents\\backup.exe']);
      expect(result).toBe('`cp "C:\\Program Files\\app.exe" "D:\\My Documents\\backup.exe"`');
    });

    it('should handle command with mixed argument types', () => {
      const result = createCommandLine('git', ['commit', '-m', 'fix: update "config" file']);
      expect(result).toBe('`git "commit" "-m" "fix: update "config" file"`');
    });

    it('should handle arguments with environment variables', () => {
      const result = createCommandLine('echo', ['$HOME/my file', '%USERPROFILE%\\Documents']);
      expect(result).toBe('`echo "$HOME/my file" "%USERPROFILE%\\Documents"`');
    });

    it('should handle special shell characters', () => {
      const result = createCommandLine('echo', ['hello && echo world', 'test | grep foo']);
      expect(result).toBe('`echo "hello && echo world" "test | grep foo"`');
    });
  });
});
