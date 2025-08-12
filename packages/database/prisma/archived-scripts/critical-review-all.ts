#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalReviewAll() {
  console.log('🔍 COMPREHENSIVE CRITICAL REVIEW OF ALL UNIT PLANS\n');
  
  try {
    const emily = await prisma.user.findUnique({ 
      where: { email: 'emmcisaac@gmail.com' } 
    });
    
    if (!emily) {
      console.error('❌ Emily not found');
      return;
    }
    
    // Get all unit plans
    const allUnits = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { 
        longRangePlan: true,
        expectations: { 
          include: { expectation: true } 
        } 
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('='.repeat(60));
    console.log('CRITICAL ISSUES TO CHECK:');
    console.log('='.repeat(60) + '\n');
    
    const issues = [];
    
    // 1. CHECK TOTAL WEEKLY HOURS
    console.log('1. WEEKLY HOURS BURDEN CHECK:\n');
    
    const bySubject: { [key: string]: any[] } = {};
    allUnits.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!bySubject[subject]) bySubject[subject] = [];
      bySubject[subject].push(unit);
    });
    
    let totalWeeklyHours = 0;
    Object.entries(bySubject).forEach(([subject, units]) => {
      const totalHours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
      const weeklyHours = totalHours / 42;
      totalWeeklyHours += weeklyHours;
      console.log(`${subject}: ${weeklyHours.toFixed(1)} hours/week`);
    });
    
    console.log(`\nTOTAL: ${totalWeeklyHours.toFixed(1)} hours/week for 3 subjects`);
    
    if (totalWeeklyHours > 15) {
      issues.push(`Core subjects taking ${totalWeeklyHours.toFixed(1)} hours/week - too much!`);
    }
    
    // 2. CHECK FOR SAME-WEEK ASSESSMENTS
    console.log('\n2. ASSESSMENT OVERLOAD CHECK:\n');
    
    const assessmentWeeks = new Map<string, string[]>();
    
    allUnits.forEach(unit => {
      const endWeek = getWeekString(unit.endDate);
      const subject = unit.longRangePlan.subject;
      
      if (unit.assessmentPlan?.includes('portfolio') || 
          unit.assessmentPlan?.includes('presentation') ||
          unit.assessmentPlan?.includes('culminating')) {
        if (!assessmentWeeks.has(endWeek)) {
          assessmentWeeks.set(endWeek, []);
        }
        assessmentWeeks.get(endWeek)!.push(subject);
      }
    });
    
    assessmentWeeks.forEach((subjects, week) => {
      if (subjects.length > 2) {
        console.log(`⚠️ Week of ${week}: ${subjects.length} major assessments!`);
        issues.push(`Assessment overload in week of ${week}`);
      }
    });
    
    // 3. CHECK FOR UNREALISTIC EXPECTATIONS
    console.log('\n3. GRADE 1 REALITY CHECK:\n');
    
    const realityChecks = {
      'Portfolio conferences': 0,
      'Presentations': 0,
      'Parent communications': 0,
      'Community connections': 0,
      'Field trips': 0
    };
    
    allUnits.forEach(unit => {
      const plan = unit.assessmentPlan || '';
      const community = unit.communityConnections || '';
      
      if (plan.includes('portfolio')) realityChecks['Portfolio conferences']++;
      if (plan.includes('presentation')) realityChecks['Presentations']++;
      if (unit.parentCommunicationPlan) realityChecks['Parent communications']++;
      if (community.includes('visit')) realityChecks['Community connections']++;
      if (community.includes('trip') || community.includes('tour')) realityChecks['Field trips']++;
    });
    
    Object.entries(realityChecks).forEach(([item, count]) => {
      console.log(`${item}: ${count} times/year`);
      if (item === 'Field trips' && count > 6) {
        issues.push(`Too many field trips planned (${count})`);
      }
      if (item === 'Parent communications' && count > 25) {
        issues.push(`Parent communication overload (${count} planned communications)`);
      }
    });
    
    // 4. CHECK VOCABULARY LOAD
    console.log('\n4. VOCABULARY LOAD CHECK:\n');
    
    let totalVocab = 0;
    Object.entries(bySubject).forEach(([subject, units]) => {
      let subjectVocab = 0;
      units.forEach(unit => {
        try {
          const vocab = JSON.parse(unit.keyVocabulary || '[]');
          subjectVocab += vocab.length;
        } catch {}
      });
      console.log(`${subject}: ~${subjectVocab} new words`);
      totalVocab += subjectVocab;
    });
    
    console.log(`\nTOTAL: ~${totalVocab} new French words across 3 subjects`);
    const wordsPerWeek = Math.round(totalVocab / 42);
    console.log(`Average: ${wordsPerWeek} new words per week`);
    
    if (wordsPerWeek > 20) {
      issues.push(`Vocabulary overload: ${wordsPerWeek} new words/week`);
    }
    
    // 5. CHECK FOR TIMELINE CONFLICTS
    console.log('\n5. TIMELINE CONFLICTS CHECK:\n');
    
    // Group units by week
    const weekMap = new Map<string, any[]>();
    
    allUnits.forEach(unit => {
      const startWeek = getWeekString(unit.startDate);
      const endWeek = getWeekString(unit.endDate);
      
      // Check if multiple subjects starting new units same week
      if (!weekMap.has(startWeek)) weekMap.set(startWeek, []);
      weekMap.get(startWeek)!.push({
        subject: unit.longRangePlan.subject,
        type: 'START',
        title: unit.titleFr
      });
      
      if (!weekMap.has(endWeek)) weekMap.set(endWeek, []);
      weekMap.get(endWeek)!.push({
        subject: unit.longRangePlan.subject,
        type: 'END',
        title: unit.titleFr
      });
    });
    
    let conflictCount = 0;
    weekMap.forEach((events, week) => {
      const starts = events.filter(e => e.type === 'START');
      const ends = events.filter(e => e.type === 'END');
      
      if (starts.length > 2) {
        console.log(`⚠️ Week of ${week}: ${starts.length} units starting!`);
        conflictCount++;
      }
      if (ends.length > 2) {
        console.log(`⚠️ Week of ${week}: ${ends.length} units ending!`);
        conflictCount++;
      }
    });
    
    if (conflictCount > 5) {
      issues.push(`Too many timeline conflicts (${conflictCount} weeks with 3+ transitions)`);
    }
    
    // 6. CHECK FOR 6-YEAR-OLD APPROPRIATENESS
    console.log('\n6. AGE APPROPRIATENESS CHECK:\n');
    
    const inappropriateTerms = [
      'analyze', 'synthesize', 'evaluate', 'abstract', 'complex',
      'research project', 'essay', 'report', 'hypothesis'
    ];
    
    let inappropriateCount = 0;
    allUnits.forEach(unit => {
      const content = JSON.stringify(unit).toLowerCase();
      inappropriateTerms.forEach(term => {
        if (content.includes(term)) {
          inappropriateCount++;
          console.log(`⚠️ Found "${term}" in ${unit.longRangePlan.subject} - ${unit.titleFr}`);
        }
      });
    });
    
    if (inappropriateCount > 0) {
      issues.push(`Found ${inappropriateCount} potentially inappropriate terms for Grade 1`);
    }
    
    // 7. CHECK FOR DECEMBER/JUNE OVERLOAD
    console.log('\n7. DECEMBER/JUNE REALITY CHECK:\n');
    
    const decemberUnits = allUnits.filter(u => 
      u.endDate >= new Date('2024-12-15') && 
      u.endDate <= new Date('2024-12-20')
    );
    
    const juneUnits = allUnits.filter(u => 
      u.endDate >= new Date('2025-06-15') && 
      u.endDate <= new Date('2025-06-20')
    );
    
    console.log(`Units ending in December: ${decemberUnits.length}`);
    console.log(`Units ending in June: ${juneUnits.length}`);
    
    if (decemberUnits.length > 2) {
      issues.push(`December overload: ${decemberUnits.length} units ending before break`);
    }
    if (juneUnits.length > 2) {
      issues.push(`June overload: ${juneUnits.length} units ending at year-end`);
    }
    
    // FINAL VERDICT
    console.log('\n' + '='.repeat(60));
    console.log('🏁 CRITICAL REVIEW VERDICT:');
    console.log('='.repeat(60) + '\n');
    
    if (issues.length === 0) {
      console.log('✅✅✅ ALL PLANS ARE PERFECT! ✅✅✅');
      console.log('- Appropriate weekly hours');
      console.log('- Balanced assessment');
      console.log('- Realistic expectations');
      console.log('- Age-appropriate content');
      console.log('- No major conflicts');
    } else {
      console.log('❌ CRITICAL ISSUES FOUND:\n');
      issues.forEach(issue => console.log(`  - ${issue}`));
      
      console.log('\n📝 FIXES REQUIRED:');
      if (totalWeeklyHours > 12) {
        console.log('  - Reduce core subject hours');
      }
      if (wordsPerWeek > 20) {
        console.log('  - Reduce vocabulary in some units');
      }
      if (conflictCount > 5) {
        console.log('  - Stagger unit transitions');
      }
      if (inappropriateCount > 0) {
        console.log('  - Simplify language for Grade 1');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getWeekString(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const firstDay = new Date(year, month, day - date.getDay());
  return `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`;
}

// Run the review
criticalReviewAll();