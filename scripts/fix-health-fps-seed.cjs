#!/usr/bin/env node

/**
 * Fix Health/FPS seed to remove invalid fields
 */

const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../packages/database/prisma/seed-health-fps-comprehensive-36-lessons.ts');
let content = fs.readFileSync(seedPath, 'utf8');

// Remove invalid fields from lesson definitions
const fieldsToRemove = [
  'crossCurricular',
  'homeConnection', 
  'socialEmotionalLearning'
];

for (const field of fieldsToRemove) {
  // Remove field lines
  const patterns = [
    new RegExp(`^\\s*${field}:.*$`, 'gm'),
    new RegExp(`^\\s*${field}:.*,\\s*$`, 'gm')
  ];
  
  for (const pattern of patterns) {
    if (content.match(pattern)) {
      content = content.replace(pattern, '');
      console.log(`✓ Removed ${field} field`);
    }
  }
}

// Clean up any trailing commas
content = content.replace(/,(\s*\n\s*})/g, '$1');

// Clean up double blank lines
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(seedPath, content);
console.log('✅ Fixed Health/FPS seed file');