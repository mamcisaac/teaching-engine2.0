#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseSchedulingCrisis() {
  console.log('🔍 DIAGNOSING EMILY\'S SCHEDULING CRISIS...\n');
  
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.log('❌ Emily not found in database');
      return;
    }
    
    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);
    
    // Get all her long range plans first
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: { userId: emily.id },
      select: { id: true, subject: true, academicYear: true }
    });
    
    console.log(`📚 Emily has ${longRangePlans.length} long range plans:\n`);
    longRangePlans.forEach(lrp => {
      console.log(`  - ${lrp.subject} (${lrp.academicYear}) - ID: ${lrp.id}`);
    });
    
    // Get all unit plans with scheduling details
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        longRangePlan: {
          select: { subject: true }
        }
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });
    
    console.log(`\n📅 SCHEDULING ANALYSIS - Emily has ${unitPlans.length} unit plans:\n`);
    
    // Group by subject for analysis
    const subjectGroups: { [key: string]: any[] } = {};
    
    unitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!subjectGroups[subject]) {
        subjectGroups[subject] = [];
      }
      subjectGroups[subject].push(unit);
    });
    
    // Analyze each subject's scheduling
    const schoolYearStart = new Date('2025-09-04');
    const schoolYearEnd = new Date('2026-06-26');
    
    Object.keys(subjectGroups).forEach(subject => {
      const units = subjectGroups[subject];
      console.log(`\n🎯 ${subject.toUpperCase()} (${units.length} units):`);
      
      units.forEach((unit, index) => {
        const startDate = new Date(unit.startDate);
        const endDate = new Date(unit.endDate);
        const isBeforeYear = startDate < schoolYearStart;
        const isAfterYear = endDate > schoolYearEnd;
        const status = isBeforeYear ? '⚠️ BEFORE YEAR' : isAfterYear ? '🚨 AFTER YEAR' : '✅ OK';
        
        console.log(`  ${index + 1}. "${unit.title}"`);
        console.log(`     📅 ${startDate.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]} ${status}`);
        console.log(`     ⏱️  ${unit.estimatedHours || 'N/A'} hours`);
      });
      
      // Subject summary
      const firstStart = units[0] ? new Date(units[0].startDate) : null;
      const lastEnd = units[units.length - 1] ? new Date(units[units.length - 1].endDate) : null;
      
      if (firstStart && lastEnd) {
        console.log(`   📊 SPAN: ${firstStart.toISOString().split('T')[0]} → ${lastEnd.toISOString().split('T')[0]}`);
        
        if (lastEnd > new Date('2027-01-01')) {
          console.log(`   🚨 CRITICAL: Units extend into 2027!`);
        } else if (lastEnd < new Date('2026-01-01')) {
          console.log(`   ⚠️  WARNING: Units end too early (before 2026)`);
        }
      }
    });
    
    // Overall crisis assessment
    console.log(`\n🎯 CRISIS ASSESSMENT:`);
    
    const unitsInFuture = unitPlans.filter(unit => new Date(unit.endDate) > schoolYearEnd);
    const unitsEndingEarly = unitPlans.filter(unit => new Date(unit.endDate) < new Date('2025-12-01'));
    
    console.log(`   🚨 Units extending beyond school year: ${unitsInFuture.length}`);
    console.log(`   ⚠️  Units ending too early: ${unitsEndingEarly.length}`);
    
    if (unitsInFuture.length > 0) {
      console.log(`\n   UNITS EXTENDING TOO FAR:`);
      unitsInFuture.forEach(unit => {
        const subject = unit.longRangePlan.subject;
        const endDate = new Date(unit.endDate).toISOString().split('T')[0];
        console.log(`     - ${subject}: "${unit.title}" ends ${endDate}`);
      });
    }
    
    console.log(`\n✅ Diagnosis complete. Ready for manual fixes.\n`);
    
  } catch (error) {
    console.error('❌ Error diagnosing:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the diagnosis
diagnoseSchedulingCrisis()
  .then(() => console.log('🔍 Diagnosis completed successfully!'))
  .catch((error) => {
    console.error('💥 Diagnosis failed:', error);
    process.exit(1);
  });