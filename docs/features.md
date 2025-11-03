# Features

Complete feature documentation for autocc.

## Core Features

### 🎯 AI-Powered Branch Naming

Claude analyzes your work description and generates semantic branch names that follow conventions.

**How it works:**
- You describe: "add video storage checks"
- Claude suggests: `feature-video-storage-checks`
- autocc validates format and checks for duplicates
- Auto-appends `-2`, `-3` if name already exists

**Benefits:**
- Zero mental overhead for naming
- Consistent conventions across team
- Semantic, descriptive names

### 📁 Smart Worktree Organization

All worktrees live in `.autocc/` folder for clean repository structure.

**Structure:**
```
your-repo/
├── .git/
├── .autocc/              ← All worktrees here
│   ├── feature-new-api/
│   ├── hotfix-auth-fix/
│   └── maintenance-refactor/
├── src/
└── package.json
```

**Features:**
- Auto-creates `.autocc/` on first use
- Updates `.gitignore` automatically
- Folders renamed to match branch names
- Clean separation from main codebase

### 🔗 Environment File Symlinking

Automatically symlinks environment files from main worktree to new worktrees.

**Symlinked files:**
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.test`

**Benefits:**
- Consistent config across worktrees
- No manual copying
- Changes in main propagate to all worktrees
- Can be disabled via config

### 📝 Automatic Context Injection

Prepends work description to `claude.md` so Claude knows your intent.

**Example:**
```markdown
> Worktree for **feature** work: add video storage checks

[existing claude.md content preserved]
```

**Benefits:**
- Claude sees work context immediately
- Minimal and non-intrusive
- Preserves existing documentation

### 🏷️ Visual Indicators

#### Session States
- `● Busy` - Claude is processing
- `◐ Waiting` - Waiting for user input
- `○ Idle` - Ready for input

#### Worktree Badges
- `[new]` (blue) - Created within last 5 minutes
- `[git error]` (red) - Git status fetch failed
- `(main)` - Main worktree indicator

### 📊 Sectioned Menu

Worktrees organized by type with fixed navigation at top:

```
autocc - Claude Code Worktree Manager

N ⊕ New Worktree
M ⇄ Merge Worktree
D ✕ Delete Worktree
C ⌨ Configuration
Q ⏻ Exit
──────────────────────────

Features
  0 ❯ feature-video-storage [new]
  1 ❯ feature-auth-flow

Hotfixes
  2 ❯ hotfix-token-expire

Maintenance
  3 ❯ maintenance-refactor-api

Lab
  4 ❯ lab-experimental-ui

All Worktrees
  (complete list of all worktrees)
```

### 🎨 Progressive Questions

Three-step worktree creation with breadcrumb navigation:

**Step 1: Base Branch**
```
Create New Worktree

Select base branch:
❯ develop (default)
  main
  feature/experimental
```

**Step 2: Work Type**
```
Create New Worktree

Base branch: develop

What type of work are you doing?
❯ Feature - New functionality
  Hotfix - Minor bug fix
  Maintenance - Refactoring or maintenance work
  Lab - Experimental work
```

**Step 3: Description**
```
Create New Worktree

Base branch: develop
Work type: feature

What are you looking to do?
> add video storage checks
```

## Advanced Features

### 🔀 Git Worktree Management

- **Create**: New worktrees with temp branches
- **Delete**: Remove worktrees and optionally delete branches
- **Merge**: Merge worktree branches back to main
- **List**: View all worktrees with status

### 🔍 Git Status Visualization

Real-time git status for each worktree:
- File changes (`+3 -1`)
- Ahead/behind commits (`↑2 ↓1`)
- Parent branch tracking
- Auto-refresh every 5 seconds

### ⌨️ Customizable Shortcuts

Configure keyboard shortcuts via UI or config file:
- Default: `Esc` to cancel, `Ctrl+E` to return to menu
- Customize any action
- Visual shortcut configurator

### 🔍 Vi-Style Search

Press `/` to search worktrees and projects:
- Real-time filtering
- Searches branch names and paths
- Press `Esc` to cancel, `Enter` to apply filter

### 🎮 Quick Select

Number shortcuts for rapid navigation:
- `0-9` to instantly select worktrees
- Works with sectioned menu
- Disabled during search mode

### 🐳 Devcontainer Integration

Run Claude Code sessions inside devcontainers:

```bash
autocc --devc-up-command "devcontainer up --workspace-folder ." \
       --devc-exec-command "devcontainer exec --workspace-folder ."
```

- Full command flexibility
- Works with any container tool
- Host-level management

### 🗂️ Multi-Project Mode

Manage multiple git repositories from one interface:

```bash
export CCMANAGER_MULTI_PROJECT_ROOT="/path/to/projects"
autocc --multi-project
```

**Features:**
- Auto-discovers git repos recursively
- Recent projects tracking
- Session counts per project
- Independent worktree management per project

### 🪝 Lifecycle Hooks

Execute custom commands on events:

**Worktree Hooks:**
- `post_creation` - After worktree created

**Status Hooks:**
- `on_busy` - Session becomes busy
- `on_waiting` - Session waiting for input
- `on_idle` - Session becomes idle

**Environment Variables Available:**
- `CCMANAGER_WORKTREE_PATH`
- `CCMANAGER_WORKTREE_BRANCH`
- `CCMANAGER_GIT_ROOT`
- `CCMANAGER_SESSION_ID`
- `CCMANAGER_OLD_STATE` / `CCMANAGER_NEW_STATE`

### 🎛️ Command Presets

Configure multiple Claude Code commands with fallbacks:

```json
{
  "commandPresets": {
    "presets": [
      {
        "id": "main",
        "name": "Claude (Latest)",
        "command": "claude",
        "detectionStrategy": "claude"
      },
      {
        "id": "gemini",
        "name": "Gemini CLI",
        "command": "gemini",
        "fallbackArgs": ["--legacy"],
        "detectionStrategy": "gemini"
      }
    ],
    "defaultPresetId": "main"
  }
}
```

## Utility Features

### 🔊 Verbose Logging

Debug mode for troubleshooting:

```bash
autocc --verbose
```

Shows:
- Branch resolution details
- Git commands executed
- Claude execution progress
- Symlink operations
- Folder movements

### 🔄 Update Checker

Automatically checks for new versions on startup:
```
⚠ Update available: autocc@1.5.0 (you have 1.4.1)
  Run: npm install -g autocc to update
```

- Non-blocking with 3-second timeout
- Shows yellow warning if outdated
- Silently fails if offline

### 🎨 Claude-Native Styling

Interface uses Claude's brand color (`rgb(232, 123, 53)`) for:
- Section headers
- Title text
- Active elements

Creates a cohesive experience within the Claude ecosystem.

## Work Types in Detail

### Feature
**Purpose**: New functionality and enhancements

**Examples:**
- `feature-video-storage-checks`
- `feature-realtime-collab`
- `feature-api-versioning`

**When to use:**
- Adding new capabilities
- Building new modules
- Implementing user-facing features

### Hotfix
**Purpose**: Quick bug fixes and patches

**Examples:**
- `hotfix-auth-token-expire`
- `hotfix-memory-leak`
- `hotfix-cors-headers`

**When to use:**
- Urgent production bugs
- Security patches
- Critical fixes that can't wait for regular release cycle

### Maintenance
**Purpose**: Code quality and refactoring

**Examples:**
- `maintenance-collab-engine-refactor`
- `maintenance-update-deps`
- `maintenance-improve-types`

**When to use:**
- Refactoring existing code
- Dependency updates
- Performance improvements
- Documentation improvements
- Technical debt reduction

### Lab
**Purpose**: Experimental and exploratory work

**Examples:**
- `lab-graphql-migration`
- `lab-new-architecture`
- `lab-performance-test`

**When to use:**
- Proof of concepts
- Architecture explorations
- Learning new technologies
- Experiments that might not make it to production

## 🔗 Related Documentation

- **[Configuration Guide](./configuration.md)** - All config options
- **[Architecture](./architecture.md)** - Technical details
- **[Back to README](../README.md)** - Main page
