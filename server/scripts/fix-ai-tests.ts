#!/usr/bin/env ts-node

/**
 * Script to systematically fix AI/LLM service tests to use central mock registry
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const AI_TEST_PATTERNS = [
  'tests/unit/aiParentSummaryService*.test.ts',
  'tests/unit/aiPlanningAssistant*.test.ts',
  'tests/unit/aiActivityGenerator*.test.ts',
  'tests/unit/llmService*.test.ts',
  'tests/unit/gptPlanningAgent*.test.ts',
  'tests/integration/aiParentSummaryService*.test.ts',
  'tests/integration/aiPlanningAssistant*.test.ts',
  'tests/integration/llmService*.test.ts',
];

function fixTestFile(filePath: string) {
  console.log(`Fixing ${filePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add mock registry import if not present
  if (!content.includes('import { MockRegistry }')) {
    const importIndex = content.indexOf('import');
    const nextLineIndex = content.indexOf('\n', importIndex);
    content =
      content.slice(0, nextLineIndex + 1) +
      "import { MockRegistry } from '../mocks/registry';\n" +
      content.slice(nextLineIndex + 1);
    modified = true;
  }

  // Replace old OpenAI mock patterns
  const oldMockPatterns = [
    /jest\.mock\('openai'\);?/g,
    /jest\.mock\('openai',\s*\(\)\s*=>\s*\({[\s\S]*?\}\)\);?/g,
  ];

  for (const pattern of oldMockPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, "jest.mock('openai');");
      modified = true;
    }
  }

  // Update mock setup in beforeEach
  const beforeEachPattern = /beforeEach\(\s*(?:async\s*)?\(\)\s*=>\s*{([^}]+)}/g;
  content = content.replace(beforeEachPattern, (match, body) => {
    if (!body.includes('MockRegistry')) {
      const updatedBody =
        body +
        '\n    // Setup centralized mocks\n' +
        '    const mockOpenAIInstance = MockRegistry.openai.create();\n' +
        '    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIInstance as any);';
      return `beforeEach(() => {${updatedBody}}`;
    }
    return match;
  });

  // Replace mockCreate patterns with centralized mock
  content = content.replace(
    /mockCreate\.mockResolvedValue\(/g,
    'mockOpenAIInstance.chat.completions.create.mockResolvedValue(MockRegistry.openai.chat(',
  );

  // Fix embedding mock patterns
  content = content.replace(
    /embeddings:\s*{\s*create:\s*jest\.fn\(\)\.mockResolvedValue\(/g,
    'mockOpenAIInstance.embeddings.create.mockResolvedValue(MockRegistry.openai.embedding(',
  );

  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${filePath}`);
  } else {
    console.log(`- No changes needed for ${filePath}`);
  }
}

// Main execution
console.log('Starting AI test fixes...\n');

let totalFixed = 0;
for (const pattern of AI_TEST_PATTERNS) {
  const files = glob.sync(pattern, { cwd: path.join(__dirname, '..') });
  for (const file of files) {
    fixTestFile(path.join(__dirname, '..', file));
    totalFixed++;
  }
}

console.log(`\n✓ Fixed ${totalFixed} AI test files`);
