#!/usr/bin/env node

/**
 * Script to fix Embedding Service tests to use central mock registry
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const EMBEDDING_TEST_PATTERNS = [
  'tests/unit/embeddingService*.test.ts',
  'tests/unit/clusteringService*.test.ts',
  'tests/integration/embeddingService*.test.ts',
  'tests/integration/clusteringService*.test.ts',
  'tests/services/embeddingService*.test.ts',
  'tests/services/clusteringService*.test.ts',
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
      "import { MockRegistry } from '../mocks/registry';\n" +
      content.slice(nextLineIndex + 1);
    modified = true;
  }

  // Fix OpenAI mock patterns
  content = content.replace(/jest\.mock\('openai'\);?/g, "jest.mock('openai');");
  
  // Fix beforeEach patterns - properly handle the setup
  content = content.replace(
    /beforeEach\((\s*async\s*)?\(\)\s*=>\s*{([^}]+)}\);/g,
    (match, async, body) => {
      if (!body.includes('MockRegistry')) {
        const newBody = body + `
    // Setup centralized mocks
    const mockOpenAIInstance = MockRegistry.openai.create();
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIInstance as any);`;
        return `beforeEach(${async || ''}() => {${newBody}
});`;
      }
      return match;
    }
  );

  // Fix embedding mock patterns
  content = content.replace(
    /mockOpenAI\.embeddings\.create\.mockResolvedValue\(/g,
    'mockOpenAIInstance.embeddings.create.mockResolvedValue(MockRegistry.openai.embedding('
  );

  // Fix direct mock patterns
  content = content.replace(
    /embeddings:\s*{\s*create:\s*jest\.fn\(\)\.mockResolvedValue\(/g,
    'mockOpenAIInstance.embeddings.create.mockResolvedValue(MockRegistry.openai.embedding('
  );

  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${filePath}`);
  } else {
    console.log(`- No changes needed for ${filePath}`);
  }
}

// Main execution
console.log('Starting Embedding test fixes...\n');

let totalFixed = 0;
for (const pattern of EMBEDDING_TEST_PATTERNS) {
  const files = glob.sync(pattern, { cwd: path.join(__dirname, '..') });
  for (const file of files) {
    fixTestFile(path.join(__dirname, '..', file));
    totalFixed++;
  }
}

console.log(`\n✓ Fixed ${totalFixed} Embedding test files`);