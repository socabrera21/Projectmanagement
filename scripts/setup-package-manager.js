#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const VALID_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'];
const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.claude', 'package-manager.json');
const PROJECT_CONFIG_PATH = path.join(process.cwd(), '.claude', 'package-manager.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    global: false,
    project: false,
    detect: false,
    manager: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--global' || arg === '-g') {
      options.global = true;
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.manager = args[++i];
      }
    } else if (arg === '--project' || arg === '-p') {
      options.project = true;
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options.manager = args[++i];
      }
    } else if (arg === '--detect' || arg === '-d') {
      options.detect = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      options.manager = arg;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Package Manager Setup for Claude Code

Usage:
  node setup-package-manager.js [options] [package-manager]

Options:
  --global, -g <manager>   Set package manager in global config (~/.claude/)
  --project, -p <manager>  Set package manager in project config (./.claude/)
  --detect, -d             Detect and display current package manager setting
  --help, -h               Show this help message

Package Managers:
  npm, pnpm, yarn, bun

Examples:
  # Set globally
  node setup-package-manager.js --global pnpm

  # Set for current project
  node setup-package-manager.js --project bun

  # Detect current setting
  node setup-package-manager.js --detect

Environment Variable:
  export CLAUDE_PACKAGE_MANAGER=pnpm
`);
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readConfig(configPath) {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error(`Warning: Could not read ${configPath}`);
  }
  return {};
}

function writeConfig(configPath, config) {
  ensureDir(configPath);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}

function setPackageManager(configPath, manager, scope) {
  if (!VALID_MANAGERS.includes(manager)) {
    console.error(`Error: Invalid package manager "${manager}"`);
    console.error(`Valid options: ${VALID_MANAGERS.join(', ')}`);
    process.exit(1);
  }

  const config = readConfig(configPath);
  config.packageManager = manager;
  writeConfig(configPath, config);
  console.log(`✓ Set ${scope} package manager to: ${manager}`);
  console.log(`  Config: ${configPath}`);
}

function detectPackageManager() {
  console.log('Package Manager Detection\n');

  // Check environment variable
  const envManager = process.env.CLAUDE_PACKAGE_MANAGER;
  if (envManager) {
    console.log(`Environment (CLAUDE_PACKAGE_MANAGER): ${envManager}`);
  } else {
    console.log('Environment (CLAUDE_PACKAGE_MANAGER): not set');
  }

  // Check project config
  const projectConfig = readConfig(PROJECT_CONFIG_PATH);
  if (projectConfig.packageManager) {
    console.log(`Project config: ${projectConfig.packageManager}`);
    console.log(`  Path: ${PROJECT_CONFIG_PATH}`);
  } else {
    console.log('Project config: not set');
  }

  // Check global config
  const globalConfig = readConfig(GLOBAL_CONFIG_PATH);
  if (globalConfig.packageManager) {
    console.log(`Global config: ${globalConfig.packageManager}`);
    console.log(`  Path: ${GLOBAL_CONFIG_PATH}`);
  } else {
    console.log('Global config: not set');
  }

  // Check for lockfiles in current directory
  console.log('\nLockfile detection (current directory):');
  const lockfiles = {
    'package-lock.json': 'npm',
    'pnpm-lock.yaml': 'pnpm',
    'yarn.lock': 'yarn',
    'bun.lockb': 'bun',
  };

  let foundLockfile = false;
  for (const [file, manager] of Object.entries(lockfiles)) {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`  Found ${file} → ${manager}`);
      foundLockfile = true;
    }
  }
  if (!foundLockfile) {
    console.log('  No lockfiles found');
  }

  // Determine effective manager
  console.log('\n---');
  const effective = envManager || projectConfig.packageManager || globalConfig.packageManager || 'npm';
  console.log(`Effective package manager: ${effective}`);
}

function main() {
  const options = parseArgs();

  if (options.detect) {
    detectPackageManager();
    return;
  }

  if (!options.manager) {
    console.error('Error: No package manager specified');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  if (options.global) {
    setPackageManager(GLOBAL_CONFIG_PATH, options.manager, 'global');
  } else if (options.project) {
    setPackageManager(PROJECT_CONFIG_PATH, options.manager, 'project');
  } else {
    // Default to project config
    setPackageManager(PROJECT_CONFIG_PATH, options.manager, 'project');
  }
}

main();
