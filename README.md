# autocc - Automated Claude Code Workspace Manager

> **Stay in flow.** AI-powered workspace creation that eliminates context switching and decision fatigue.

Built on [ccmanager](https://github.com/kbwo/ccmanager) by Kodai Kabasawa, with inspiration from [conductor.build](https://conductor.build)'s philosophy of coding momentum and reduced cognitive overhead.

## 🚀 Philosophy: Momentum Over Ceremony

**autocc** combines the robust session management of ccmanager with conductor.build's focus on **eliminating friction**. Every decision point, every form field, every context switch is an opportunity to lose momentum.

### The Problem with Traditional Workflows

Creating a new workspace shouldn't require:
- 6 separate decision points
- Mental overhead for branch naming conventions
- Manual environment configuration
- Context switching between terminal and editor

**autocc** transforms workspace creation from a 6-step wizard into a **single unified form** where Claude handles the cognitive overhead.

### Workflow Comparison

**Before (ccmanager - 6 steps):**
1. Enter worktree path
2. Select base branch
3. Choose branch strategy
4. Enter branch name
5. Copy .claude settings?
6. Copy session data?

**After (autocc - Progressive questions):**
```
Select base branch: develop
What type of work? feature/hotfix/maintenance/lab
What are you looking to do? add video storage checks

⠋ Creating worktree...
⠋ Checking with Claude on an effective branch name for your feature work...
✓ Worktree created: feature-video-storage-checks

→ Returns to menu, ready when you are
→ All worktrees organized in .autocc/ folder
→ .gitignore automatically updated
```

## ✨ Key Features

### Momentum-Focused Design
- **🎯 Progressive Questions**: Answer one question at a time - no cognitive overload
- **🤖 AI Branch Naming**: Claude determines optimal branch names - zero mental overhead
- **📁 Auto Organization**: All worktrees in `.autocc/` folder - keeps repos clean
- **🔧 Auto .gitignore**: Automatically adds `.autocc/` to your .gitignore
- **🎨 Smart Naming**: Both branch AND folder renamed to match Claude's suggestion

### Organization Without Overhead
- **📋 Work Type Categories**: feature/hotfix/maintenance/lab for better organization
- **🎨 Fresh Context**: Each workspace starts with clean Claude history
- **🔄 Seamless Navigation**: Switch between worktrees without losing momentum
- **📂 `.autocc/` Directory**: All worktrees organized in one folder per repository

## 📦 Installation

```bash
npm install -g autocc
```

## 🎯 Quick Start

```bash
# In any git repository
autocc

# Select "Create New Worktree"
# Fill the unified form:
#   1. Base branch: main
#   2. Work type: feature
#   3. Description: "add video storage checks"
# Press Enter

# autocc automatically:
#   ✓ Creates worktree with temp branch
#   ✓ Runs Claude in headless mode to determine branch name
#   ✓ Renames to: feature-video-storage-checks
#   ✓ Analyzes main repo and symlinks config files
#   ✓ Starts interactive Claude Code session
#   ✓ You're ready to work!
```

## ⚙️ Configuration

Create `~/.config/ccmanager/config.json`:

```json
{
  "worktree": {
    "defaultBaseBranch": "main",
    "autoDirectory": true,
    "autoDirectoryPattern": "../{branch}"
  }
}
```

### Config Options

- **`defaultBaseBranch`**: Default base for new worktrees (e.g., "main", "develop")
- **`autoDirectory`**: Auto-generate worktree paths
- **`autoDirectoryPattern`**: Path pattern (supports `{branch}`, `{project}`)

## 🎨 Work Types

- **feature**: New functionality (full-featured development)
- **hotfix**: Minor bug fixes and quick patches
- **lab**: Experimental work (keeps scope separate)

### Branch Naming Convention

Format: `{type}-{1-3-words}`

Examples:
- ✅ `feature-video-storage-checks`
- ✅ `hotfix-user-permissions-fix`
- ✅ `lab-collaboration-mobile`
- ❌ `feature-add-new-video-storage-system-with-checks` (too long)

## 🔧 All ccmanager Features Included

autocc preserves all the powerful features from the original ccmanager:

- ✅ Multiple Claude Code sessions across worktrees
- ✅ Real-time session state tracking (idle/busy/waiting)
- ✅ Git status visualization with ahead/behind indicators
- ✅ Customizable keyboard shortcuts
- ✅ Multi-project support
- ✅ Devcontainer integration
- ✅ Command presets with fallback support
- ✅ Status change hooks for automation

## 🎬 How It Works

autocc eliminates cognitive overhead by delegating decisions to Claude:

1. **Unified Form**: One screen with base branch, work type, and description
2. **Headless Claude**: Runs Claude with `-p` flag to analyze your request
3. **Intelligent Naming**: Claude determines optimal branch name following conventions
4. **Environment Analysis**: Identifies config files to symlink (.env, etc.)
5. **Branch Rename**: Git renames temp branch to final name
6. **Verification**: Confirms branch was renamed correctly
7. **Interactive Session**: Launches full Claude Code session

**Result**: You describe what you want to build. Everything else is automated.

## 📚 Original Features

For detailed documentation on session management, worktree operations, and advanced features, see the [original ccmanager documentation](https://github.com/kbwo/ccmanager).

## 🙏 Credits & Inspiration

**Built on the shoulders of giants:**

- **[ccmanager](https://github.com/kbwo/ccmanager)** by [Kodai Kabasawa](https://github.com/kbwo) - Solid foundation for session management and worktree operations
- **[conductor.build](https://conductor.build)** - Inspiration for momentum-focused design and eliminating cognitive overhead

autocc incorporates the best parts of ccmanager's robust architecture while embracing conductor.build's philosophy of staying in flow.

## 🤝 Contributing

This project focuses on coding momentum and reduced friction. If you've found workflow improvements that eliminate decision points or context switching, contributions are welcome!

For bugs or feature requests, please [open an issue](https://github.com/haseebnqureshi/autocc/issues).

## 📄 License

MIT (same as ccmanager)

## 🔗 Links

- **GitHub Repository**: https://github.com/haseebnqureshi/autocc
- **Issues & Feature Requests**: https://github.com/haseebnqureshi/autocc/issues
- **NPM Package**: https://www.npmjs.com/package/autocc
- **Original ccmanager**: https://github.com/kbwo/ccmanager
- **Conductor.build**: https://conductor.build
