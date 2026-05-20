
const path = require('path')

const buildEslintCommand = (filenames) =>
  `pnpm next lint --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`

module.exports = {
  // 1. Block debug code, Lint, and Format code files
  '*.{js,jsx,ts,tsx}': [
    // Blocks the commit if "console.log" or "debugger" is found in staged changes
    'grep -E "console\\.log|debugger" || true', 
    buildEslintCommand,
    'pnpm prettier --write'
  ],
  
  // 2. Format configuration and styles
  '*.{css,scss,md,json}': 'pnpm prettier --write',
  
  // 3. Fail commit if TypeScript types are broken
  '**/*.ts?(x)': () => 'pnpm exec tsc --noEmit',
}
