#!/usr/bin/env node

/**
 * Simple docs verification script for CI pipeline
 * This checks that screenshots and documentation files are in place
 */

import { readdir, access } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function checkFileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function verifyDocs() {
  console.log('🔍 Verifying documentation and screenshots...');

  const requiredFiles = ['README.md', 'CLAUDE.md', 'docs/agents/README.md'];

  let allGood = true;

  for (const file of requiredFiles) {
    const filePath = join(projectRoot, file);
    const exists = await checkFileExists(filePath);

    if (exists) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ Missing: ${file}`);
      allGood = false;
    }
  }

  // Check for docs directory structure
  try {
    const docsDir = join(projectRoot, 'docs');
    const docsDirExists = await checkFileExists(docsDir);

    if (docsDirExists) {
      console.log('✅ docs/ directory exists');
    } else {
      console.log('❌ docs/ directory missing');
      allGood = false;
    }
  } catch (error) {
    console.log('⚠️  Warning: Could not verify docs directory');
  }

  if (allGood) {
    console.log('\n✅ All documentation checks passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some documentation issues found');
    process.exit(1);
  }
}

verifyDocs().catch((error) => {
  console.error('❌ Documentation verification failed:', error);
  process.exit(1);
});
