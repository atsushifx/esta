---
title: Contribution Guidelines
description: How to contribute, report issues, and set up your environment for easy-setup-tools-action.
slug: contributing
tags:
  - contributing
  - guideline
  - setup
---
<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->
[English](CONTRIBUTING.md) | 日本語

## 🤝 Contribution Guidelines

<!-- textlint-disable -->
Thank you for thinking about contributing to this project!
<!-- textlint-enable -->Your contributions help make this project even better.

### 📈 How to Contribute

#### 1. Report an Issue

- Please report bugs or suggest features through [Issues](https://github.com/atsushifx/easy-setup-tools-action/issues).
- When reporting, include details such as reproduction steps, expected behavior, and actual behavior.

#### 2. Use Discussions (Questions, Suggestions, Chat)

Join the GitHub Discussions if you have:

- 💬 [Questions / Consultations (Q\&A)](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/q-a)
- 💡 [Feature Ideas](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/ideas)
- 🔈 [Casual Talk / General Discussion](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/general)

#### 3. Submit a Pull Request

- Fork the repository and create a branch like `feature/your-feature-name`.
- Edit the source code or documentation and commit your changes.

  - Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
  - Commit one feature per commit to make history clean.
  - Rebase before submitting to organize commits by purpose.
- In the pull request:

  - Use a clear, one-line summary in the title.
  - Write an explanation or context in the body.

### 🔧 Project Environment

#### Setup

Run the following to set up your local development environment:

```powershell
git clone https://github.com/atsushifx/easy-setup-tools-action.git
cd easy-setup-tools-action
.\scripts\installDevTools.ps1
pnpm install
pnpm run build
```

For details, see the [Onboarding Guide](docs/onboarding/README.ja.md).

#### Testing

Please run tests when making changes to ensure nothing breaks. Use `Vitest`:

- Create unit tests under the `__tests__` directory.
- Integration tests should go under the `tests` directory at the package root.

#### Code Style & Formatting

Use the following tools to ensure consistent code style:

- Formatter: dprint
- Linter: ESLint
- Spell Checker: CSpell
- Documentation Lint: textlint, markdownlint (`markdownlint-cli`)

### 📜 Code of Conduct

All contributors must follow the [Code of Conduct](CODE_OF_CONDUCT.md).

### 📚 References

- [GitHub Docs: Setting guidelines for repository contributors](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)

---

### 📬 Create an Issue or PR

- 🐛 [Report a Bug](https://github.com/atsushifx/.github/issues/new?template=bug_report.yml)
- ✨ [Request a Feature](https://github.com/atsushifx/.github/issues/new?template=feature_request.yml)
- 💬 [Q\&A (Ask a Question)](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/q-a)
- 🔈 [General Discussion](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/general)
- 💡 [Feature Suggestions](https://github.com/atsushifx/easy-setup-tools-action/discussions/categories/ideas)
- 🔀 [Create a Pull Request](https://github.com/atsushifx/.github/compare)

---

### 🤖 Powered by

The AI chatbot team supports this project:

- **Elpha** - Cool and precise assistant
- **Kobeni** - Gentle and caring helper
- **Tsumugi** - Bright and cheerful supporter

Each assistant helps improve the contribution experience.
Collaboration and shared growth make this project better. ✨
