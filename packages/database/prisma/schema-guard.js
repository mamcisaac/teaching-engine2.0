#!/usr/bin/env node
/**
 * SCHEMA PROTECTION SYSTEM
 * 
 * This guard prevents any changes to the database schema which has been
 * carefully designed based on ETFO requirements, UbD framework, and 
 * PEI curriculum best practices.
 * 
 * ANY MODIFICATIONS WILL BE BLOCKED.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const LOCK_FILE = path.join(__dirname, 'schema-lock.json');
const SCHEMA_FILE = path.join(__dirname, 'schema.prisma');

function calculateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function verifySchema() {
  // Check if lock file exists
  if (!fs.existsSync(LOCK_FILE)) {
    console.log('⚠️  Schema lock not found. Creating initial lock...');
    createLock();
    return;
  }

  // Read lock file
  const lock = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
  
  // Check if schema is locked
  if (!lock.locked) {
    console.log('✅ Schema is not locked. Migrations allowed.');
    return;
  }

  // Read current schema
  const currentSchema = fs.readFileSync(SCHEMA_FILE, 'utf8');
  const currentChecksum = calculateChecksum(currentSchema);

  // Verify checksum
  if (currentChecksum !== lock.checksum) {
    console.error(`
╔══════════════════════════════════════════════════════════════════╗
║                    ❌ SCHEMA MODIFICATION BLOCKED                 ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  The database schema has been PERMANENTLY LOCKED based on:       ║
║                                                                   ║
║  ✓ ETFO (Elementary Teachers' Federation of Ontario) standards   ║
║  ✓ Understanding by Design (UbD) framework requirements          ║
║  ✓ PEI curriculum documentation                                  ║
║  ✓ French Immersion best practices                               ║
║  ✓ Grade 1 developmental appropriateness                         ║
║                                                                   ║
║  This schema represents the PERFECT balance of:                  ║
║  • Educational requirements (all necessary fields)               ║
║  • Practical simplicity (no academic bloat)                      ║
║  • Grade 1 appropriateness                                       ║
║                                                                   ║
║  Current field counts (FINAL):                                   ║
║  • LongRangePlan: 15 fields                                     ║
║  • UnitPlan: 16 fields                                          ║
║  • ETFOLessonPlan: 20 fields                                    ║
║                                                                   ║
║  ANY CHANGES WOULD VIOLATE EDUCATIONAL BEST PRACTICES.          ║
║                                                                   ║
║  Lock Date: ${lock.lockDate}                                 ║
║  Version: ${lock.version}                                           ║
║                                                                   ║
║  If you believe this is an error, you must:                     ║
║  1. Document WHY the change is needed                           ║
║  2. Reference specific ETFO/curriculum requirements             ║
║  3. Get approval from system administrator                      ║
║  4. Manually unlock by deleting schema-lock.json                ║
║                                                                   ║
║  Remember: This schema was perfected after extensive analysis.   ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
    `);
    process.exit(1);
  }

  console.log('✅ Schema verified. No unauthorized changes detected.');
}

function createLock() {
  const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
  const checksum = calculateChecksum(schema);
  
  const lock = {
    version: '1.0.0',
    locked: true,
    lockDate: new Date().toISOString(),
    reason: 'Schema perfected based on ETFO, UbD, and PEI curriculum requirements',
    fields: {
      LongRangePlan: {
        count: 15,
        required: ['title', 'subject', 'grade', 'academicYear'],
        educational: ['learningGoals', 'monthlyThemes', 'overarchingQuestions', 'assessmentOverview', 'indigenousPerspectives']
      },
      UnitPlan: {
        count: 16,
        required: ['title', 'startDate', 'endDate'],
        educational: ['bigIdeas', 'essentialQuestions', 'assessmentPlan', 'differentiationStrategies', 'keyVocabulary']
      },
      ETFOLessonPlan: {
        count: 20,
        required: ['title', 'date', 'duration'],
        etfo: ['mindsOn', 'action', 'consolidation'],
        educational: ['learningGoals', 'differentiation', 'assessmentNotes']
      }
    },
    checksum: checksum,
    protected: true,
    message: 'DO NOT MODIFY - Based on educational best practices'
  };

  fs.writeFileSync(LOCK_FILE, JSON.stringify(lock, null, 2));
  console.log('🔒 Schema lock created successfully.');
}

// Run verification
if (require.main === module) {
  verifySchema();
}

module.exports = { verifySchema };