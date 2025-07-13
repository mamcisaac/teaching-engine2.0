#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to exclude from conversion (config files, index files)
const EXCLUDE_PATTERNS = [
  '**/index.ts',
  '**/index.tsx',
  '**/*.config.ts',
  '**/*.config.js',
  '**/vite.config.ts',
  '**/jest.config.js',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
];

// Convert default export to named export
function convertDefaultToNamed(content, fileName) {
  const componentName = path.basename(fileName, path.extname(fileName));
  
  // Handle: export default function ComponentName
  content = content.replace(
    /export\s+default\s+function\s+(\w+)/g,
    'export function $1'
  );
  
  // Handle: export default class ComponentName
  content = content.replace(
    /export\s+default\s+class\s+(\w+)/g,
    'export class $1'
  );
  
  // Handle: const Component = ...; export default Component;
  content = content.replace(
    /export\s+default\s+(\w+);?\s*$/gm,
    'export { $1 };'
  );
  
  // Handle: export default { ... }
  const objectExportMatch = content.match(/export\s+default\s+\{[\s\S]*?\};?$/m);
  if (objectExportMatch) {
    const exportName = componentName.charAt(0).toLowerCase() + componentName.slice(1);
    content = content.replace(
      /export\s+default\s+(\{[\s\S]*?\});?$/m,
      `export const ${exportName} = $1;`
    );
  }
  
  // Handle: export default () => { ... }
  const arrowFunctionMatch = content.match(/export\s+default\s+\(.*?\)\s*=>/);
  if (arrowFunctionMatch) {
    content = content.replace(
      /export\s+default\s+(\(.*?\)\s*=>[\s\S]*?);?$/m,
      `export const ${componentName} = $1;`
    );
  }
  
  return content;
}

// Get all TypeScript/JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '.git/**',
    ...EXCLUDE_PATTERNS,
  ],
  absolute: true,
});

console.log(`Found ${files.length} files to check...`);

let convertedCount = 0;

files.forEach((file) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if file has default export
    if (/export\s+default\s+/.test(content)) {
      const newContent = convertDefaultToNamed(content, file);
      
      if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`✓ Converted default export in: ${path.relative(process.cwd(), file)}`);
        convertedCount++;
      }
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nConverted ${convertedCount} files from default to named exports.`);