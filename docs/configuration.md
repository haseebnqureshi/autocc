# Configuration

Complete configuration reference for autocc.

## Config File Location

`~/.config/ccmanager/config.json`

> **Note**: autocc uses the same config location as ccmanager for compatibility.

## Full Configuration Example

```json
{
  "worktree": {
    "autoDirectory": true,
    "autoDirectoryPattern": "../{branch}",
    "copySessionData": false,
    "sortByLastSession": true,
    "defaultBaseBranch": "develop",
    "symlinkEnvFiles": true
  },
  "command": {
    "command": "claude"
  },
  "commandPresets": {
    "presets": [
      {
        "id": "main",
        "name": "Claude",
        "command": "claude",
        "detectionStrategy": "claude"
      }
    ],
    "defaultPresetId": "main"
  },
  "shortcuts": {
    "returnToMenu": {
      "ctrl": true,
      "key": "e"
    },
    "cancel": {
      "key": "escape"
    }
  },
  "statusHooks": {
    "on_busy": {
      "enabled": true,
      "command": "osascript -e 'display notification \"Session busy\" with title \"autocc\"'"
    }
  },
  "worktreeHooks": {
    "post_creation": {
      "enabled": true,
      "command": "echo Created: $CCMANAGER_WORKTREE_BRANCH"
    }
  }
}
```

## Worktree Configuration

### `autoDirectory` (boolean)

Auto-generate worktree paths using pattern.

- **Default**: `true`
- **Example**: `true`

### `autoDirectoryPattern` (string)

Pattern for generating worktree paths. Supports variables:
- `{branch}` - Branch name
- `{project}` - Project name

- **Default**: `"../{branch}"`
- **Example**: `"../.autocc/{branch}"`

> **Note**: autocc automatically places all worktrees in `.autocc/` folder regardless of this pattern.

### `copySessionData` (boolean)

Copy Claude session data to new worktrees.

- **Default**: `false`
- **Recommendation**: Keep `false` for fresh context

### `sortByLastSession` (boolean)

Sort worktrees by most recently used session.

- **Default**: `false`
- **Options**: `true` or `false`

### `defaultBaseBranch` (string)

Default base branch for new worktrees.

- **Default**: `"main"`
- **Common values**: `"main"`, `"develop"`, `"master"`

### `symlinkEnvFiles` (boolean)

Automatically symlink environment files from main worktree.

- **Default**: `true`
- **Symlinked files**: `.env`, `.env.local`, `.env.development`, `.env.production`, `.env.test`

## Command Configuration

### `command.command` (string)

The CLI command to run for Claude Code.

- **Default**: `"claude"`
- **Example**: `"mise exec claude"` (if using mise for version management)

### Command Presets

Define multiple command configurations with fallbacks:

```json
{
  "commandPresets": {
    "presets": [
      {
        "id": "claude-stable",
        "name": "Claude Stable",
        "command": "claude",
        "args": ["--model", "sonnet"],
        "fallbackArgs": [],
        "detectionStrategy": "claude"
      }
    ],
    "defaultPresetId": "claude-stable"
  }
}
```

**Preset Fields:**
- `id` - Unique identifier
- `name` - Display name
- `command` - Command to execute
- `args` - Default arguments
- `fallbackArgs` - Arguments to try if main fails
- `detectionStrategy` - State detection: `claude`, `gemini`, `codex`, etc.

## Keyboard Shortcuts

### Default Shortcuts

| Action | Key |
|--------|-----|
| Return to Menu | `Ctrl+E` |
| Cancel | `Esc` |
| Search | `/` |
| Quick Select | `0-9` |
| Navigate | `↑` `↓` |
| Select | `Enter` |

### Custom Shortcuts

Configure via UI: Press `C` → Configure Shortcuts

Or edit config directly:

```json
{
  "shortcuts": {
    "returnToMenu": {
      "ctrl": true,
      "key": "e"
    },
    "cancel": {
      "key": "escape"
    },
    "quit": {
      "ctrl": true,
      "key": "c"
    }
  }
}
```

**Shortcut Format:**
```json
{
  "key": "string",      // Key name
  "ctrl": boolean,      // Ctrl modifier
  "shift": boolean,     // Shift modifier
  "alt": boolean,       // Alt/Option modifier
  "meta": boolean       // Cmd/Win modifier
}
```

## Lifecycle Hooks

Execute custom commands on events.

### Worktree Hooks

#### `post_creation`

Runs after worktree is created.

```json
{
  "worktreeHooks": {
    "post_creation": {
      "enabled": true,
      "command": "npm install"
    }
  }
}
```

**Available Environment Variables:**
- `CCMANAGER_WORKTREE_PATH` - Path to new worktree
- `CCMANAGER_WORKTREE_BRANCH` - Branch name
- `CCMANAGER_GIT_ROOT` - Git repository root
- `CCMANAGER_BASE_BRANCH` - Base branch used

### Status Hooks

Execute commands when session state changes.

#### `on_busy`
```json
{
  "statusHooks": {
    "on_busy": {
      "enabled": true,
      "command": "osascript -e 'display notification \"Claude is thinking\" with title \"autocc\"'"
    }
  }
}
```

#### `on_waiting`
```json
{
  "statusHooks": {
    "on_waiting": {
      "enabled": true,
      "command": "osascript -e 'display notification \"Input needed\" with title \"autocc\"'"
    }
  }
}
```

#### `on_idle`
```json
{
  "statusHooks": {
    "on_idle": {
      "enabled": true,
      "command": "echo Session idle"
    }
  }
}
```

**Available Environment Variables:**
- `CCMANAGER_WORKTREE_PATH` - Worktree path
- `CCMANAGER_WORKTREE_BRANCH` - Branch name
- `CCMANAGER_GIT_ROOT` - Git root
- `CCMANAGER_OLD_STATE` - Previous state
- `CCMANAGER_NEW_STATE` - New state
- `CCMANAGER_SESSION_ID` - Session ID

## Multi-Project Configuration

### Setup

```bash
export CCMANAGER_MULTI_PROJECT_ROOT="/path/to/your/projects"
autocc --multi-project
```

### Features

- Auto-discovers all git repositories in root directory
- Tracks recently accessed projects
- Shows session counts per project
- Independent worktree management

### Recent Projects Storage

Saved to: `~/.config/ccmanager/recent-projects.json`

## CLI Flags

### `--help`
Show help information.

### `--version`
Show version number.

### `--verbose`
Enable verbose debug logging.

```bash
autocc --verbose
```

Shows:
- Branch resolution
- Git commands
- Claude execution
- Symlink operations

### `--multi-project`
Enable multi-project mode.

```bash
export CCMANAGER_MULTI_PROJECT_ROOT="/projects"
autocc --multi-project
```

### `--devc-up-command` / `--devc-exec-command`
Run sessions in devcontainers.

```bash
autocc --devc-up-command "devcontainer up --workspace-folder ." \
       --devc-exec-command "devcontainer exec --workspace-folder ."
```

Both arguments must be provided together.

## Testing Configuration

### Local Development Setup

Run the automated setup script to test local changes alongside the npm version:

```bash
npm run dev:setup
```

This script:
1. Builds your local code
2. Links both `autocc` and `autocc-local` commands
3. Unlinks `autocc` to make room for npm version
4. Installs npm version as `autocc`

**Result:**
```bash
autocc        # npm published version (what users experience)
autocc-local  # your local development version (your changes)
```

### Manual Setup

If you prefer manual control:

```bash
# 1. Build and link
npm run build
npm link

# 2. Unlink autocc only
npm unlink -g autocc

# 3. Install npm version
npm install -g autocc

# Now you have both versions side-by-side
```

### Testing Published Version Only

```bash
npx autocc@latest  # Run npm version without installing
```

## 🔗 Related Documentation

- **[Getting Started](./getting-started.md)** - Philosophy and quick start
- **[Features](./features.md)** - Complete feature list
- **[Architecture](./architecture.md)** - Technical details
- **[Back to README](../README.md)** - Main page
