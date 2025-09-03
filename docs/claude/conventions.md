---
header:
  - src: conventions.md
  - @(#): コーディング規約とガイドライン
title: Conventions and Guidelines
description: 重要なコーディング規約、ファイル作成ルール、開発ガイドライン
version: 1.0.0
created: 2025-09-04
authors:
  - atsushifx
changes:
  - 2025-09-04: 初版作成
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

## Conventions and Guidelines

This file contains important coding conventions, file creation rules, and development guidelines.

### Important Instruction Reminders

### Core Development Principles

- **Do what has been asked; nothing more, nothing less**
- **NEVER create files unless they're absolutely necessary for achieving your goal**
- **ALWAYS prefer editing an existing file to creating a new one**
- **NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User**

### File Creation Rules

1. **Minimal File Creation**: Only create files when absolutely necessary
2. **Prefer Editing**: Always prefer modifying existing files over creating new ones
3. **Documentation Policy**: Never create documentation files unless explicitly requested
4. **README Policy**: Never proactively create README files

### Code Style Guidelines

### Comments Policy

- **IMPORTANT: DO NOT ADD ***ANY*** COMMENTS unless asked**
- Keep code self-documenting through clear naming and structure
- Only add comments when explicitly requested by the user

### Code Organization

- Follow existing patterns in the codebase
- Use established libraries and utilities
- Maintain consistency with surrounding code
- Follow TypeScript strict mode conventions

### Testing Conventions

### Error Message Testing

- **Memo: check errormessage with toThrow if you write expect**
- Always validate error messages when testing exception scenarios
- Use descriptive error messages that match actual implementation

### BDD Testing Approach

- Follow atsushifx式 BDD methodology
- Use natural language descriptive test naming
- Implement RED/GREEN cycle confirmation
- Write minimal implementation for test passage only

### Security and Quality Standards

### Security Requirements

- Never introduce code that exposes or logs secrets and keys
- Never commit secrets or keys to the repository
- Follow security best practices for TypeScript/Node.js development

### Code Quality Standards

- Use TypeScript strict mode
- Follow ESLint rules and formatting standards
- Ensure comprehensive error handling
- Implement type-safe patterns

### Development Workflow Conventions

### Library and Framework Usage

- NEVER assume that a given library is available, even if it is well known
- Always check that the codebase already uses the given library
- Look at neighboring files or check package.json/cargo.toml before using libraries

### Component Creation

- Look at existing components to understand patterns
- Consider framework choice, naming conventions, typing, and other conventions
- Follow existing architectural patterns

### Code Editing

- Examine surrounding context (especially imports) before making changes
- Understand existing framework and library choices
- Make changes that are idiomatic to the existing codebase

### Project-Specific Conventions

### Package Structure

- Follow the standardized package structure across all packages
- Use consistent build outputs and configuration management
- Implement comprehensive testing at appropriate levels

### Module System

- Prefer ESM-first approach with CommonJS compatibility
- Use workspace protocol (`workspace:*`) for internal dependencies
- Implement proper export maps for dual publishing

### Error Handling Patterns

- Use comprehensive error handling with descriptive messages
- Implement type-safe error patterns using TypeScript
- Include validation at both configuration and runtime levels
