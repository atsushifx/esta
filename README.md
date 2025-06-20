---
title: Easy Setup Tools Action
description: Install CLI tools easily via config, powered by eget.
slug: easy-setup-tools-action
tags:
  - setup
  - installer
  - action
  - eget
  - tools
---

English | [日本語](README.ja.md)

## Easy Setup Tools Action

> Install CLI tools easily via config, powered by [eget](https://github.com/zyedidia/eget).

### 🤝 Contributing

If you'd like to contribute to this project, please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed information on bug reports, feature requests, and pull requests.

### 📚 Developer Information

For development environment setup and development guidelines, see our [onboarding documentation](docs/onboarding/README.ja.md).

### 🚀 Usage

```yaml
uses: atsushifx/easy-setup-tools-action@v1
with:
  config: .github/tool-configs.json
  tools: just,fd
```

### 📂 Tool Config Example (`tool-configs.json`)

```json
[
  {
    "installer": "eget",
    "name": "just",
    "package": "casey/just",
    "options": {
      "version": "latest",
      "installDir": ".tools/bin",
      "args": ["--quiet"]
    }
  }
]
```

### ✅ Supported Installers

- `eget` (supported)
- `script` (planned)

### 🛠 Supported Config Options

| Field                | Description                                      | Required |
| -------------------- | ------------------------------------------------ | -------- |
| `installer`          | Must be `"eget"`                                 | ✅ Yes   |
| `name`               | Tool name (used as the map key or identifier)    | ✅ Yes   |
| `package`            | Package source, such as GitHub repo (`org/tool`) | ✅ Yes   |
| `options.version`    | Version to install (`"latest"` or specific tag)  | ❌ No    |
| `options.installDir` | Target directory to install the binary           | ❌ No    |
| `options.args`       | Additional CLI args passed to the installer      | ❌ No    |
