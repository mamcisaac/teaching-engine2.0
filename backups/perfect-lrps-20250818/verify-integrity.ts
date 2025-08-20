#!/usr/bin/env tsx
// Verification script for perfect LRPs
// Generated: 2025-08-18T12:50:32.782Z

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

async function verifyLRPIntegrity() {
  console.log('🔍 Verifying LRP integrity...');
  
  const checksums = JSON.parse(readFileSync('./checksums.json', 'utf-8'));
  let allPerfect = true;
  
  for (const [subject, data] of Object.entries(checksums)) {
    const lrp = await prisma.longRangePlan.findUnique({
      where: { id: data.id }
    });
    
    const hash = createHash('sha256');
    hash.update(JSON.stringify({
      id: lrp.id,
      subject: lrp.subject,
      goals: lrp.goals,
      yearlyTransferGoals: lrp.yearlyTransferGoals,
      assessmentOverview: lrp.assessmentOverview
    }));
    
    const currentHash = hash.digest('hex');
    if (currentHash !== data.hash) {
      console.error('❌ INTEGRITY VIOLATION:', subject);
      console.error('  Expected:', data.hash);
      console.error('  Got:', currentHash);
      allPerfect = false;
    } else {
      console.log('✅', subject, '- Integrity verified');
    }
  }
  
  if (allPerfect) {
    console.log('
✅ ALL LRPs maintain perfect integrity!');
  } else {
    console.log('
⚠️ CRITICAL: Some LRPs have been modified!');
    console.log('Restore from backup immediately!');
  }
}

verifyLRPIntegrity()
  .then(() => prisma.$disconnect())
  .catch(console.error);
