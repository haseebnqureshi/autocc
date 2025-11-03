import React, {useState, useMemo, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInputWrapper from './TextInputWrapper.js';
import SelectInput from 'ink-select-input';
import {shortcutManager} from '../services/shortcutManager.js';
import {configurationManager} from '../services/configurationManager.js';
import {WorktreeService} from '../services/worktreeService.js';
import {Effect} from 'effect';
import type {AppError} from '../types/errors.js';
import type {WorkType} from '../types/index.js';

interface NewWorktreeProps {
	projectPath?: string;
	onComplete: (
		baseBranch: string,
		workType: WorkType,
		description: string,
	) => void;
	onCancel: () => void;
}

interface BranchItem {
	label: string;
	value: string;
}

interface WorkTypeItem {
	label: string;
	value: WorkType;
}

const WORK_TYPES: WorkTypeItem[] = [
	{label: 'Feature - New functionality', value: 'feature'},
	{label: 'Hotfix - Minor bug fix', value: 'hotfix'},
	{
		label: 'Maintenance - Refactoring or maintenance work',
		value: 'maintenance',
	},
	{label: 'Lab - Experimental work', value: 'lab'},
];

type FormField = 'base-branch' | 'work-type' | 'description';

const NewWorktree: React.FC<NewWorktreeProps> = ({
	projectPath,
	onComplete,
	onCancel,
}) => {
	const worktreeConfig = configurationManager.getWorktreeConfig();
	const defaultBaseBranch = worktreeConfig.defaultBaseBranch || 'main';

	// Form state
	const [baseBranch, setBaseBranch] = useState(defaultBaseBranch);
	const [workType, setWorkType] = useState<WorkType>('feature');
	const [description, setDescription] = useState('');
	const [currentField, setCurrentField] = useState<FormField>('base-branch');

	// Loading and error states for branch data
	const [isLoadingBranches, setIsLoadingBranches] = useState(true);
	const [branchLoadError, setBranchLoadError] = useState<string | null>(null);
	const [branches, setBranches] = useState<string[]>([]);
	const [defaultBranch, setDefaultBranch] = useState<string>(defaultBaseBranch);

	// Initialize worktree service and load branches using Effect
	useEffect(() => {
		let cancelled = false;
		const service = new WorktreeService(projectPath);

		const loadBranches = async () => {
			// Use Effect.all to load branches and defaultBranch in parallel
			const workflow = Effect.all(
				[service.getAllBranchesEffect(), service.getDefaultBranchEffect()],
				{concurrency: 2},
			);

			const result = await Effect.runPromise(
				Effect.match(workflow, {
					onFailure: (error: AppError) => ({
						type: 'error' as const,
						message: formatError(error),
					}),
					onSuccess: ([branchList, defaultBr]: [string[], string]) => ({
						type: 'success' as const,
						branches: branchList,
						defaultBranch: defaultBr,
					}),
				}),
			);

			if (!cancelled) {
				if (result.type === 'error') {
					setBranchLoadError(result.message);
					setIsLoadingBranches(false);
				} else {
					setBranches(result.branches);
					setDefaultBranch(result.defaultBranch);
					// Set base branch to the detected default if different
					if (result.defaultBranch !== defaultBaseBranch) {
						setBaseBranch(result.defaultBranch);
					}
					setIsLoadingBranches(false);
				}
			}
		};

		loadBranches().catch(err => {
			if (!cancelled) {
				setBranchLoadError(`Unexpected error loading branches: ${String(err)}`);
				setIsLoadingBranches(false);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [projectPath, defaultBaseBranch]);

	// Create branch items with default branch first (memoized)
	const branchItems: BranchItem[] = useMemo(
		() => [
			{label: `${defaultBranch} (default)`, value: defaultBranch},
			...branches
				.filter(br => br !== defaultBranch)
				.map(br => ({label: br, value: br})),
		],
		[branches, defaultBranch],
	);

	// Find current selections for display
	const selectedBranchIndex = branchItems.findIndex(
		item => item.value === baseBranch,
	);
	const selectedWorkTypeIndex = WORK_TYPES.findIndex(
		item => item.value === workType,
	);

	useInput((input, key) => {
		if (shortcutManager.matchesShortcut('cancel', input, key)) {
			onCancel();
		}

		// Enter key to submit when description is filled
		if (key.return && currentField === 'description' && description.trim()) {
			onComplete(baseBranch, workType, description);
		}
	});

	const handleBaseBranchSelect = (item: {label: string; value: string}) => {
		setBaseBranch(item.value);
		setCurrentField('work-type');
	};

	const handleWorkTypeSelect = (item: {label: string; value: WorkType}) => {
		setWorkType(item.value);
		setCurrentField('description');
	};

	const handleDescriptionSubmit = (value: string) => {
		if (value.trim()) {
			onComplete(baseBranch, workType, value.trim());
		}
	};

	// Format errors using TaggedError discrimination
	const formatError = (error: AppError): string => {
		switch (error._tag) {
			case 'GitError':
				return `Git command failed: ${error.command} (exit ${error.exitCode})\n${error.stderr}`;
			case 'FileSystemError':
				return `File ${error.operation} failed for ${error.path}: ${error.cause}`;
			case 'ConfigError':
				return `Configuration error (${error.reason}): ${error.details}`;
			case 'ProcessError':
				return `Process error: ${error.message}`;
			case 'ValidationError':
				return `Validation failed for ${error.field}: ${error.constraint}`;
		}
	};

	// Show loading indicator while branches load
	if (isLoadingBranches) {
		return (
			<Box flexDirection="column">
				<Box marginBottom={1}>
					<Text bold color="rgb(232, 123, 53)">
						Create New Worktree
					</Text>
				</Box>
				<Box>
					<Text>Loading branches...</Text>
				</Box>
				<Box marginTop={1}>
					<Text dimColor>
						Press {shortcutManager.getShortcutDisplay('cancel')} to cancel
					</Text>
				</Box>
			</Box>
		);
	}

	// Show error message if branch loading failed
	if (branchLoadError) {
		return (
			<Box flexDirection="column">
				<Box marginBottom={1}>
					<Text bold color="rgb(232, 123, 53)">
						Create New Worktree
					</Text>
				</Box>
				<Box marginBottom={1}>
					<Text color="red">Error loading branches:</Text>
				</Box>
				<Box marginBottom={1}>
					<Text color="red">{branchLoadError}</Text>
				</Box>
				<Box marginTop={1}>
					<Text dimColor>
						Press {shortcutManager.getShortcutDisplay('cancel')} to go back
					</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold color="rgb(232, 123, 53)">
					Create New Worktree
				</Text>
			</Box>

			{/* Show previous answers as breadcrumb */}
			{currentField !== 'base-branch' && (
				<Box marginBottom={1}>
					<Text dimColor>
						Base branch: <Text color="cyan">{baseBranch}</Text>
					</Text>
				</Box>
			)}
			{currentField === 'description' && (
				<Box marginBottom={1}>
					<Text dimColor>
						Work type: <Text color="cyan">{workType}</Text>
					</Text>
				</Box>
			)}

			{/* Current question */}
			{currentField === 'base-branch' && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text bold>Select base branch:</Text>
					</Box>
					<SelectInput
						items={branchItems}
						onSelect={handleBaseBranchSelect}
						initialIndex={selectedBranchIndex >= 0 ? selectedBranchIndex : 0}
						limit={8}
					/>
				</Box>
			)}

			{currentField === 'work-type' && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text bold>What type of work are you doing?</Text>
					</Box>
					<SelectInput
						items={WORK_TYPES}
						onSelect={handleWorkTypeSelect}
						initialIndex={
							selectedWorkTypeIndex >= 0 ? selectedWorkTypeIndex : 0
						}
					/>
				</Box>
			)}

			{currentField === 'description' && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text bold>What are you looking to do?</Text>
					</Box>
					<Box>
						<Text color="cyan">{'> '}</Text>
						<TextInputWrapper
							value={description}
							onChange={setDescription}
							onSubmit={handleDescriptionSubmit}
							placeholder="e.g., add video storage checks"
							focus={true}
						/>
					</Box>
				</Box>
			)}

			{/* Instructions */}
			<Box flexDirection="column" marginTop={1}>
				<Text dimColor>
					Press {shortcutManager.getShortcutDisplay('cancel')} to cancel
				</Text>
				{currentField === 'description' && (
					<Text dimColor>Press Enter to submit</Text>
				)}
			</Box>
		</Box>
	);
};

export default NewWorktree;
