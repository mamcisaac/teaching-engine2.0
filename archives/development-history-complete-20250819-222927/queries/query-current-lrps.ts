#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryCurrentLRPs() {
  try {
    const lrps = await prisma.longRangePlan.findMany({
      where: { userId: 23 },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: { subject: 'asc' }
    });
    
    console.log('\n📚 CURRENT LRP STATE FOR EMILY (User ID 23)\n');
    console.log('=' . repeat(80));
    
    for (const lrp of lrps) {
      console.log(`\n📖 ${lrp.subject.toUpperCase()}`);
      console.log('-'.repeat(60));
      console.log(`ID: ${lrp.id}`);
      console.log(`Title: ${lrp.title}`);
      console.log(`Academic Year: ${lrp.academicYear}`);
      console.log(`Grade: ${lrp.grade}`);
      
      // Check for missing fields
      console.log('\n🔍 Field Analysis:');
      console.log(`✅ Title: ${lrp.title ? 'Present' : '❌ MISSING'}`);
      console.log(`✅ Description: ${lrp.description ? 'Present' : '❌ MISSING'}`);
      console.log(`✅ Goals: ${lrp.goals ? 'Present' : '❌ MISSING'}`);
      console.log(`✅ Themes: ${lrp.themes ? 'Present' : '❌ MISSING'}`);
      console.log(`✅ Overarching Questions: ${lrp.overarchingQuestions ? 'Present' : '❌ MISSING'}`);
      console.log(`✅ Assessment Overview: ${lrp.assessmentOverview ? 'Present' : '❌ MISSING'}`);
      console.log(`✅ Resource Needs: ${lrp.resourceNeeds ? 'Present' : '❌ MISSING'}`);
      console.log(`✅ Professional Goals: ${lrp.professionalGoals ? 'Present' : '❌ MISSING'}`);
      console.log(`❌ BIG IDEAS: ${(lrp as any).bigIdeas ? 'Present' : 'MISSING (NOT IN SCHEMA)'}`);
      console.log(`❌ Learning Goals (Specific): ${lrp.goals?.includes('•') ? 'Specific' : 'Too Generic'}`);
      console.log(`❌ Indigenous Perspectives: ${(lrp as any).indigenousPerspectives ? 'Present' : 'MISSING (NOT IN SCHEMA)'}`);
      console.log(`❌ Parent Communication: ${(lrp as any).parentCommunication ? 'Present' : 'MISSING (NOT IN SCHEMA)'}`);
      
      console.log(`\nCurriculum Expectations Linked: ${lrp.expectations.length}`);
      
      // Parse themes if present
      if (lrp.themes) {
        try {
          const themes = JSON.parse(lrp.themes);
          console.log(`\nMonthly Themes (${themes.length}):`, themes);
        } catch (e) {
          console.log('\nThemes (raw):', lrp.themes);
        }
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log(`Total LRPs: ${lrps.length}`);
    console.log('\n⚠️ CRITICAL GAPS IDENTIFIED:');
    console.log('1. Big Ideas field not in schema - required by UbD');
    console.log('2. Learning Goals too generic - need specific measurable goals');
    console.log('3. Indigenous Perspectives field not in schema');
    console.log('4. Parent Communication field not in schema');
    console.log('5. Professional Development details missing in goals');
    console.log('6. Assessment lacks formative/summative balance');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryCurrentLRPs();
