#!/usr/bin/env node

/**
 * Script to fix Web Connector tests to use central mock registry
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const WEB_CONNECTOR_TEST_PATTERNS = [
  'tests/unit/connectors/educationWebConnector*.test.ts',
  'tests/unit/connectors/baseConnector*.test.ts',
  'tests/unit/connectors/oerConnector*.test.ts',
  'tests/integration/connectors/*.test.ts',
];

function fixTestFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add mock registry import if not present
  if (!content.includes("import { MockRegistry }")) {
    const importIndex = content.indexOf("import");
    const nextLineIndex = content.indexOf("\n", importIndex);
    content = content.slice(0, nextLineIndex + 1) + 
      "import { MockRegistry } from '../../mocks/registry';\n" +
      content.slice(nextLineIndex + 1);
    modified = true;
  }

  // Fix fetch mock patterns
  if (content.includes("jest.mock('node-fetch')")) {
    content = content.replace(/jest\.mock\('node-fetch'\);?/g, "jest.mock('node-fetch');");
    modified = true;
  }

  // Add fetch mock in beforeEach
  content = content.replace(
    /beforeEach\((\s*async\s*)?\(\)\s*=>\s*{([^}]+)}\);/g,
    (match, async, body) => {
      if (!body.includes('MockRegistry') && !body.includes('mockFetch')) {
        const newBody = body + `
    // Setup centralized mocks
    const mockFetch = MockRegistry.fetch.create();
    (global as any).fetch = mockFetch;
    const nodeFetch = require('node-fetch');
    nodeFetch.default = mockFetch;`;
        return `beforeEach(${async || ''}() => {${newBody}
});`;
      }
      return match;
    }
  );

  // Fix existing fetch mock patterns
  content = content.replace(
    /mockFetch\.mockResolvedValueOnce\(/g,
    'mockFetch.mockResolvedValueOnce('
  );

  content = content.replace(
    /mockFetch\.mockRejectedValueOnce\(/g,
    'mockFetch.mockRejectedValueOnce('
  );

  // Fix response creation patterns
  content = content.replace(
    /ok:\s*true,\s*json:\s*async\s*\(\)\s*=>\s*\(/g,
    'ok: true, status: 200, json: async () => ('
  );

  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${filePath}`);
  } else {
    console.log(`- No changes needed for ${filePath}`);
  }
}

// Main execution
console.log('Starting Web Connector test fixes...\n');

let totalFixed = 0;
for (const pattern of WEB_CONNECTOR_TEST_PATTERNS) {
  const files = glob.sync(pattern, { cwd: path.join(__dirname, '..') });
  for (const file of files) {
    fixTestFile(path.join(__dirname, '..', file));
    totalFixed++;
  }
}

console.log(`\n✓ Fixed ${totalFixed} Web Connector test files`);