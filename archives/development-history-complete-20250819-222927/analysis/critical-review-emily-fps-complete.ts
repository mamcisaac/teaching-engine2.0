import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reviewEmilyFPSComplete() {
  console.log('🔍 CRITICAL REVIEW: Emily McIsaac Formation personnelle et sociale System');
  console.log('==================================================================');
  
  try {
    // Get teacher
    const teacher = await prisma.teacher.findFirst({
      where: { name: 'Emily McIsaac' }
    });
    
    if (!teacher) {
      console.log('❌ Teacher Emily McIsaac not found');
      return;
    }
    
    console.log('👩‍🏫 Teacher:', teacher.name, '(ID:', teacher.id + ')');
    
    // Get Long Range Plan
    const lrp = await prisma.longRangePlan.findFirst({
      where: { 
        teacherId: teacher.id,
        subject: 'Formation personnelle et sociale'
      }
    });
    
    console.log('\n📚 LONG RANGE PLAN ANALYSIS');
    console.log('=============================');
    if (lrp) {
      console.log('✅ Title:', lrp.title);
      console.log('✅ Grade:', lrp.grade);
      console.log('✅ Subject:', lrp.subject);
      console.log('✅ Start Date:', lrp.startDate?.toISOString().split('T')[0]);
      console.log('✅ End Date:', lrp.endDate?.toISOString().split('T')[0]);
      console.log('📏 Description Length:', lrp.description?.length || 0, 'chars');
      
      // Check year coverage
      const startDate = lrp.startDate;
      const endDate = lrp.endDate;
      if (startDate && endDate) {
        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        console.log('📅 Duration:', Math.round(duration), 'days');
        
        if (duration < 180) {
          console.log('⚠️  WARNING: LRP duration appears short for full school year');
        }
      }
    } else {
      console.log('❌ NO LONG RANGE PLAN FOUND');
    }
    
    // Get Units
    const units = await prisma.unitPlan.findMany({
      where: {
        teacherId: teacher.id,
        subject: 'Formation personnelle et sociale'
      },
      orderBy: { unitNumber: 'asc' },
      include: {
        lessonPlans: {
          orderBy: { lessonNumber: 'asc' }
        }
      }
    });
    
    console.log('\n🎯 UNIT PLANS ANALYSIS');
    console.log('======================');
    console.log('Total Units Found:', units.length);
    
    let totalLessons = 0;
    let totalHours = 0;
    
    for (const unit of units) {
      console.log(`\n--- UNIT ${unit.unitNumber}: ${unit.title} ---`);
      console.log('📅 Duration:', unit.totalHours, 'hours');
      console.log('📅 Start:', unit.startDate?.toISOString().split('T')[0]);
      console.log('📅 End:', unit.endDate?.toISOString().split('T')[0]);
      console.log('📝 Description Length:', unit.description?.length || 0, 'chars');
      console.log('🎯 Learning Goals Length:', unit.learningGoals?.length || 0, 'chars');
      console.log('📊 Assessment Length:', unit.assessment?.length || 0, 'chars');
      console.log('📚 Lessons:', unit.lessonPlans.length);
      
      totalLessons += unit.lessonPlans.length;
      totalHours += unit.totalHours || 0;
      
      // Check unit progression
      if (unit.unitNumber === 1 && !unit.title.toLowerCase().includes('identity') && !unit.title.toLowerCase().includes('moi')) {
        console.log('⚠️  WARNING: Unit 1 should focus on self-identity');
      }
    }
    
    console.log('\n📊 SYSTEM TOTALS');
    console.log('=================');
    console.log('Total Units:', units.length);
    console.log('Total Lessons:', totalLessons);
    console.log('Total Hours:', totalHours);
    
    // Detailed lesson analysis
    console.log('\n🔬 DETAILED LESSON ANALYSIS');
    console.log('============================');
    
    const lessons = await prisma.lessonPlan.findMany({
      where: {
        unitPlan: {
          teacherId: teacher.id,
          subject: 'Formation personnelle et sociale'
        }
      },
      include: {
        unitPlan: true
      },
      orderBy: [
        { unitPlan: { unitNumber: 'asc' } },
        { lessonNumber: 'asc' }
      ]
    });
    
    console.log('Total Lessons for Analysis:', lessons.length);
    
    let etfoCompliantLessons = 0;
    let durationIssues = 0;
    let structureIssues = 0;
    let differentiationIssues = 0;
    let vocabularyIssues = 0;
    let indigenousIssues = 0;
    let assessmentIssues = 0;
    
    // Sample lesson analysis (first 3 lessons for detailed review)
    for (let i = 0; i < Math.min(3, lessons.length); i++) {
      const lesson = lessons[i];
      console.log(`\n--- SAMPLE LESSON ${i + 1}: Unit ${lesson.unitPlan.unitNumber}, Lesson ${lesson.lessonNumber} ---`);
      console.log('Title:', lesson.title);
      console.log('Duration:', lesson.duration, 'minutes');
      console.log('MindsOn Length:', lesson.mindsOn?.length || 0, 'chars');
      console.log('Action Length:', lesson.action?.length || 0, 'chars');
      console.log('Consolidation Length:', lesson.consolidation?.length || 0, 'chars');
      console.log('Differentiation:', lesson.differentiation ? 'Present' : 'Missing');
      console.log('VocabularyFr:', lesson.vocabularyFr ? JSON.parse(lesson.vocabularyFr).length + ' terms' : 'Missing');
      console.log('Indigenous Perspectives Length:', lesson.indigenousPerspectives?.length || 0, 'chars');
      console.log('Assessment Notes Length:', lesson.assessmentNotes?.length || 0, 'chars');
      
      // Check assessment format
      if (lesson.assessmentNotes) {
        const hasCheckboxes = lesson.assessmentNotes.includes('☐');
        console.log('Assessment Format:', hasCheckboxes ? 'Observable checkboxes ✅' : 'Text format ❌');
      }
    }
    
    // Check all lessons for ETFO compliance
    for (const lesson of lessons) {
      let isCompliant = true;
      
      // Duration check
      if (lesson.duration !== 45) {
        durationIssues++;
        isCompliant = false;
      }
      
      // Structure timing check
      if (!lesson.mindsOn || !lesson.action || !lesson.consolidation) {
        structureIssues++;
        isCompliant = false;
      }
      
      // Differentiation check
      if (!lesson.differentiation) {
        differentiationIssues++;
        isCompliant = false;
      }
      
      // Vocabulary check
      if (!lesson.vocabularyFr) {
        vocabularyIssues++;
        isCompliant = false;
      }
      
      // Indigenous perspectives check
      if (!lesson.indigenousPerspectives || lesson.indigenousPerspectives.length < 100) {
        indigenousIssues++;
        isCompliant = false;
      }
      
      // Assessment format check
      if (!lesson.assessmentNotes || !lesson.assessmentNotes.includes('☐')) {
        assessmentIssues++;
        isCompliant = false;
      }
      
      if (isCompliant) {
        etfoCompliantLessons++;
      }
    }
    
    console.log('\n📊 ETFO COMPLIANCE SUMMARY');
    console.log('===========================');
    console.log('Total Lessons:', lessons.length);
    console.log('ETFO Compliant:', etfoCompliantLessons);
    console.log('Non-Compliant:', lessons.length - etfoCompliantLessons);
    console.log('\nSpecific Issues:');
    console.log('❌ Duration Issues (not 45 min):', durationIssues);
    console.log('❌ Structure Issues (missing components):', structureIssues);
    console.log('❌ Differentiation Missing:', differentiationIssues);
    console.log('❌ French Vocabulary Missing:', vocabularyIssues);
    console.log('❌ Indigenous Perspectives Missing/Short:', indigenousIssues);
    console.log('❌ Assessment Format Issues (no checkboxes):', assessmentIssues);
    
    console.log('\n🏆 COMPLIANCE PERCENTAGE');
    console.log('=========================');
    const complianceRate = lessons.length > 0 ? (etfoCompliantLessons / lessons.length * 100).toFixed(1) : '0';
    console.log('ETFO Compliance Rate:', complianceRate + '%');
    
    if (complianceRate === '0.0') {
      console.log('🚨 CRITICAL: ZERO LESSONS ARE ETFO COMPLIANT');
    } else if (parseFloat(complianceRate) < 50) {
      console.log('🚨 CRITICAL: LESS THAN 50% COMPLIANT');
    } else if (parseFloat(complianceRate) < 80) {
      console.log('⚠️  WARNING: SIGNIFICANT COMPLIANCE ISSUES');
    } else {
      console.log('✅ GOOD: Most lessons are compliant');
    }
    
  } catch (error) {
    console.error('❌ Error during review:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reviewEmilyFPSComplete().catch(console.error);