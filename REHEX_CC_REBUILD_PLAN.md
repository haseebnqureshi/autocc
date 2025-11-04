# Rehex-CC Rebuild Plan: From AutoCC to Clean IP Platform

**Status**: Planning
**Timeline**: 2 Months (8 Weeks)
**Objective**: Build rehex-cc from scratch as a clean, commercial-ready codebase for the Rehex AI-Native Teams platform

---

## Executive Summary

### The Decision: Rebuild vs. Fork

**Why Rebuild?**
1. **Clean IP Ownership**: Critical for business/investor narrative - need 100% ownership story
2. **Commercial Product**: Rehex-cc is open-source foundation for paid Rehex platform services
3. **Platform Architecture**: Purpose-built for multi-user, team collaboration from day 1
4. **No Attribution Baggage**: MIT license allows us to use patterns, but fresh codebase = clean story

**What We're Keeping from AutoCC:**
- Proven patterns (~250 lines of PTY/state detection logic) - 2% reference
- Your innovations (AI features, UX) - 100% portable

**What We're Building Fresh:**
- All architecture (Effect-ts from start)
- All components
- Rehex platform integrations
- Team/multi-user features
- 98% original work

---

## AutoCC Retrospective: What We Learned

### Innovations Worth Porting (100% Ours)
1. **Headless Claude Mode** (~200 lines) - Game changer for AI branch naming
2. **AI-Powered Branch Naming** (~300 lines) - Killer feature, completely original
3. **Progressive Worktree Creation UX** (~310 lines) - Superior user experience
4. **Smart Organization** (.autocc/, base branch prefixes) (~100 lines)
5. **Environment File Symlinking** (~50 lines) - Practical automation
6. **Claude.md Context Injection** (~50 lines) - Simple but powerful
7. **Work Type System** (feature/hotfix/maintenance/lab) (~150 lines)
8. **Sectioned Menu with Visual Indicators** (~200 lines)
9. **Effect-ts Error Handling** (~2,000 lines touched) - Solid architectural choice

**Total AutoCC Innovations**: ~3,400 lines of unique value

### Patterns Worth Referencing (From Ecosystem)
1. **PTY Process Lifecycle** (~100 lines of patterns)
   - Spawn with fallback on exit code 1
   - Output history buffer management (10MB max)
   - Process replacement without session recreation

2. **State Detection with Persistence** (~150 lines of patterns)
   - Persistence duration: 2000ms before confirming state change
   - Check interval: 500ms for responsiveness
   - Regex patterns: `ESC to interrupt` (busy), `│ Do you want` (waiting)

**Total Borrowed Patterns**: ~250 lines (2% of future codebase)

---

## Architecture: Rehex-CC Vision

### Core Principles

1. **Effect-ts First**: No legacy try-catch patterns - Effect from day 1
2. **Team-Oriented**: Multi-user session orchestration built in
3. **Platform-Ready**: Designed for Rehex Command Center integration
4. **Modern Stack**: Latest libraries, TypeScript 5.x, Vitest, ESM
5. **Clean Separation**: Core session management vs. Rehex platform features

### Technology Stack

**Runtime & Build**
- Node.js 20+ (LTS)
- TypeScript 5.x
- ESM modules (pure)
- Vitest for testing

**Core Dependencies**
- `node-pty@^1.0.0` - PTY spawning (industry standard)
- `@xterm/headless@^5.5.0` - Terminal emulation (standard)
- `ink@^5.1.3` - React for CLI
- `effect@^3.x` - Error handling, async composition
- `react@^18.x` - UI library

**Git Operations**
- Direct `git` CLI calls (no abstraction layer initially)
- Effect-wrapped for error handling

**Platform Integration** (Future)
- `@rehex/api-client` - Rehex platform APIs
- `@rehex/auth` - Multi-user authentication
- WebSocket client for real-time updates

### Project Structure

```
rehex-cc/
├── src/
│   ├── core/                    # Core session management
│   │   ├── session/             # Session lifecycle
│   │   │   ├── sessionManager.ts
│   │   │   ├── sessionOrchestrator.ts
│   │   │   └── sessionTypes.ts
│   │   ├── pty/                 # PTY process handling
│   │   │   ├── ptySpawner.ts
│   │   │   ├── processLifecycle.ts
│   │   │   └── outputBuffer.ts
│   │   ├── state/               # State detection
│   │   │   ├── stateDetector.ts
│   │   │   ├── patterns.ts
│   │   │   └── persistence.ts
│   │   └── effects/             # Effect utilities
│   │       ├── errors.ts
│   │       └── utils.ts
│   ├── features/                # Rehex-CC features
│   │   ├── ai/                  # AI-powered features
│   │   │   ├── headlessMode.ts
│   │   │   ├── branchNaming.ts
│   │   │   └── contextInjection.ts
│   │   ├── worktree/            # Git worktree operations
│   │   │   ├── worktreeService.ts
│   │   │   ├── organization.ts
│   │   │   └── environment.ts
│   │   ├── workflow/            # User workflows
│   │   │   ├── progressiveCreate.ts
│   │   │   └── workTypes.ts
│   │   └── ui/                  # UI components
│   │       ├── Menu.tsx
│   │       ├── Session.tsx
│   │       ├── NewWorktree.tsx
│   │       └── components/
│   ├── platform/                # Rehex platform integration
│   │   ├── teams/               # Multi-user features
│   │   ├── command-center/      # CEO Command Center
│   │   └── collaboration/       # Team collaboration
│   ├── cli.tsx                  # Entry point
│   └── config/                  # Configuration
├── docs/                        # Documentation
├── tests/                       # Test suites
└── package.json
```

---

## 2-Month Implementation Timeline

### Week 1-2: Foundation & Core Infrastructure

**Goals**: Clean repository, core PTY/session management, Effect-ts patterns

**Tasks**:

1. **Repository Setup** (Day 1-2)
   - [ ] Create `rehex-cc` repository
   - [ ] Initialize with TypeScript, Vitest, ESLint (modern flat config)
   - [ ] Set up package.json with core dependencies
   - [ ] Configure tsconfig.json (strict mode, ESM)
   - [ ] Set up CI/CD (GitHub Actions)

2. **Effect-ts Foundation** (Day 3-4)
   - [ ] Create error types (GitError, PtyError, ConfigError, etc.)
   - [ ] Create Effect utilities (retries, timeouts, etc.)
   - [ ] Set up Effect-based testing patterns
   - [ ] Document Effect patterns for team

3. **PTY Infrastructure** (Day 5-7)
   - [ ] Implement `PtySpawner` with Effect
   - [ ] Implement process lifecycle (spawn → data → exit → cleanup)
   - [ ] Implement output buffer with 10MB max
   - [ ] Add fallback command handling (exit code 1)
   - [ ] Test with multiple Claude sessions

4. **State Detection** (Day 8-10)
   - [ ] Implement state detector with persistence (2000ms)
   - [ ] Add regex patterns (idle, busy, waiting_input)
   - [ ] Implement 500ms check interval
   - [ ] Test state transitions
   - [ ] Add verbose logging for debugging

5. **Session Manager** (Day 11-14)
   - [ ] Implement SessionManager with Effect
   - [ ] Add session CRUD operations
   - [ ] Implement EventEmitter for session events
   - [ ] Add session persistence/recovery
   - [ ] Write comprehensive tests

**Deliverables**:
- ✅ Working PTY spawning with state detection
- ✅ Session manager with Effect-based error handling
- ✅ 80%+ test coverage on core

---

### Week 3-4: AutoCC Features Migration

**Goals**: Port all AutoCC innovations with improvements

**Tasks**:

1. **Headless Claude Mode** (Day 15-16)
   - [ ] Port `runHeadlessModeEffect()`
   - [ ] Add 60-second timeout
   - [ ] Improve stdout/stderr capture
   - [ ] Add prompt templates system
   - [ ] Test with various prompts

2. **AI Branch Naming** (Day 17-19)
   - [ ] Port `setupWorktreeWithClaudeEffect()`
   - [ ] Improve JSON parsing (more robust)
   - [ ] Add branch name validation
   - [ ] Handle duplicate names with counters
   - [ ] Add branch name customization options

3. **Git Worktree Operations** (Day 20-22)
   - [ ] Implement worktree service with Effect
   - [ ] Add list/add/remove operations
   - [ ] Implement parent branch tracking (git config)
   - [ ] Add remote branch resolution
   - [ ] Test edge cases (nested repos, submodules)

4. **Smart Organization** (Day 23-24)
   - [ ] Implement `.autocc/` directory creation
   - [ ] Auto-update `.gitignore`
   - [ ] Implement base branch prefixed directories
   - [ ] Add configurable directory patterns
   - [ ] Test with various git setups

5. **Environment & Context** (Day 25-26)
   - [ ] Port env file symlinking
   - [ ] Port claude.md context injection
   - [ ] Add `.autocc-new` marker for badges
   - [ ] Test symlink edge cases

6. **Progressive UX** (Day 27-28)
   - [ ] Port NewWorktree component
   - [ ] Implement three-step flow (base → type → description)
   - [ ] Add breadcrumb UI
   - [ ] Improve loading states
   - [ ] Add work type system (feature/hotfix/maintenance/lab)

**Deliverables**:
- ✅ All AutoCC features ported and improved
- ✅ Better error handling with Effect
- ✅ Improved UX and performance

---

### Week 5-6: Rehex Platform Integration

**Goals**: Multi-user features, team collaboration, platform APIs

**Tasks**:

1. **Multi-User Session Orchestration** (Day 29-31)
   - [ ] Design multi-user session architecture
   - [ ] Implement session sharing (read-only viewing)
   - [ ] Add session locking/ownership
   - [ ] Implement session hand-off
   - [ ] Add user presence indicators

2. **Team Collaboration Features** (Day 32-34)
   - [ ] Implement team worktree management
   - [ ] Add shared worktree policies
   - [ ] Implement PR creation workflow
   - [ ] Add code review integration
   - [ ] Real-time session updates (WebSocket)

3. **CEO Command Center Integration** (Day 35-37)
   - [ ] Design Command Center API integration
   - [ ] Implement task assignment → worktree creation
   - [ ] Add progress reporting
   - [ ] Implement analytics/metrics collection
   - [ ] Add session insights dashboard

4. **Platform APIs** (Day 38-40)
   - [ ] Create `@rehex/api-client` integration
   - [ ] Implement authentication flow
   - [ ] Add user/team management
   - [ ] Implement settings sync
   - [ ] Add telemetry (opt-in)

5. **Enhanced UI for Teams** (Day 41-42)
   - [ ] Add team member indicators
   - [ ] Improve session list with team context
   - [ ] Add collaborative features UI
   - [ ] Implement notifications
   - [ ] Test with mock team data

**Deliverables**:
- ✅ Multi-user session support
- ✅ Rehex platform integration working
- ✅ Team collaboration features

---

### Week 7-8: Polish, Testing & Documentation

**Goals**: Production-ready quality, comprehensive docs, beta release

**Tasks**:

1. **Comprehensive Testing** (Day 43-46)
   - [ ] Increase coverage to 90%+
   - [ ] Add integration tests (E2E)
   - [ ] Add performance benchmarks
   - [ ] Test on Windows, macOS, Linux
   - [ ] Load testing (100+ concurrent sessions)

2. **Documentation** (Day 47-49)
   - [ ] Write comprehensive README
   - [ ] Create architecture docs
   - [ ] Write API documentation
   - [ ] Create contribution guide
   - [ ] Write migration guide (AutoCC → Rehex-CC)

3. **Performance Optimization** (Day 50-51)
   - [ ] Profile session creation speed
   - [ ] Optimize state detection overhead
   - [ ] Reduce memory footprint
   - [ ] Optimize git operations
   - [ ] Add performance monitoring

4. **Bug Fixes & Edge Cases** (Day 52-54)
   - [ ] Fix any discovered bugs
   - [ ] Handle edge cases (large repos, slow networks)
   - [ ] Improve error messages
   - [ ] Add recovery mechanisms
   - [ ] Security audit

5. **Beta Release Prep** (Day 55-56)
   - [ ] Create release checklist
   - [ ] Prepare changelog
   - [ ] Set up beta user feedback system
   - [ ] Create demo videos
   - [ ] Launch beta program

**Deliverables**:
- ✅ Production-ready codebase
- ✅ 90%+ test coverage
- ✅ Comprehensive documentation
- ✅ Beta release ready

---

## Success Metrics

### Technical Metrics
- **Test Coverage**: 90%+ across core, features, platform
- **Performance**: Session creation < 2 seconds
- **Memory**: < 100MB per session
- **Stability**: < 1% crash rate in beta

### Business Metrics
- **Clean IP**: 98% original code, 2% referenced patterns
- **Investor Story**: "Built from scratch using industry standards"
- **Platform Ready**: Multi-user features working
- **Beta Adoption**: 50+ developers testing

---

## Risk Mitigation

### Technical Risks

**Risk**: PTY handling bugs during rebuild
- **Mitigation**: Keep AutoCC running in parallel, extensive testing, reference proven patterns
- **Impact**: Medium | **Likelihood**: Medium | **Owner**: Engineering

**Risk**: State detection less reliable than AutoCC
- **Mitigation**: Port proven regex patterns, add more persistence, verbose logging
- **Impact**: High | **Likelihood**: Low | **Owner**: Engineering

**Risk**: Effect-ts learning curve slows development
- **Mitigation**: Document patterns early, pair programming, code reviews
- **Impact**: Low | **Likelihood**: Low | **Owner**: Engineering

**Risk**: Platform integration delays
- **Mitigation**: Mock APIs early, incremental integration, parallel development
- **Impact**: Medium | **Likelihood**: Medium | **Owner**: Product

### Business Risks

**Risk**: 2-month timeline slips
- **Mitigation**: Weekly checkpoints, adjust scope if needed, prioritize core features
- **Impact**: Medium | **Likelihood**: Medium | **Owner**: PM

**Risk**: AutoCC users expect migration path
- **Mitigation**: Maintain AutoCC for 6 months, create migration guide, offer support
- **Impact**: Low | **Likelihood**: High | **Owner**: Product

**Risk**: Rehex platform not ready for integration
- **Mitigation**: Mock platform APIs, design for loose coupling, independent value
- **Impact**: Low | **Likelihood**: Medium | **Owner**: Platform Team

---

## Resources & Team

### Required Skills
- TypeScript/Node.js expertise
- PTY/terminal experience (or willingness to learn)
- Effect-ts knowledge (or strong FP background)
- Git internals understanding
- React/Ink UI development

### Recommended Team Size
- **Solo (Aggressive)**: 2 months full-time
- **Pair (Recommended)**: 6 weeks with parallel development
- **Team of 3 (Ideal)**: 4 weeks with specialized roles
  - Core engineer (PTY, sessions)
  - Features engineer (AI, UX)
  - Platform engineer (Rehex integration)

### External Dependencies
- Rehex platform team (APIs, authentication)
- Beta users (feedback, testing)
- Design (if UI/UX refresh needed)

---

## Post-Launch Roadmap

### v1.1 (Month 3)
- Advanced AI features (PR descriptions, commit message generation)
- Enhanced team collaboration (comments, annotations)
- Performance optimizations based on beta feedback

### v1.2 (Month 4)
- Custom work types (extensible beyond feature/hotfix/maintenance/lab)
- Integrations (GitHub, Linear, Jira)
- Advanced session analytics

### v2.0 (Month 6)
- Web UI dashboard (alongside CLI)
- Remote session access (cloud-hosted sessions)
- Enterprise features (SSO, audit logs, compliance)

---

## Appendix: Pattern Reference Guide

### PTY Process Lifecycle (Reference)

```typescript
// Pattern from ecosystem - not copied, just referenced
class PtySpawner {
  spawn(command: string, args: string[]): Effect.Effect<IPty, PtyError> {
    return Effect.tryPromise({
      try: () => {
        const pty = spawn(command, args, {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: worktreePath,
          env: process.env,
        });

        // Fallback on exit code 1 (pattern)
        pty.onExit(({exitCode}) => {
          if (exitCode === 1 && fallbackArgs) {
            this.spawn(command, fallbackArgs);
          }
        });

        return pty;
      },
      catch: (error) => new PtyError({...}),
    });
  }
}
```

### State Detection (Reference)

```typescript
// Proven patterns from ecosystem
const PATTERNS = {
  WAITING: [/│ Do you want/i, /│ Would you like/i],
  BUSY: /ESC to interrupt/i,
};

const PERSISTENCE_DURATION_MS = 2000; // Must persist 2s
const CHECK_INTERVAL_MS = 500; // Check every 500ms

// Persistence logic to avoid flapping
let pendingState: SessionState | undefined;
let pendingStateStart: number | undefined;

function detectState(output: string): SessionState {
  const newState = matchPatterns(output);

  if (newState !== pendingState) {
    pendingState = newState;
    pendingStateStart = Date.now();
    return currentState; // Don't change yet
  }

  if (Date.now() - pendingStateStart! >= PERSISTENCE_DURATION_MS) {
    currentState = newState;
    pendingState = undefined;
  }

  return currentState;
}
```

---

## Final Thoughts

This rebuild is not just about code - it's about **creating a platform-ready foundation for Rehex's vision**. By starting fresh with clean IP, modern architecture, and team-first design, we're positioning rehex-cc as a commercial-grade product rather than a developer tool.

The 2-month timeline is aggressive but achievable. We're not reinventing the wheel - we're taking proven patterns from the ecosystem and your innovations from AutoCC, then architecting them correctly for a commercial platform.

**Key Success Factors**:
1. **Focus**: Ruthlessly prioritize core features
2. **Parallel Work**: Use git worktrees to work on multiple features simultaneously (yes, ironic!)
3. **Testing**: Write tests as you build, not after
4. **Documentation**: Document decisions immediately, not later
5. **Feedback**: Get beta users involved early

Let's build something great. 🚀

---

**Document Version**: 1.0
**Last Updated**: 2025-01-03
**Status**: Approved for implementation
**Next Steps**: Create git worktrees for parallel development, start Week 1 tasks
