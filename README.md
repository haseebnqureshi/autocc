# autocc

> **Stay in flow.** AI-powered workspace creation that eliminates context switching and decision fatigue.

Forked from [ccmanager](https://github.com/kbwo/ccmanager) by Kodai Kabasawa • Inspired by [conductor.build](https://conductor.build)

## 📦 Installation

```bash
npm install -g autocc
```

## ⚡ Quick Start

```bash
cd your-git-repo
autocc
```

Press `N` to create a new worktree, answer 3 progressive questions:
1. **Base branch**: develop
2. **Work type**: feature/hotfix/maintenance/lab
3. **Description**: add video storage checks

autocc creates `.autocc/feature-video-storage-checks` and you're ready to work!

## ✨ Key Features

- **🤖 AI Branch Naming** - Claude suggests semantic branch names from your description
- **📁 Smart Organization** - All worktrees in `.autocc/` folder, auto-updates `.gitignore`
- **🔗 Auto Env Symlinking** - `.env` files automatically symlinked from main worktree
- **📝 Context Injection** - Work description prepended to `claude.md` for Claude
- **🎨 Sectioned Menu** - Organized by type (Features/Hotfixes/Maintenance/Lab)
- **🏷️ Visual Indicators** - `[new]` badges, session states, git status
- **⚡ Progressive Questions** - One question at a time, no cognitive overload
- **🔊 Verbose Mode** - Debug with `--verbose` flag

## 🗺️ Roadmap

### Near Term
- **🔀 Claude-Powered Merging** - AI resolves merge conflicts intelligently
- **🎯 Planning Mode Indicator** - Visual indicator for worktrees in Claude planning mode
- **📊 Project Summary Dashboard** - Overview of all work in progress across worktrees
- **🏷️ Custom Worktree Types** - Define your own types beyond feature/hotfix/maintenance/lab
- **🔔 Background Notifications** - Optional desktop notifications for session state changes

### Future
- **💎 Premium Tier** - Internal development tools + knowledge base management
  - Team knowledge base creation and curation
  - API for integration with external platforms
  - Advanced analytics and insights
  - Priority support

## 📚 Documentation

- **[Getting Started](./docs/getting-started.md)** - Philosophy, workflow comparison, quick start guide
- **[Features](./docs/features.md)** - Complete feature documentation with examples
- **[Configuration](./docs/configuration.md)** - All configuration options and customization
- **[Architecture](./docs/architecture.md)** - Technical details for contributors
- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive development guide with Effect-ts patterns

## 🎨 Work Types

| Type | Purpose | Example |
|------|---------|---------|
| **feature** | New functionality | `feature-video-storage-checks` |
| **hotfix** | Quick bug fixes | `hotfix-auth-token-expire` |
| **maintenance** | Refactoring & improvements | `maintenance-collab-refactor` |
| **lab** | Experimental work | `lab-new-architecture` |

## 🔧 Configuration

Create `~/.config/ccmanager/config.json`:

```json
{
  "worktree": {
    "defaultBaseBranch": "develop",
    "symlinkEnvFiles": true
  }
}
```

See [Configuration Guide](./docs/configuration.md) for all options.

## 🙏 Credits

- **[ccmanager](https://github.com/kbwo/ccmanager)** by [Kodai Kabasawa](https://github.com/kbwo) - Foundation for session management
- **[conductor.build](https://conductor.build)** - Inspiration for momentum-focused design

## 📄 License

MIT

## 🔗 Links

- **GitHub**: https://github.com/haseebnqureshi/autocc
- **npm**: https://www.npmjs.com/package/autocc
- **Issues**: https://github.com/haseebnqureshi/autocc/issues
