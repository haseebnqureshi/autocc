# Getting Started with autocc

## 🚀 Philosophy: Momentum Over Ceremony

**autocc** combines the robust session management of ccmanager with conductor.build's focus on **eliminating friction**. Every decision point, every form field, every context switch is an opportunity to lose momentum.

### The Problem with Traditional Workflows

Creating a new workspace shouldn't require:
- 6 separate decision points
- Mental overhead for branch naming conventions
- Manual environment configuration
- Context switching between terminal and editor

**autocc** transforms workspace creation from a multi-step wizard into **progressive questions** where Claude handles the cognitive overhead.

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
→ Env files automatically symlinked
```

## 🎯 Quick Start

### Installation

```bash
npm install -g autocc
```

### Basic Usage

```bash
# In any git repository
cd your-project
autocc

# You'll see a menu with:
# - Navigation options (N/M/D/C/Q)
# - Sectioned worktrees (Features/Hotfixes/Maintenance/Lab)
# - All worktrees listed

# Press N to create a new worktree
# Answer 3 progressive questions
# autocc handles the rest!
```

### Your First Worktree

1. **Select base branch**: `develop` or `main`
2. **Choose work type**: `feature` (new functionality)
3. **Describe your work**: `add video storage checks`

autocc will:
- Create `.autocc/temp-123...` worktree
- Ask Claude for a proper branch name
- Rename to `feature-video-storage-checks`
- Symlink your `.env` files
- Add work description to `claude.md`
- Return to menu (you start the session when ready)

## 🎨 Work Types

### feature
New functionality and enhancements. Use this for:
- New features
- Major improvements
- API additions

### hotfix
Quick bug fixes and patches. Use this for:
- Bug fixes
- Security patches
- Small corrections

### maintenance
Refactoring and code quality work. Use this for:
- Code refactoring
- Dependency updates
- Performance improvements
- Documentation updates

### lab
Experimental work and prototypes. Use this for:
- Proof of concepts
- Experimental features
- Architecture explorations
- Learning new technologies

## 🎬 How It Works

autocc eliminates cognitive overhead by delegating decisions to Claude:

1. **Progressive Questions**: Answer one at a time - no cognitive overload
2. **Headless Claude**: Runs `claude -p` to analyze your request
3. **Intelligent Naming**: Claude determines optimal branch name
4. **Environment Setup**: Symlinks env files from main worktree
5. **Branch Rename**: Git renames temp branch to final name
6. **Context Injection**: Prepends work description to `claude.md`
7. **Ready to Work**: Return to menu, start session when ready

**Result**: You describe what you want to build. Everything else is automated.

## 🔗 Next Steps

- **[Features Documentation](./features.md)** - Complete feature list
- **[Configuration Guide](./configuration.md)** - All config options
- **[Architecture](./architecture.md)** - Technical details for contributors
- **[Back to README](../README.md)** - Main page
