# Architecture

Technical architecture and development guidelines for autocc.

## Project Structure

```
autocc/
├── docs/                    # Documentation
├── src/
│   ├── cli.tsx             # Entry point with CLI argument parsing
│   ├── components/         # React/Ink UI components
│   ├── constants/          # Shared constants
│   ├── hooks/              # React hooks
│   ├── services/           # Business logic
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utility functions
├── package.json
├── tsconfig.json
├── eslint.config.js
├── vitest.config.ts
└── CLAUDE.md               # Comprehensive development guide
```

## Tech Stack

- **ink** - React for CLI apps
- **Effect-ts** - Type-safe error handling
- **node-pty** - PTY for interactive sessions
- **vitest** - Modern testing framework
- **TypeScript** - Type safety

## Key Architectural Decisions

### Effect-ts for Error Handling

All service methods return `Effect<T, E, never>` for type-safe, composable error handling.

**Example:**
```typescript
getWorktreesEffect(): Effect.Effect<Worktree[], GitError, never>
```

**Benefits:**
- Errors explicit in function signatures
- Better composition and recovery strategies
- Type-safe error discrimination via `_tag`

See [CLAUDE.md](../CLAUDE.md) for complete Effect-ts patterns and examples.

### Progressive Question UX

Worktree creation uses progressive disclosure:
1. Show one question at a time
2. Display previous answers as breadcrumbs
3. Minimize cognitive load

### State Detection Strategy Pattern

Supports multiple CLI tools (Claude, Gemini, etc.) via strategy pattern:
- `ClaudeStateDetector` - Detects Claude Code states
- `GeminiStateDetector` - Detects Gemini CLI states
- Extensible for other tools

### Session Management

- Each worktree maintains own Claude Code process
- Processes managed via `node-pty` for full terminal emulation
- State tracked with sophisticated prompt detection
- Automatic cleanup on exit

## Development Guidelines

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test path/to/file.test.ts  # Specific test
```

### Building

```bash
npm run build              # Compile TypeScript
npm run dev                # Watch mode for development
```

### Linting

```bash
npm run lint               # Check linting
npm run lint:fix           # Auto-fix issues
npm run typecheck          # TypeScript type checking
```

### Local Testing

```bash
npm link                   # Creates autocc and autocc-local commands
autocc-local              # Test your local changes
autocc                     # Test npm published version
```

## Adding New Features

### 1. Add Type Definitions

Start with TypeScript types in `src/types/index.ts`.

### 2. Implement Service Layer

Business logic goes in `src/services/` using Effect-ts patterns.

### 3. Create UI Components

React/Ink components in `src/components/`.

### 4. Write Tests

Add tests alongside implementation files (`.test.ts` or `.test.tsx`).

### 5. Update Documentation

Update relevant docs in `docs/` folder.

## Effect-ts Resources

For detailed Effect-ts patterns used in autocc:

- **Full patterns and examples**: See [CLAUDE.md](../CLAUDE.md)
- **Effect-ts Documentation**: https://effect.website/docs/introduction
- **Error Management**: https://effect.website/docs/error-management/error-handling
- **Effect Execution**: https://effect.website/docs/guides/running-effects

## Component Architecture

### App Component

Main container that manages view routing and application state.

**Views:**
- `menu` - Main worktree list
- `new-worktree` - Progressive creation flow
- `creating-worktree` - Loading state
- `naming-worktree` - Claude naming in progress
- `session` - Interactive Claude Code session
- `delete-worktree` - Deletion confirmation
- `configuration` - Settings UI

### Menu Component

Displays sectioned worktree list with navigation.

**Features:**
- Work type sections (Features/Hotfixes/Maintenance/Lab)
- Fixed navigation at top
- Git status polling
- Search functionality
- Quick select (0-9)

### Session Component

Full terminal emulation for Claude Code sessions.

**Features:**
- PTY rendering with ANSI colors
- State detection (idle/busy/waiting)
- Scrollback support
- Keyboard input handling

## Testing Strategy

### Unit Tests

Test individual functions and utilities:
- `src/utils/*.test.ts`
- Focus on pure functions
- Effect-ts return values

### Integration Tests

Test service interactions:
- `src/services/*.test.ts`
- Mock external dependencies
- Test Effect execution

### Component Tests

Test UI rendering:
- `src/components/*.test.tsx`
- Use `ink-testing-library`
- Mock child components

## Common Development Tasks

### Adding a New Work Type

1. Add to `WorkType` in `src/types/index.ts`
2. Add to `WORK_TYPES` array in `src/components/NewWorktree.tsx`
3. Update validation regex in `src/services/worktreeService.ts`
4. Update tests

### Adding a New CLI Flag

1. Add to `meow` flags in `src/cli.tsx`
2. Pass to App component if needed
3. Update help text
4. Update docs

### Adding a New Hook Type

1. Add to hook config types in `src/types/index.ts`
2. Implement executor in `src/utils/hookExecutor.ts`
3. Wire up in service layer
4. Add configuration UI component
5. Update docs

## Contributing

See [CLAUDE.md](../CLAUDE.md) for comprehensive development guidelines including:
- Effect-ts usage patterns
- Component structure
- Error handling strategies
- Testing best practices

## 🔗 Related Documentation

- **[Getting Started](./getting-started.md)** - Philosophy and quick start
- **[Features](./features.md)** - Complete feature list
- **[Configuration](./configuration.md)** - All config options
- **[CLAUDE.md](../CLAUDE.md)** - Comprehensive development guide
- **[Back to README](../README.md)** - Main page
