#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './components/App.js';
import {worktreeConfigManager} from './services/worktreeConfigManager.js';
import {globalSessionOrchestrator} from './services/globalSessionOrchestrator.js';

const cli = meow(
	`
	Usage
	  $ autocc

	Options
	  --help                Show help
	  --version             Show version
	  --verbose             Enable verbose debug logging
	  --multi-project       Enable multi-project mode
	  --devc-up-command     Command to start devcontainer
	  --devc-exec-command   Command to execute in devcontainer

	Examples
	  $ autocc
	  $ autocc --verbose
	  $ autocc --multi-project
	  $ autocc --devc-up-command "devcontainer up --workspace-folder ." --devc-exec-command "devcontainer exec --workspace-folder ."
`,
	{
		importMeta: import.meta,
		flags: {
			verbose: {
				type: 'boolean',
				default: false,
			},
			multiProject: {
				type: 'boolean',
				default: false,
			},
			devcUpCommand: {
				type: 'string',
			},
			devcExecCommand: {
				type: 'string',
			},
		},
	},
);

// Validate devcontainer arguments using XOR
if (!!cli.flags.devcUpCommand !== !!cli.flags.devcExecCommand) {
	console.error(
		'Error: Both --devc-up-command and --devc-exec-command must be provided together',
	);
	process.exit(1);
}

// Check if we're in a TTY environment
if (!process.stdin.isTTY || !process.stdout.isTTY) {
	console.error('Error: autocc must be run in an interactive terminal (TTY)');
	process.exit(1);
}

// Set verbose flag globally
if (cli.flags.verbose) {
	process.env['AUTOCC_VERBOSE'] = '1';
}

// Check for CCMANAGER_MULTI_PROJECT_ROOT when using --multi-project
if (cli.flags.multiProject && !process.env['CCMANAGER_MULTI_PROJECT_ROOT']) {
	console.error(
		'Error: CCMANAGER_MULTI_PROJECT_ROOT environment variable must be set when using --multi-project',
	);
	console.error(
		'Please set it to the root directory containing your projects, e.g.:',
	);
	console.error('  export CCMANAGER_MULTI_PROJECT_ROOT=/path/to/projects');
	console.error('');
	console.error(
		'Note: autocc is a fork of ccmanager and uses the same environment variable names for compatibility.',
	);
	process.exit(1);
}

// Initialize worktree config manager
worktreeConfigManager.initialize();

// Check for updates asynchronously (non-blocking)
const checkForUpdates = async () => {
	try {
		const {exec} = await import('child_process');
		const {promisify} = await import('util');
		const execAsync = promisify(exec);

		const {stdout} = await execAsync('npm view autocc version', {
			timeout: 3000,
		});
		const latestVersion = stdout.trim();
		const currentVersion = cli.pkg.version;

		if (latestVersion !== currentVersion) {
			// Show update message
			console.error(
				`\n\x1b[33m⚠ Update available: autocc@${latestVersion} (you have ${currentVersion})\x1b[0m`,
			);
			console.error(`\x1b[33m  Run: npm install -g autocc to update\x1b[0m\n`);
		}
	} catch {
		// Silently fail - update check is non-critical
	}
};

// Run update check in background
checkForUpdates();

// Prepare devcontainer config
const devcontainerConfig =
	cli.flags.devcUpCommand && cli.flags.devcExecCommand
		? {
				upCommand: cli.flags.devcUpCommand,
				execCommand: cli.flags.devcExecCommand,
			}
		: undefined;

// Pass config to App
const appProps = {
	...(devcontainerConfig ? {devcontainerConfig} : {}),
	multiProject: cli.flags.multiProject,
};

const app = render(<App {...appProps} />);

// Clean up sessions on exit
process.on('SIGINT', () => {
	globalSessionOrchestrator.destroyAllSessions();
	app.unmount();
	process.exit(0);
});

process.on('SIGTERM', () => {
	globalSessionOrchestrator.destroyAllSessions();
	app.unmount();
	process.exit(0);
});

// Export for testing
export const parsedArgs = cli;
