---
title: E2E Fixture Framework – Writing Tests Guide
description: Learn how to use the E2E Fixture Framework to write flexible, fixture-based end-to-end tests.
sidebar_position: 0
---

English | [日本語](./README.ja.md)

---

## E2E Fixture Framework – Writing Tests Guide

<!-- textlint-disable ja-technical-writing/sentence-length --><!-- markdownlint-disable line-length -->

This guide explains how to **write end-to-end (E2E) tests using fixtures** with the E2E Fixture Framework.
It is intended for developers who are *using* the framework to write tests in other packages or projects—not for those maintaining the framework itself.

<!-- markdownlint-enable --><!-- textlint-enable -->

---

<!-- textlint-disable ja-technical-writing/sentence-length -->

### Table of Contents

- **[01. Getting Started](01-getting-started.ja.md)**
  How to install the framework, create the initial files, and run your first test

- **[02. Framework Overview](02-overview.ja.md)**
  The design philosophy, internal flow, and directory structure

- **[03. Project Structure Guide](03-project-structure.ja.md)**
  How to organize test files and fixtures with naming conventions

- **[04. Writing Fixtures](04-writing-fixtures.ja.md)**
  How to write `input.md` / `output.json`, with design tips

- **[05. Implementing E2E Tests](05-writing-e2e-tests.ja.md)**
  Writing `framework.e2e.spec.ts` using fixtures effectively

- **[06. Parsers and Validators](06-parsers-and-validators.ja.md)**
  Understanding built-in parser/validator behavior and how to extend them

- **[07. Running Tests with Conditions](07-run-tests-with-options.ja.md)**
  How to run selective tests with filters, excludes, and categories

- **[08. CI Integration](08-ci-integration.ja.md)**
  Running tests in GitHub Actions and tips for CI configuration

- **[09. API Reference](09-api-reference.ja.md)**
  Usage and specs for `AgE2eTestDiscovery`, `AgE2eFileReader`, and `fixtureRunner`

<!-- textlint-enable -->

---

## 🧭 About This Guide

<!-- textlint-disable ja-technical-writing/sentence-length,ja-technical-writing/no-exclamation-question-mark -->

Each chapter can be read independently, but we recommend reading from `01 → 08` for a complete understanding.
If you'd like to improve the docs or report issues, please submit a GitHub Discussion or Pull Request!

<!-- textlint-enable -->

---

## License

MIT License
© 2025 [atsushifx](https://github.com/atsushifx)
*Powered by AI Agents (Elpha, Kobeni, Tsumugi)*
