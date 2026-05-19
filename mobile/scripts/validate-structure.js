const fs = require('fs');
const path = require('path');

const ALLOWED_ROOT_ITEMS = [
  'app',
  'components',
  'hooks',
  'services',
  'store',
  'lib',
  'types',
  'assets',
  'config',
  'constants',
  'scripts',
  'node_modules',
  '.expo',
  '.claude',
  '.vscode',
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  'dist',
  'package.json',
  'package-lock.json',
  'app.json',
  'tsconfig.json',
  'eslint.config.js',
  '.gitignore',
  'README.md',
  'CLAUDE.md',
  'AGENTS.md',
  'expo-env.d.ts'
];

const mobileRoot = path.join(__dirname, '..');
const items = fs.readdirSync(mobileRoot);

let hasError = false;

items.forEach(item => {
  if (!ALLOWED_ROOT_ITEMS.includes(item)) {
    console.error(`Unapproved file or directory found in mobile root: ${item}`);
    hasError = true;
  }
});

if (hasError) {
  process.exit(1);
} else {
  console.log('Directory structure validation passed.');
  process.exit(0);
}
