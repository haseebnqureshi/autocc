import React, {useState, useEffect, useCallback, useRef} from 'react';
import {useApp, Box, Text} from 'ink';
import {Effect} from 'effect';
import Menu from './Menu.js';
import ProjectList from './ProjectList.js';
import Session from './Session.js';
import NewWorktree from './NewWorktree.js';
import DeleteWorktree from './DeleteWorktree.js';
import MergeWorktree from './MergeWorktree.js';
import Configuration from './Configuration.js';
import PresetSelector from './PresetSelector.js';
import RemoteBranchSelector from './RemoteBranchSelector.js';
import LoadingSpinner from './LoadingSpinner.js';
import {SessionManager} from '../services/sessionManager.js';
import {globalSessionOrchestrator} from '../services/globalSessionOrchestrator.js';
import {WorktreeService} from '../services/worktreeService.js';
import {
	Worktree,
	Session as SessionType,
	DevcontainerConfig,
	GitProject,
	AmbiguousBranchError,
	WorkType,
} from '../types/index.js';
import {type AppError} from '../types/errors.js';
import {configurationManager} from '../services/configurationManager.js';
import {ENV_VARS} from '../constants/env.js';
import {MULTI_PROJECT_ERRORS} from '../constants/error.js';
import {projectManager} from '../services/projectManager.js';

type View =
	| 'menu'
	| 'project-list'
	| 'session'
	| 'new-worktree'
	| 'creating-worktree'
	| 'naming-worktree'
	| 'creating-session'
	| 'creating-session-preset'
	| 'delete-worktree'
	| 'deleting-worktree'
	| 'merge-worktree'
	| 'configuration'
	| 'preset-selector'
	| 'remote-branch-selector'
	| 'clearing';

interface AppProps {
	devcontainerConfig?: DevcontainerConfig;
	multiProject?: boolean;
}

const App: React.FC<AppProps> = ({devcontainerConfig, multiProject}) => {
	const {exit} = useApp();
	const [view, setView] = useState<View>(
		multiProject ? 'project-list' : 'menu',
	);
	const [sessionManager, setSessionManager] = useState<SessionManager>(() =>
		globalSessionOrchestrator.getManagerForProject(),
	);
	const [worktreeService, setWorktreeService] = useState(
		() => new WorktreeService(),
	);
	const [activeSession, setActiveSession] = useState<SessionType | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [menuKey, setMenuKey] = useState(0); // Force menu refresh
	const [selectedWorktree, setSelectedWorktree] = useState<Worktree | null>(
		null,
	); // Store selected worktree for preset selection
	const [selectedProject, setSelectedProject] = useState<GitProject | null>(
		null,
	); // Store selected project in multi-project mode

	// Guard against double execution of worktree creation
	const isCreatingWorktree = useRef(false);

	// State for remote branch disambiguation
	const [pendingWorktreeCreation, setPendingWorktreeCreation] = useState<{
		path: string;
		branch: string;
		baseBranch: string;
		copySessionData: boolean;
		copyClaudeDirectory: boolean;
		ambiguousError: AmbiguousBranchError;
	} | null>(null);

	// State for loading context - track flags for message composition
	const [loadingContext, setLoadingContext] = useState<{
		copySessionData?: boolean;
		deleteBranch?: boolean;
		workType?: WorkType;
		finalBranchName?: string;
	}>({});

	// Helper function to format error messages based on error type using _tag discrimination
	const formatErrorMessage = (error: AppError): string => {
		switch (error._tag) {
			case 'ProcessError':
				return `Process error: ${error.message}`;
			case 'ConfigError':
				return `Configuration error (${error.reason}): ${error.details}`;
			case 'GitError':
				return `Git command failed: ${error.command} (exit ${error.exitCode})\n${error.stderr}`;
			case 'FileSystemError':
				return `File ${error.operation} failed for ${error.path}: ${error.cause}`;
			case 'ValidationError':
				return `Validation failed for ${error.field}: ${error.constraint}`;
		}
	};

	// Helper function to create session with Effect-based error handling
	const createSessionWithEffect = async (
		worktreePath: string,
		presetId?: string,
	): Promise<{
		success: boolean;
		session?: SessionType;
		errorMessage?: string;
	}> => {
		const sessionEffect = devcontainerConfig
			? sessionManager.createSessionWithDevcontainerEffect(
					worktreePath,
					devcontainerConfig,
					presetId,
				)
			: sessionManager.createSessionWithPresetEffect(worktreePath, presetId);

		// Execute the Effect and handle both success and failure cases
		const result = await Effect.runPromise(Effect.either(sessionEffect));

		if (result._tag === 'Left') {
			// Handle error using pattern matching on _tag
			const errorMessage = formatErrorMessage(result.left);
			return {
				success: false,
				errorMessage: `Failed to create session: ${errorMessage}`,
			};
		}

		// Success case - extract session from Right
		return {
			success: true,
			session: result.right,
		};
	};

	// Helper function to clear terminal screen
	const clearScreen = () => {
		if (process.stdout.isTTY) {
			process.stdout.write('\x1B[2J\x1B[H');
		}
	};

	// Helper function to navigate with screen clearing
	const navigateWithClear = useCallback(
		(newView: View, callback?: () => void) => {
			clearScreen();
			setView('clearing');
			setTimeout(() => {
				setView(newView);
				if (callback) callback();
			}, 10); // Small delay to ensure screen clear is processed
		},
		[],
	);

	useEffect(() => {
		// Listen for session exits to return to menu automatically
		const handleSessionExit = (session: SessionType) => {
			// If the exited session is the active one, return to menu
			setActiveSession(current => {
				if (current && session.id === current.id) {
					// Session that exited is the active one, trigger return to menu
					setActiveSession(null);
					setError(null);

					const targetView =
						multiProject && selectedProject
							? 'menu'
							: multiProject
								? 'project-list'
								: 'menu';

					navigateWithClear(targetView, () => {
						setMenuKey(prev => prev + 1);
						process.stdin.resume();
						process.stdin.setEncoding('utf8');
					});
				}
				return current;
			});
		};

		sessionManager.on('sessionExit', handleSessionExit);

		// Re-attach listener when session manager changes
		return () => {
			sessionManager.off('sessionExit', handleSessionExit);
			// Don't destroy sessions on unmount - they persist in memory
		};
	}, [sessionManager, multiProject, selectedProject, navigateWithClear]);

	// Helper function to parse ambiguous branch error and create AmbiguousBranchError
	const handleSelectWorktree = async (worktree: Worktree) => {
		// Check if this is the new worktree option
		if (worktree.path === '') {
			navigateWithClear('new-worktree');
			return;
		}

		// Check if this is the delete worktree option
		if (worktree.path === 'DELETE_WORKTREE') {
			navigateWithClear('delete-worktree');
			return;
		}

		// Check if this is the merge worktree option
		if (worktree.path === 'MERGE_WORKTREE') {
			navigateWithClear('merge-worktree');
			return;
		}

		// Check if this is the configuration option
		if (worktree.path === 'CONFIGURATION') {
			navigateWithClear('configuration');
			return;
		}

		// Check if this is the exit application option
		if (worktree.path === 'EXIT_APPLICATION') {
			// In multi-project mode with a selected project, go back to project list
			if (multiProject && selectedProject) {
				handleBackToProjectList();
			} else {
				// Only destroy all sessions when actually exiting the app
				globalSessionOrchestrator.destroyAllSessions();
				exit();
			}
			return;
		}

		// Get or create session for this worktree
		let session = sessionManager.getSession(worktree.path);

		if (!session) {
			// Check if we should show preset selector
			if (configurationManager.getSelectPresetOnStart()) {
				setSelectedWorktree(worktree);
				navigateWithClear('preset-selector');
				return;
			}

			// Set loading state before async operation
			setView('creating-session');

			// Use Effect-based session creation with default preset
			const result = await createSessionWithEffect(worktree.path);

			if (!result.success) {
				setError(result.errorMessage!);
				navigateWithClear('menu');
				return;
			}

			session = result.session!;
		}

		setActiveSession(session);
		navigateWithClear('session');
	};

	const handlePresetSelected = async (presetId: string) => {
		if (!selectedWorktree) return;

		// Set loading state before async operation
		setView('creating-session-preset');

		// Create session with selected preset using Effect
		const result = await createSessionWithEffect(
			selectedWorktree.path,
			presetId,
		);

		if (!result.success) {
			setError(result.errorMessage!);
			setView('menu');
			setSelectedWorktree(null);
			return;
		}

		// Success case
		setActiveSession(result.session!);
		navigateWithClear('session');
		setSelectedWorktree(null);
	};

	const handlePresetSelectorCancel = () => {
		setSelectedWorktree(null);
		navigateWithClear('menu', () => {
			setMenuKey(prev => prev + 1);
		});
	};

	const handleReturnToMenu = () => {
		setActiveSession(null);
		// Don't clear error here - let user dismiss it manually

		const targetView =
			multiProject && selectedProject
				? 'menu'
				: multiProject
					? 'project-list'
					: 'menu';

		navigateWithClear(targetView, () => {
			setMenuKey(prev => prev + 1); // Force menu refresh

			// Ensure stdin is in a clean state for Ink components
			if (process.stdin.isTTY) {
				// Flush any pending input to prevent escape sequences from leaking
				process.stdin.read();
				process.stdin.setRawMode(false);
				process.stdin.resume();
				process.stdin.setEncoding('utf8');
			}
		});
	};

	const handleCreateWorktree = async (
		baseBranch: string,
		workType: WorkType,
		description: string,
	) => {
		// Guard against double execution
		if (isCreatingWorktree.current) {
			return;
		}
		isCreatingWorktree.current = true;

		setView('creating-worktree');
		setError(null);

		// Generate a temporary branch name with timestamp
		const tempBranchName = `temp-${Date.now()}`;

		// Determine worktree path (auto-generate or use config pattern)
		const worktreeConfig = configurationManager.getWorktreeConfig();
		const projectRoot = selectedProject?.path || process.cwd();
		let worktreePath: string;

		const path = await import('path');
		const fs = await import('fs');
		const verbose = process.env['AUTOCC_VERBOSE'] === '1';

		// Always create .autocc directory in the git repo for organization
		const autoccDir = path.default.join(projectRoot, '.autocc');
		if (!fs.default.existsSync(autoccDir)) {
			if (verbose) {
				console.error(`[DEBUG] Creating .autocc directory: ${autoccDir}`);
			}
			fs.default.mkdirSync(autoccDir, {recursive: true});

			// Update .gitignore to exclude .autocc
			const gitignorePath = path.default.join(projectRoot, '.gitignore');
			try {
				let gitignoreContent = '';
				if (fs.default.existsSync(gitignorePath)) {
					gitignoreContent = fs.default.readFileSync(gitignorePath, 'utf8');
				}

				// Check if .autocc/ is already in .gitignore
				if (!gitignoreContent.includes('.autocc/')) {
					// Add .autocc/ to .gitignore
					const newContent = gitignoreContent.trim()
						? `${gitignoreContent.trim()}\n.autocc/\n`
						: `.autocc/\n`;
					fs.default.writeFileSync(gitignorePath, newContent, 'utf8');

					if (verbose) {
						console.error(`[DEBUG] Added .autocc/ to .gitignore`);
					}
				}
			} catch (error) {
				// Non-critical error - just log it
				if (verbose) {
					console.error(
						`[DEBUG] Warning: Failed to update .gitignore: ${error}`,
					);
				}
			}
		}

		if (worktreeConfig.autoDirectory) {
			// Generate path using pattern within .autocc folder
			const pattern = (
				worktreeConfig.autoDirectoryPattern || '../{branch}'
			).replace(/^\.\.\//, ''); // Remove leading ../
			const folderName = pattern
				.replace('{branch}', tempBranchName)
				.replace('{project}', path.default.basename(projectRoot));

			worktreePath = path.default.join(autoccDir, folderName);

			if (verbose) {
				console.error(`[DEBUG] Generated worktree path: ${worktreePath}`);
			}
		} else {
			// Use default pattern: .autocc/temp-{timestamp} to avoid polluting parent directory
			worktreePath = path.default.join(autoccDir, tempBranchName);

			if (verbose) {
				console.error(`[DEBUG] Using default worktree path: ${worktreePath}`);
			}
		}

		// Step 1: Create the worktree with temp branch name
		// Always copy .claude directory, never copy session data (fresh start)
		const createResult = await Effect.runPromise(
			Effect.either(
				worktreeService.createWorktreeEffect(
					worktreePath,
					tempBranchName,
					baseBranch,
					false, // copySessionData - always false
					true, // copyClaudeDirectory - always true
					workType,
					description,
				),
			),
		);

		if (createResult._tag === 'Left') {
			// Handle error
			const errorMessage = formatErrorMessage(createResult.left);
			setError(`Failed to create worktree: ${errorMessage}`);
			setView('new-worktree');
			isCreatingWorktree.current = false;
			return;
		}

		// Step 2: Run headless Claude to determine branch name and setup environment
		setLoadingContext({workType});
		setView('naming-worktree');

		const setupResult = await Effect.runPromise(
			Effect.either(
				worktreeService.setupWorktreeWithClaudeEffect(
					worktreePath,
					tempBranchName,
					workType,
					description,
					sessionManager,
				),
			),
		);

		if (setupResult._tag === 'Left') {
			// Setup failed, but worktree was created - inform user
			const errorMessage = formatErrorMessage(setupResult.left);
			setError(
				`Worktree created but setup failed: ${errorMessage}\nBranch name: ${tempBranchName}\nPath: ${worktreePath}`,
			);
			isCreatingWorktree.current = false;
			handleReturnToMenu();
			return;
		}

		const finalBranchName = setupResult.right;

		// Rename the worktree folder to match the branch name using git worktree move
		// This updates git's internal references properly
		const finalWorktreePath = path.default.join(
			path.default.dirname(worktreePath),
			finalBranchName,
		);

		if (verbose) {
			console.error(
				`[DEBUG] Moving worktree: ${worktreePath} → ${finalWorktreePath}`,
			);
		}

		try {
			const {execSync} = await import('child_process');
			execSync(`git worktree move "${worktreePath}" "${finalWorktreePath}"`, {
				cwd: projectRoot,
				encoding: 'utf8',
			});

			if (verbose) {
				console.error(`[DEBUG] Worktree moved successfully`);
			}
		} catch (error) {
			setError(
				`Worktree created with branch ${finalBranchName}, but failed to move folder: ${error}`,
			);
			isCreatingWorktree.current = false;
			handleReturnToMenu();
			return;
		}

		// Show success message with final branch name
		setLoadingContext({workType, finalBranchName});
		setView('naming-worktree');

		// Wait a moment to show the success message
		await new Promise(resolve => setTimeout(resolve, 2000));

		// Success! Return to menu - user can manually start a session by selecting the worktree
		isCreatingWorktree.current = false;
		handleReturnToMenu();
	};

	const handleCancelNewWorktree = () => {
		handleReturnToMenu();
	};

	const handleRemoteBranchSelected = async (selectedRemoteRef: string) => {
		if (!pendingWorktreeCreation) return;

		// Clear the pending creation data
		const creationData = pendingWorktreeCreation;
		setPendingWorktreeCreation(null);

		// Retry worktree creation with the resolved base branch
		// Set loading context before showing loading view
		setLoadingContext({copySessionData: creationData.copySessionData});
		setView('creating-worktree');
		setError(null);

		const result = await Effect.runPromise(
			Effect.either(
				worktreeService.createWorktreeEffect(
					creationData.path,
					creationData.branch,
					selectedRemoteRef, // Use the selected remote reference
					creationData.copySessionData,
					creationData.copyClaudeDirectory,
				),
			),
		);

		if (result._tag === 'Left') {
			// Handle error using pattern matching on _tag
			const errorMessage = formatErrorMessage(result.left);
			setError(errorMessage);
			setView('new-worktree');
		} else {
			// Success - return to menu
			handleReturnToMenu();
		}
	};

	const handleRemoteBranchSelectorCancel = () => {
		// Clear pending data and return to new worktree form
		setPendingWorktreeCreation(null);
		setView('new-worktree');
	};

	const handleDeleteWorktrees = async (
		worktreePaths: string[],
		deleteBranch: boolean,
	) => {
		// Set loading context before showing loading view
		setLoadingContext({deleteBranch});
		setView('deleting-worktree');
		setError(null);

		// Delete the worktrees sequentially using Effect
		let hasError = false;
		for (const path of worktreePaths) {
			const result = await Effect.runPromise(
				Effect.either(
					worktreeService.deleteWorktreeEffect(path, {deleteBranch}),
				),
			);

			if (result._tag === 'Left') {
				// Handle error using pattern matching on _tag
				hasError = true;
				const errorMessage = formatErrorMessage(result.left);
				setError(errorMessage);
				break;
			}
		}

		if (!hasError) {
			// Success - return to menu
			handleReturnToMenu();
		} else {
			// Show error
			setView('delete-worktree');
		}
	};

	const handleCancelDeleteWorktree = () => {
		handleReturnToMenu();
	};

	const handleSelectProject = (project: GitProject) => {
		// Handle special exit case
		if (project.path === 'EXIT_APPLICATION') {
			globalSessionOrchestrator.destroyAllSessions();
			exit();
			return;
		}

		// Set the selected project and update services
		setSelectedProject(project);
		setWorktreeService(new WorktreeService(project.path));
		// Get or create session manager for this project
		const projectSessionManager =
			globalSessionOrchestrator.getManagerForProject(project.path);
		setSessionManager(projectSessionManager);
		// Add to recent projects
		projectManager.addRecentProject(project);
		navigateWithClear('menu');
	};

	const handleBackToProjectList = () => {
		// Sessions persist in their project-specific managers
		setSelectedProject(null);
		setWorktreeService(new WorktreeService()); // Reset to default
		// Reset to global session manager for project list view
		setSessionManager(globalSessionOrchestrator.getManagerForProject());

		navigateWithClear('project-list', () => {
			setMenuKey(prev => prev + 1);
		});
	};

	if (view === 'project-list' && multiProject) {
		const projectsDir = process.env[ENV_VARS.MULTI_PROJECT_ROOT];
		if (!projectsDir) {
			return (
				<Box>
					<Text color="red">Error: {MULTI_PROJECT_ERRORS.NO_PROJECTS_DIR}</Text>
				</Box>
			);
		}

		return (
			<ProjectList
				projectsDir={projectsDir}
				onSelectProject={handleSelectProject}
				error={error}
				onDismissError={() => setError(null)}
			/>
		);
	}

	if (view === 'menu') {
		return (
			<Menu
				key={menuKey}
				sessionManager={sessionManager}
				worktreeService={worktreeService}
				onSelectWorktree={handleSelectWorktree}
				onSelectRecentProject={handleSelectProject}
				error={error}
				onDismissError={() => setError(null)}
				projectName={selectedProject?.name}
				multiProject={multiProject}
			/>
		);
	}

	if (view === 'session' && activeSession) {
		return (
			<Box flexDirection="column">
				<Session
					key={activeSession.id}
					session={activeSession}
					sessionManager={sessionManager}
					onReturnToMenu={handleReturnToMenu}
				/>
			</Box>
		);
	}

	if (view === 'new-worktree') {
		return (
			<Box flexDirection="column">
				{error && (
					<Box marginBottom={1}>
						<Text color="red">Error: {error}</Text>
					</Box>
				)}
				<NewWorktree
					projectPath={selectedProject?.path || process.cwd()}
					onComplete={handleCreateWorktree}
					onCancel={handleCancelNewWorktree}
				/>
			</Box>
		);
	}

	if (view === 'creating-worktree') {
		// Compose message based on loading context
		const message = loadingContext.copySessionData
			? 'Creating worktree and copying session data...'
			: 'Creating worktree...';

		return (
			<Box flexDirection="column">
				<LoadingSpinner message={message} color="cyan" />
			</Box>
		);
	}

	if (view === 'naming-worktree') {
		// Show different message based on whether we have final name
		const workTypeLabel = loadingContext.workType || 'feature';
		const message = loadingContext.finalBranchName
			? `Worktree created: ${loadingContext.finalBranchName}`
			: `Checking with Claude on an effective branch name for your ${workTypeLabel} work...`;

		return (
			<Box flexDirection="column">
				<LoadingSpinner
					message={message}
					color={loadingContext.finalBranchName ? 'green' : 'cyan'}
				/>
			</Box>
		);
	}

	if (view === 'delete-worktree') {
		return (
			<Box flexDirection="column">
				{error && (
					<Box marginBottom={1}>
						<Text color="red">Error: {error}</Text>
					</Box>
				)}
				<DeleteWorktree
					onComplete={handleDeleteWorktrees}
					onCancel={handleCancelDeleteWorktree}
				/>
			</Box>
		);
	}

	if (view === 'deleting-worktree') {
		// Compose message based on loading context
		const message = loadingContext.deleteBranch
			? 'Deleting worktrees and branches...'
			: 'Deleting worktrees...';

		return (
			<Box flexDirection="column">
				<LoadingSpinner message={message} color="cyan" />
			</Box>
		);
	}

	if (view === 'merge-worktree') {
		return (
			<Box flexDirection="column">
				{error && (
					<Box marginBottom={1}>
						<Text color="red">Error: {error}</Text>
					</Box>
				)}
				<MergeWorktree
					onComplete={handleReturnToMenu}
					onCancel={handleReturnToMenu}
				/>
			</Box>
		);
	}

	if (view === 'configuration') {
		return <Configuration onComplete={handleReturnToMenu} />;
	}

	if (view === 'preset-selector') {
		return (
			<PresetSelector
				onSelect={handlePresetSelected}
				onCancel={handlePresetSelectorCancel}
			/>
		);
	}

	if (view === 'remote-branch-selector' && pendingWorktreeCreation) {
		return (
			<RemoteBranchSelector
				branchName={pendingWorktreeCreation.ambiguousError.branchName}
				matches={pendingWorktreeCreation.ambiguousError.matches}
				onSelect={handleRemoteBranchSelected}
				onCancel={handleRemoteBranchSelectorCancel}
			/>
		);
	}

	if (view === 'creating-session') {
		// Compose message based on devcontainerConfig presence
		// Devcontainer operations take >5 seconds, so indicate extended duration
		const message = devcontainerConfig
			? 'Starting devcontainer (this may take a moment)...'
			: 'Creating session...';

		// Use yellow color for devcontainer operations (longer duration),
		// cyan for standard session creation
		const color = devcontainerConfig ? 'yellow' : 'cyan';

		return (
			<Box flexDirection="column">
				<LoadingSpinner message={message} color={color} />
			</Box>
		);
	}

	if (view === 'creating-session-preset') {
		// Always display preset-specific message
		// Devcontainer operations take >5 seconds, so indicate extended duration
		const message = devcontainerConfig
			? 'Creating session with preset (this may take a moment)...'
			: 'Creating session with preset...';

		// Use yellow color for devcontainer, cyan for standard
		const color = devcontainerConfig ? 'yellow' : 'cyan';

		return (
			<Box flexDirection="column">
				<LoadingSpinner message={message} color={color} />
			</Box>
		);
	}

	if (view === 'clearing') {
		// Render nothing during the clearing phase to ensure clean transition
		return null;
	}

	return null;
};

export default App;
