#!/usr/bin/env node

/**
 * Fix Music seed to remove curriculumExpectations field
 */

const fs = require('fs');
const path = require('path');

const musicSeedPath = path.join(__dirname, '../packages/database/prisma/seed-music-lessons-comprehensive-72.ts');
let content = fs.readFileSync(musicSeedPath, 'utf8');

// Remove curriculumExpectations lines from lesson definitions
content = content.replace(/^\s*curriculumExpectations:.*$/gm, '');

// Clean up any trailing commas
content = content.replace(/,(\s*\n\s*})/g, '$1');

// Remove from the create statement if it exists
content = content.replace(/curriculumExpectations:\s*lesson\.curriculumExpectations,?\s*/g, '');

fs.writeFileSync(musicSeedPath, content);
console.log('✅ Fixed Music seed file - removed curriculumExpectations field');