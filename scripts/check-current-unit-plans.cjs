#!/usr/bin/env node
/**
 * Check what unit plans are currently in the database
 */

const { PrismaClient } = require('@teaching-engine/database');

async function checkCurrentUnitPlans() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking current unit plans in database...\n');
    
    // Get all unit plans with their expectations
    const unitPlans = await prisma.unitPlan.findMany({
      include: {
        longRangePlan: {
          select: {
            subject: true,
            title: true
          }
        },
        expectations: {
          include: {
            expectation: {
              select: {
                code: true,
                description: true,
                subject: true
              }
            }
          }
        }
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });
    
    console.log(`📊 Found ${unitPlans.length} unit plans in database\n`);
    
    // Group by subject
    const bySubject = {};
    for (const unit of unitPlans) {
      const subject = unit.longRangePlan.subject;
      if (!bySubject[subject]) {
        bySubject[subject] = [];
      }
      bySubject[subject].push(unit);
    }
    
    // Show summary
    for (const [subject, units] of Object.entries(bySubject)) {
      console.log(`📚 ${subject}: ${units.length} units`);
      
      for (const unit of units.slice(0, 3)) { // Show first 3 units per subject
        const expectationCount = unit.expectations.length;
        const expectationCodes = unit.expectations.map(e => e.expectation.code).join(', ');
        
        console.log(`  📝 "${unit.title}"`);
        console.log(`     Expectations: ${expectationCount} (${expectationCodes || 'none'})`);
        console.log(`     Dates: ${unit.startDate?.toISOString().split('T')[0]} to ${unit.endDate?.toISOString().split('T')[0]}`);
        console.log('');
      }
      
      if (units.length > 3) {
        console.log(`     ... and ${units.length - 3} more units\n`);
      }
    }
    
    // Check for missing expectations
    const unitsWithoutExpectations = unitPlans.filter(u => u.expectations.length === 0);
    if (unitsWithoutExpectations.length > 0) {
      console.log(`⚠️  ${unitsWithoutExpectations.length} units have NO expectations mapped:`);
      for (const unit of unitsWithoutExpectations.slice(0, 5)) {
        console.log(`   - ${unit.title} (${unit.longRangePlan.subject})`);
      }
      if (unitsWithoutExpectations.length > 5) {
        console.log(`   ... and ${unitsWithoutExpectations.length - 5} more`);
      }
      console.log('');
    }
    
    // Show first unit with expectations as example
    const unitWithExpectations = unitPlans.find(u => u.expectations.length > 0);
    if (unitWithExpectations) {
      console.log('✅ Example unit WITH expectations:');
      console.log(`   Title: ${unitWithExpectations.title}`);
      console.log(`   Subject: ${unitWithExpectations.longRangePlan.subject}`);
      console.log(`   Expectations:`);
      for (const exp of unitWithExpectations.expectations) {
        console.log(`     - ${exp.expectation.code}: ${exp.expectation.description.slice(0, 60)}...`);
      }
    } else {
      console.log('❌ NO units have expectations mapped!');
    }
    
  } catch (error) {
    console.error('❌ Error checking unit plans:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentUnitPlans();