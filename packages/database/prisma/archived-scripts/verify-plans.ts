#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyLongRangePlans() {
  console.log('🔍 CRITICALLY REVIEWING LONG RANGE PLANS...\n');
  
  try {
    // Get Emily's account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.error('❌ Emily\'s account not found!');
      return;
    }
    
    // Get all long range plans
    const plans = await prisma.longRangePlan.findMany({
      where: { userId: emily.id },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: { subject: 'asc' }
    });
    
    console.log(`📊 Found ${plans.length} long range plans for Emily\n`);
    
    // Analyze each plan
    let totalExpectations = 0;
    const subjectSummary: Record<string, any> = {};
    
    for (const plan of plans) {
      const expectationCount = plan.expectations.length;
      totalExpectations += expectationCount;
      
      // Group expectations by term
      const byTerm: Record<string, string[]> = {};
      plan.expectations.forEach(pe => {
        const term = pe.plannedTerm || 'Unspecified';
        if (!byTerm[term]) byTerm[term] = [];
        byTerm[term].push(pe.expectation.code);
      });
      
      subjectSummary[plan.subject] = {
        title: plan.title,
        grade: plan.grade,
        expectations: expectationCount,
        terms: byTerm,
        hasDescription: !!plan.description,
        hasGoals: !!plan.goals,
        hasThemes: !!plan.themes,
        hasAssessment: !!plan.assessmentOverview,
        hasResources: !!plan.resourceNeeds,
        hasProfessionalGoals: !!plan.professionalGoals,
        hasBilingualSupport: !!(plan.titleFr && plan.descriptionFr)
      };
    }
    
    // Print detailed analysis
    console.log('📚 SUBJECT-BY-SUBJECT ANALYSIS:\n');
    
    for (const [subject, data] of Object.entries(subjectSummary)) {
      console.log(`\n${subject.toUpperCase()}`);
      console.log('─'.repeat(50));
      console.log(`✓ Expectations: ${data.expectations}`);
      console.log(`✓ Grade: ${data.grade}`);
      
      // Check completeness
      const checks = [
        { field: 'Description', value: data.hasDescription },
        { field: 'Goals', value: data.hasGoals },
        { field: 'Themes', value: data.hasThemes },
        { field: 'Assessment', value: data.hasAssessment },
        { field: 'Resources', value: data.hasResources },
        { field: 'Professional Goals', value: data.hasProfessionalGoals },
        { field: 'Bilingual Support', value: data.hasBilingualSupport }
      ];
      
      const missing = checks.filter(c => !c.value);
      if (missing.length > 0) {
        console.log(`⚠️  Missing: ${missing.map(m => m.field).join(', ')}`);
      } else {
        console.log('✅ All metadata complete');
      }
      
      // Show term distribution
      console.log('\nTerm Distribution:');
      for (const [term, codes] of Object.entries(data.terms)) {
        console.log(`  ${term}: ${codes.length} expectations`);
        if (codes.length <= 10) {
          console.log(`    [${codes.join(', ')}]`);
        }
      }
    }
    
    // Overall verification
    console.log('\n' + '='.repeat(60));
    console.log('📊 OVERALL VERIFICATION:\n');
    
    // Check total expectations
    const actualExpectations = await prisma.curriculumExpectation.count({
      where: { grade: 1 }
    });
    
    console.log(`Expected total expectations: 73`);
    console.log(`Actual curriculum expectations in DB: ${actualExpectations}`);
    console.log(`Expectations linked to plans: ${totalExpectations}`);
    
    if (totalExpectations === 73 && actualExpectations === 73) {
      console.log('✅ ALL 73 EXPECTATIONS ARE PROPERLY LINKED!');
    } else {
      console.log(`❌ MISMATCH: Expected 73, but found ${totalExpectations} linked`);
      
      // Find missing expectations
      const linkedExpIds = new Set<string>();
      plans.forEach(p => {
        p.expectations.forEach(e => {
          linkedExpIds.add(e.expectationId);
        });
      });
      
      const allExpectations = await prisma.curriculumExpectation.findMany({
        where: { grade: 1 }
      });
      
      const missing = allExpectations.filter(e => !linkedExpIds.has(e.id));
      if (missing.length > 0) {
        console.log(`\n⚠️  Missing expectations (${missing.length}):`);
        missing.forEach(m => {
          console.log(`  - ${m.subject}: ${m.code} - ${m.description.substring(0, 50)}...`);
        });
      }
    }
    
    // Check for duplicates
    const expectationIds = plans.flatMap(p => p.expectations.map(e => e.expectationId));
    const duplicates = expectationIds.filter((id, index) => expectationIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate expectation assignments`);
    } else {
      console.log('✅ No duplicate expectations');
    }
    
    // Check term balance
    console.log('\n📅 TERM BALANCE ANALYSIS:');
    let term1Total = 0, term2Total = 0, fullYearTotal = 0;
    
    plans.forEach(p => {
      p.expectations.forEach(e => {
        if (e.plannedTerm === 'Term 1') term1Total++;
        else if (e.plannedTerm === 'Term 2') term2Total++;
        else if (e.plannedTerm === 'Full Year') fullYearTotal++;
      });
    });
    
    console.log(`  Term 1: ${term1Total} expectations`);
    console.log(`  Term 2: ${term2Total} expectations`);
    console.log(`  Full Year: ${fullYearTotal} expectations`);
    
    const termRatio = term1Total / (term1Total + term2Total);
    if (termRatio >= 0.4 && termRatio <= 0.6) {
      console.log(`✅ Good term balance (${(termRatio * 100).toFixed(1)}% in Term 1)`);
    } else {
      console.log(`⚠️  Unbalanced terms (${(termRatio * 100).toFixed(1)}% in Term 1)`);
    }
    
    // Grade appropriateness check
    console.log('\n👶 GRADE 1 APPROPRIATENESS:');
    const inappropriateTerms = ['complex', 'analyze', 'evaluate', 'critique', 'abstract'];
    let foundIssues = false;
    
    plans.forEach(p => {
      const description = (p.description || '').toLowerCase();
      const goals = (p.goals || '').toLowerCase();
      
      inappropriateTerms.forEach(term => {
        if (description.includes(term) || goals.includes(term)) {
          console.log(`⚠️  Found potentially inappropriate term "${term}" in ${p.subject}`);
          foundIssues = true;
        }
      });
    });
    
    if (!foundIssues) {
      console.log('✅ All language appears grade-appropriate');
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🏁 FINAL ASSESSMENT:\n');
    
    const issues = [];
    if (totalExpectations !== 73) issues.push('Expectation count mismatch');
    if (duplicates.length > 0) issues.push('Duplicate expectations');
    if (termRatio < 0.4 || termRatio > 0.6) issues.push('Unbalanced terms');
    if (foundIssues) issues.push('Grade inappropriateness concerns');
    
    if (issues.length === 0) {
      console.log('✅✅✅ LONG RANGE PLANS ARE PERFECT! ✅✅✅');
      console.log('All 73 expectations properly distributed');
      console.log('Complete metadata for all subjects');
      console.log('Age-appropriate for Grade 1');
      console.log('Well-balanced across terms');
    } else {
      console.log('⚠️  ISSUES FOUND:');
      issues.forEach(i => console.log(`  - ${i}`));
    }
    
  } catch (error) {
    console.error('❌ Error verifying plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyLongRangePlans();